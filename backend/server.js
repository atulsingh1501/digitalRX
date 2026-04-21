const express = require('express');
const cors = require('cors');
const multer = require('multer');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

// Baileys — no Chrome/Puppeteer needed, works on any server
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    MessageMedia,
    downloadMediaMessage,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// ─── State ────────────────────────────────────────────────────────────────────
let qrCodeData  = null;
let waSocket    = null;
let clientStatus = 'STARTING';
let syncPercent  = 0;

const SESSION_DIR = path.join(__dirname, 'wa-session');

// ─── Baileys Connection ───────────────────────────────────────────────────────
async function connectToWhatsApp() {
    clientStatus = 'STARTING';
    qrCodeData   = null;

    if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }), // suppress noisy logs
        printQRInTerminal: false,
        browser: ['Digital Rx', 'Chrome', '1.0'],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        // Reduce memory usage
        msgRetryCounterCache: undefined,
        getMessage: async () => ({ conversation: '' }),
    });

    waSocket = sock;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate QR as base64 image for the frontend
            clientStatus = 'WAITING_FOR_SCAN';
            qrCodeData   = await qrcode.toDataURL(qr);
            console.log('[whatsapp] QR Code generated.');
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log('[whatsapp] Connection closed. Reason:', reason);

            qrCodeData = null;

            if (reason === DisconnectReason.loggedOut) {
                // Phone logged out — clear session and get fresh QR
                console.log('[whatsapp] Logged out. Clearing session...');
                clientStatus = 'DISCONNECTED';
                clearSession();
                setTimeout(connectToWhatsApp, 2000);
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log('[whatsapp] Connection replaced by another session.');
                clientStatus = 'DISCONNECTED';
            } else {
                // Reconnect for all other reasons
                clientStatus = 'STARTING';
                setTimeout(connectToWhatsApp, 3000);
            }
        }

        if (connection === 'connecting') {
            if (clientStatus !== 'WAITING_FOR_SCAN') {
                clientStatus = 'STARTING';
            }
        }

        if (connection === 'open') {
            clientStatus = 'CONNECTED';
            qrCodeData   = null;
            syncPercent  = 0;
            console.log('[whatsapp] Connected! Ready to send messages.');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

function clearSession() {
    try {
        if (fs.existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        }
    } catch (_) {}
}

// Boot WhatsApp
connectToWhatsApp().catch(err => {
    console.error('[whatsapp] Boot error:', err.message);
    setTimeout(connectToWhatsApp, 5000);
});

// ─── Medicine Database ─────────────────────────────────────────────────────────
const MEDICINES = JSON.parse(fs.readFileSync(path.join(__dirname, 'medicines.json'), 'utf-8'));

app.get('/api/medicines/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q || q.length < 2) return res.json([]);
    const results = MEDICINES.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    ).slice(0, 20);
    res.json(results);
});

app.get('/api/medicines/categories', (req, res) => {
    const cats = [...new Set(MEDICINES.map(m => m.category))].sort();
    res.json(cats);
});

// ─── WhatsApp Routes ──────────────────────────────────────────────────────────
app.get('/api/whatsapp/status', (req, res) => {
    let info = null;
    if (clientStatus === 'CONNECTED' && waSocket?.user) {
        info = { pushname: waSocket.user.name, wid: { user: waSocket.user.id.split(':')[0] } };
    }
    res.json({ status: clientStatus, qr: qrCodeData, percent: syncPercent, info });
});

// Force restart — wipe session and get fresh QR
app.post('/api/whatsapp/restart', async (req, res) => {
    try {
        console.log('[whatsapp] Force restart requested.');
        res.json({ success: true, message: 'Restarting...' });
        if (waSocket) { try { await waSocket.logout(); } catch (_) {} }
        waSocket = null;
        clientStatus = 'STARTING';
        qrCodeData   = null;
        clearSession();
        setTimeout(connectToWhatsApp, 1500);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Logout
app.post('/api/whatsapp/logout', async (req, res) => {
    try {
        if (waSocket) { try { await waSocket.logout(); } catch (_) {} }
        waSocket      = null;
        clientStatus  = 'DISCONNECTED';
        qrCodeData    = null;
        clearSession();
        setTimeout(connectToWhatsApp, 1500);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Send text message
app.post('/api/whatsapp/send-message', async (req, res) => {
    try {
        if (clientStatus !== 'CONNECTED' || !waSocket) {
            return res.status(400).json({ success: false, error: 'WhatsApp not connected' });
        }
        const { phone, message } = req.body;
        if (!phone || !message) {
            return res.status(400).json({ success: false, error: 'Phone and message are required' });
        }
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        const jid = cleanPhone + '@s.whatsapp.net';
        await waSocket.sendMessage(jid, { text: message });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Send PDF
app.post('/api/whatsapp/send-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (clientStatus !== 'CONNECTED' || !waSocket) {
            if (req.file) fs.unlinkSync(path.join(__dirname, req.file.path));
            return res.status(400).json({ success: false, error: 'WhatsApp not connected' });
        }
        const { phone, message, filename } = req.body;
        const file = req.file;
        if (!phone || !file) {
            if (req.file) fs.unlinkSync(path.join(__dirname, req.file.path));
            return res.status(400).json({ success: false, error: 'Phone and PDF are required' });
        }
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        const jid      = cleanPhone + '@s.whatsapp.net';
        const filePath = path.join(__dirname, file.path);
        const buffer   = fs.readFileSync(filePath);
        await waSocket.sendMessage(jid, {
            document: buffer,
            mimetype: 'application/pdf',
            fileName: filename || 'Prescription.pdf',
            caption: message || '',
        });
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        if (req.file && fs.existsSync(path.join(__dirname, req.file.path))) {
            fs.unlinkSync(path.join(__dirname, req.file.path));
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Backend running on http://0.0.0.0:${PORT}`);
});
