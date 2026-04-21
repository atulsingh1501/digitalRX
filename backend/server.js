const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// ─── State ───────────────────────────────────────────────────────────────────
let qrCodeData = null;
let clientStatus = 'STARTING';
let syncPercent = 0;
let startupTimer = null;   // auto-restart timeout handle
let currentClient = null;  // always reference through this

const SESSION_PATH = path.join(__dirname, 'whatsapp-session');
const CACHE_PATH   = path.join(__dirname, '.wwebjs_cache');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clearSessionFiles() {
    [SESSION_PATH, CACHE_PATH].forEach(p => {
        if (fs.existsSync(p)) {
            try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) {}
        }
    });
}

function cancelStartupTimer() {
    if (startupTimer) { clearTimeout(startupTimer); startupTimer = null; }
}

// If no QR or CONNECTED state within 45 seconds → nuke and restart automatically
function armStartupTimer() {
    cancelStartupTimer();
    startupTimer = setTimeout(async () => {
        if (clientStatus === 'STARTING') {
            console.warn('[auto-restart] Took too long to start. Clearing session and restarting...');
            clientStatus = 'RESTARTING';
            await destroyAndRestart(true);
        }
    }, 45000);
}

async function destroyAndRestart(clearSession = false) {
    cancelStartupTimer();
    qrCodeData   = null;
    syncPercent  = 0;
    clientStatus = 'RESTARTING';

    if (currentClient) {
        try { await currentClient.destroy(); } catch (_) {}
        currentClient = null;
    }

    if (clearSession) clearSessionFiles();

    // Short delay so Chromium fully releases port/process
    setTimeout(() => createAndInitClient(), 2000);
}

// ─── Client factory ──────────────────────────────────────────────────────────
function createAndInitClient() {
    clientStatus = 'STARTING';
    qrCodeData   = null;
    syncPercent  = 0;
    armStartupTimer();

    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ]
        },
        // Aggressive timeout so puppeteer doesn't hang forever
        puppeteerOptions: { timeout: 60000 }
    });

    client.on('qr', async (qr) => {
        cancelStartupTimer(); // QR generated — no need for auto-restart
        clientStatus = 'WAITING_FOR_SCAN';
        qrCodeData   = await qrcode.toDataURL(qr);
        console.log('[whatsapp] QR Code generated.');
    });

    client.on('authenticated', () => {
        cancelStartupTimer();
        clientStatus = 'AUTHENTICATING';
        console.log('[whatsapp] Authenticated!');
    });

    client.on('loading_screen', (percent) => {
        clientStatus = 'SYNCING';
        syncPercent  = percent;
    });

    client.on('ready', () => {
        cancelStartupTimer();
        clientStatus = 'CONNECTED';
        qrCodeData   = null;
        syncPercent  = 0;
        console.log('[whatsapp] Client is ready!');
    });

    client.on('auth_failure', async (msg) => {
        console.error('[whatsapp] Auth failure:', msg, '→ clearing session and restarting...');
        await destroyAndRestart(true); // wipe bad session, get fresh QR
    });

    client.on('disconnected', async (reason) => {
        console.warn('[whatsapp] Disconnected:', reason);
        clientStatus = 'DISCONNECTED';
        qrCodeData   = null;
        syncPercent  = 0;
        // Slight delay then re-init with the existing session (don't clear it)
        setTimeout(() => createAndInitClient(), 3000);
    });

    client.initialize().catch(async (err) => {
        console.error('[whatsapp] initialize() error:', err.message);
        // Puppeteer crash → clear session and try again
        await destroyAndRestart(true);
    });

    currentClient = client;
}

// ─── Boot ────────────────────────────────────────────────────────────────────
createAndInitClient();

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/api/whatsapp/status', (req, res) => {
    res.json({
        status:  clientStatus,
        qr:      qrCodeData,
        percent: syncPercent,
        info:    clientStatus === 'CONNECTED' ? currentClient?.info : null,
    });
});

// Force-restart: wipes session + cache → fresh QR (called from UI "Force Restart" button)
app.post('/api/whatsapp/restart', async (req, res) => {
    try {
        console.log('[whatsapp] Force restart requested.');
        res.json({ success: true, message: 'Restarting...' });
        await destroyAndRestart(true);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Logout (disconnect session, keep existing session file for reconnect)
app.post('/api/whatsapp/logout', async (req, res) => {
    try {
        if (currentClient && clientStatus === 'CONNECTED') {
            await currentClient.logout();
        } else {
            await destroyAndRestart(true);
        }
        clientStatus = 'DISCONNECTED';
        qrCodeData   = null;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/whatsapp/send-message', async (req, res) => {
    try {
        if (clientStatus !== 'CONNECTED') {
            return res.status(400).json({ success: false, error: 'WhatsApp not connected' });
        }
        const { phone, message } = req.body;
        if (!phone || !message) {
            return res.status(400).json({ success: false, error: 'Phone and message are required' });
        }
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        await currentClient.sendMessage(cleanPhone + '@c.us', message);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/whatsapp/send-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (clientStatus !== 'CONNECTED') {
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
        const filePath  = path.join(__dirname, file.path);
        const fileB64   = fs.readFileSync(filePath, { encoding: 'base64' });
        const media     = new MessageMedia('application/pdf', fileB64, filename || 'Prescription.pdf');
        await currentClient.sendMessage(cleanPhone + '@c.us', media, { caption: message || '' });
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
