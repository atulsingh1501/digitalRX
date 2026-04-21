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

let qrCodeData = null;
let clientStatus = 'STARTING'; // STARTING, WAITING_FOR_SCAN, CONNECTED, DISCONNECTED

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './whatsapp-session' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    clientStatus = 'WAITING_FOR_SCAN';
    qrCodeData = await qrcode.toDataURL(qr);
    console.log('QR Code generated.');
});

client.on('ready', () => {
    clientStatus = 'CONNECTED';
    qrCodeData = null;
    console.log('WhatsApp Client is ready!');
});

client.on('disconnected', () => {
    clientStatus = 'DISCONNECTED';
    qrCodeData = null;
    console.log('WhatsApp Client disconnected!');
    client.initialize(); 
});

client.initialize().catch(err => {
    console.error("Failed to initialize client", err);
});

// Routes
app.get('/api/whatsapp/status', (req, res) => {
    res.json({ status: clientStatus, qr: qrCodeData, info: clientStatus === 'CONNECTED' ? client.info : null });
});

app.post('/api/whatsapp/logout', async (req, res) => {
    try {
        if (clientStatus === 'CONNECTED') {
            await client.logout();
        }
        clientStatus = 'DISCONNECTED';
        qrCodeData = null;
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
        const chatId = cleanPhone + '@c.us';

        await client.sendMessage(chatId, message);

        res.json({ success: true, message: 'Sent successfully' });
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
            return res.status(400).json({ success: false, error: 'Phone and PDF file are required' });
        }

        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        
        const chatId = cleanPhone + '@c.us';

        const filePath = path.join(__dirname, file.path);
        const fileBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
        const media = new MessageMedia('application/pdf', fileBase64, filename || 'Prescription.pdf');

        await client.sendMessage(chatId, media, { caption: message || '' });

        fs.unlinkSync(filePath);

        res.json({ success: true, message: 'Sent successfully' });
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
    console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
