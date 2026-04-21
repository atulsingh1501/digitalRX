# 💊 Digital Rx — Clinic Management & WhatsApp Prescription System

A professional, offline-first clinic management application built for doctors. Create digital prescriptions, manage patients, track follow-ups, and silently send prescriptions via WhatsApp — all from a single clean interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 New Prescription (Rx) | Create prescriptions with medicines, dosages, diagnosis, and advice |
| 👤 Patient Management | Add, search, and view full patient history and past consultations |
| 📱 Silent WhatsApp Delivery | Send prescriptions as PDF directly to the patient's WhatsApp |
| 🔔 Follow-up Reminders | Dashboard shows upcoming follow-ups with one-click WhatsApp reminder |
| 🖨️ PDF Export & Print | Generate and print professional clinic prescriptions as PDF |
| 📊 Dashboard Analytics | Today's patients, monthly growth, pending follow-ups at a glance |
| ⚙️ Clinic Settings | Customizable doctor profile, clinic details, and WhatsApp integration |
| 💾 Offline-First Storage | All data stored locally in the browser using `localStorage` |

---

## 🏗️ Project Architecture

```
DOCTOR-APP-master/
├── backend/                  # Node.js/Express backend (WhatsApp bridge)
│   ├── server.js             # Core server — WhatsApp client & REST API
│   ├── package.json
│   └── uploads/              # Temp folder for PDF uploads (auto-generated)
│
├── src/                      # React frontend (Vite)
│   ├── screens/
│   │   ├── Dashboard.jsx     # Stats, recent patients, follow-up reminders
│   │   ├── Patients.jsx      # Patient list & search
│   │   ├── AddPatient.jsx    # Add new patient form
│   │   ├── PatientProfile.jsx# Full patient history
│   │   ├── NewRx.jsx         # Create new prescription
│   │   ├── Consultation.jsx  # Detailed consultation view
│   │   ├── PrescriptionPreview.jsx # PDF preview & send via WhatsApp
│   │   ├── Settings.jsx      # Clinic profile + WhatsApp QR linking
│   │   └── Login.jsx         # Doctor PIN login screen
│   ├── components/
│   │   └── Layout.jsx        # Sidebar navigation wrapper
│   ├── services/
│   │   └── storage.js        # localStorage abstraction layer
│   └── config.js             # API URL configuration
│
├── electron.cjs              # Electron wrapper for desktop app
├── start-backend.bat         # One-click backend launcher (Windows)
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- Google Chrome installed (required by whatsapp-web.js for the headless browser)

---

### 1. Clone the Repository

```bash
git clone https://github.com/atulsingh1501/digitalRX.git
cd digitalRX
```

---

### 2. Install Frontend Dependencies

```bash
npm install
```

---

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

---

### 4. Run the Application

You need to run **both** the backend and frontend simultaneously.

#### Option A — Two separate terminals (Recommended)

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

#### Option B — Windows batch file

Double-click `start-backend.bat` to launch the backend, then run `npm run dev` in a terminal.

---

### 5. Open the App

Navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 📱 WhatsApp Setup

The WhatsApp integration uses `whatsapp-web.js` to link the doctor's WhatsApp account and send messages silently in the background (no WhatsApp Web window needed).

1. Start the backend server (`node server.js`)
2. Go to **Settings → Backend WhatsApp Connection** in the app
3. A QR code will appear — scan it with your WhatsApp phone
4. After scanning, wait for the **"Syncing messages..."** phase to complete
5. Once connected, the app will show **"WhatsApp Connected Successfully"**

> ⚠️ **Note:** The first-time sync can take 30–90 seconds depending on your chat history size. Subsequent startups are instant as the session is cached.

---

## ⚙️ Configuration

### Environment Variables

The app uses a single optional environment variable.

| Variable | Default | Description |
|---|---|---|
| `VITE_BACKEND_URL` | `http://127.0.0.1:3001` | URL of the backend server |

For **local development**, no `.env` file is needed. The frontend will automatically connect to `http://127.0.0.1:3001`.

For **cloud deployment** (e.g., Vercel frontend + Render backend), copy `.env.example` to `.env` and set:
```env
VITE_BACKEND_URL=https://your-live-backend-url.up.railway.app
```

---

## 🔌 Backend API Reference

The backend runs on `http://localhost:3001` by default.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/whatsapp/status` | Returns current WhatsApp connection status & QR code |
| `POST` | `/api/whatsapp/logout` | Disconnects and resets the WhatsApp session |
| `POST` | `/api/whatsapp/send-message` | Sends a plain text WhatsApp message |
| `POST` | `/api/whatsapp/send-pdf` | Sends a PDF file via WhatsApp |

### WhatsApp Status Values

| Status | Meaning |
|---|---|
| `STARTING` | Client is initializing |
| `WAITING_FOR_SCAN` | QR code is ready, waiting for phone scan |
| `AUTHENTICATING` | QR scanned, verifying credentials |
| `SYNCING` | Downloading message history (shows `percent`) |
| `CONNECTED` | Fully linked and ready to send |
| `DISCONNECTED` | Session was logged out or expired |

---

## 🖥️ Desktop App (Electron)

The app can also be run as a standalone Windows desktop application using Electron.

```bash
# Development mode (Electron window with live reload)
npm run electron:dev

# Build installable .exe
npm run electron:package
```

The output installer will be placed in the `dist_electron/` folder.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Vite |
| **Styling** | Vanilla CSS (inline styles) |
| **Icons** | Lucide React |
| **PDF** | jsPDF + html2canvas |
| **Backend** | Node.js, Express.js |
| **WhatsApp** | whatsapp-web.js (Puppeteer-based) |
| **Storage** | Browser localStorage |
| **Desktop** | Electron |

---

## 📁 Data Storage

All patient and consultation data is stored in the **browser's `localStorage`**. No external database is required.

- Patients: stored as JSON under the key `dr_patients`
- Consultations: stored as JSON under the key `dr_consultations`
- Clinic Info: stored as JSON under the key `dr_clinic`

> Use **Settings → Reset App Data** to clear all stored data from the device.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

*Built with ❤️ for busy doctors who deserve better tools.*
