const express = require('express');
const cors = require('cors');
const multer = require('multer');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

// Use the official new package name
const makeWASocket = require('baileys').default;
const {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    delay,
    Browsers,
} = require('baileys');
const { Boom } = require('@hapi/boom');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// ─── State ────────────────────────────────────────────────────────────────────
let qrCodeData   = null;
let qrTimestamp  = 0;
let clientStatus = 'STARTING';
let waSocket     = null;
let isConnecting = false;

const SESSION_DIR = path.join(__dirname, 'wa-session');

function clearSession() {
    try {
        if (fs.existsSync(SESSION_DIR)) fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    } catch (_) {}
}

async function connectToWhatsApp(clearFirst = false) {
    if (isConnecting) return;
    isConnecting = true;
    if (clearFirst) clearSession();

    clientStatus = 'STARTING';
    qrCodeData   = null;

    try {
        if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
        const { version } = await fetchLatestBaileysVersion();
        console.log('[whatsapp] Using WA version:', version.join('.'));

        const sock = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS('Desktop'),
            connectTimeoutMs: 60_000,
            defaultQueryTimeoutMs: 60_000,
            keepAliveIntervalMs: 15_000,
            syncFullHistory: false,
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: false,
            getMessage: async () => undefined,
        });

        waSocket = sock;

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                try {
                    qrCodeData   = await qrcode.toDataURL(qr);
                    qrTimestamp  = Date.now();
                    clientStatus = 'WAITING_FOR_SCAN';
                    console.log('[whatsapp] Fresh QR generated at', new Date().toISOString());
                } catch (e) {
                    console.error('[whatsapp] QR error:', e.message);
                }
            }

            if (connection === 'connecting') {
                console.log('[whatsapp] Connecting...');
                if (clientStatus !== 'WAITING_FOR_SCAN') clientStatus = 'STARTING';
            }

            if (connection === 'open') {
                clientStatus = 'CONNECTED';
                qrCodeData   = null;
                isConnecting = false;
                console.log('[whatsapp] ✅ Connected! User:', sock.user?.id);
            }

            if (connection === 'close') {
                isConnecting = false;
                const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
                const errMsg = lastDisconnect?.error?.message || '';
                console.log('[whatsapp] Closed. Code:', statusCode, errMsg);

                if (statusCode === DisconnectReason.loggedOut ||
                    statusCode === DisconnectReason.multideviceMismatch) {
                    console.log('[whatsapp] Logged out — clearing session.');
                    clientStatus = 'DISCONNECTED';
                    qrCodeData   = null;
                    clearSession();
                    await delay(2000);
                    connectToWhatsApp(false);
                } else if (statusCode === DisconnectReason.connectionReplaced) {
                    console.log('[whatsapp] Connection replaced.');
                    clientStatus = 'DISCONNECTED';
                } else {
                    clientStatus = 'STARTING';
                    qrCodeData   = null;
                    await delay(4000);
                    connectToWhatsApp(false);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (err) {
        console.error('[whatsapp] Error:', err.message);
        isConnecting = false;
        clientStatus = 'STARTING';
        await delay(5000);
        connectToWhatsApp(false);
    }
}

connectToWhatsApp();

// ─── Medicine Database ─────────────────────────────────────────────────────────
const MEDICINES = JSON.parse(fs.readFileSync(path.join(__dirname, 'medicines.json'), 'utf-8'));

app.get('/api/medicines/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q || q.length < 2) return res.json([]);
    const results = MEDICINES.filter(m =>
        m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    ).slice(0, 20);
    res.json(results);
});

app.get('/api/medicines/categories', (req, res) => {
    res.json([...new Set(MEDICINES.map(m => m.category))].sort());
});

// ─── WhatsApp Routes ──────────────────────────────────────────────────────────
app.get('/api/whatsapp/status', (req, res) => {
    const qrAge = qrCodeData ? Math.floor((Date.now() - qrTimestamp) / 1000) : null;
    let info = null;
    if (clientStatus === 'CONNECTED' && waSocket?.user) {
        info = { pushname: waSocket.user.name, wid: { user: waSocket.user.id?.split(':')[0] } };
    }
    res.json({ status: clientStatus, qr: qrCodeData, qrAge, percent: 0, info });
});

app.post('/api/whatsapp/restart', async (req, res) => {
    try {
        res.json({ success: true, message: 'Restarting...' });
        if (waSocket) { try { waSocket.end(undefined); } catch (_) {} }
        waSocket = null; isConnecting = false;
        clientStatus = 'STARTING'; qrCodeData = null;
        clearSession();
        await delay(1500);
        connectToWhatsApp(false);
    } catch (_) {}
});

app.post('/api/whatsapp/logout', async (req, res) => {
    try {
        if (waSocket && clientStatus === 'CONNECTED') {
            try { await waSocket.logout(); } catch (_) {}
        } else if (waSocket) {
            try { waSocket.end(undefined); } catch (_) {}
        }
        waSocket = null; isConnecting = false;
        clientStatus = 'DISCONNECTED'; qrCodeData = null;
        clearSession();
        res.json({ success: true });
        await delay(1500);
        connectToWhatsApp(false);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/whatsapp/send-message', async (req, res) => {
    try {
        if (clientStatus !== 'CONNECTED' || !waSocket)
            return res.status(400).json({ success: false, error: 'WhatsApp not connected' });
        let p = (req.body.phone || '').replace(/\D/g, '');
        if (p.length === 10) p = '91' + p;
        await waSocket.sendMessage(p + '@s.whatsapp.net', { text: req.body.message });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/whatsapp/send-pdf', upload.single('pdf'), async (req, res) => {
    const filePath = req.file ? path.join(__dirname, req.file.path) : null;
    try {
        if (clientStatus !== 'CONNECTED' || !waSocket) {
            if (filePath) fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, error: 'WhatsApp not connected' });
        }
        let p = (req.body.phone || '').replace(/\D/g, '');
        if (p.length === 10) p = '91' + p;
        const buffer = fs.readFileSync(filePath);
        await waSocket.sendMessage(p + '@s.whatsapp.net', {
            document: buffer,
            mimetype: 'application/pdf',
            fileName: req.body.filename || 'Prescription.pdf',
            caption: req.body.message || '',
        });
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } catch (err) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`[server] Running on http://0.0.0.0:${PORT}`));
