# 💊 Digital Rx — Clinic Management & WhatsApp Prescription System

> **Created & Designed by [Atul Singh](https://github.com/atulsingh1501)**
> 
> ⚠️ This project is the original work of **Atul Singh**. If you fork or copy this project, you **must** credit the original author. Removing this attribution violates the spirit of open-source ethics.

A professional, offline-first clinic management application built for doctors. Create digital prescriptions, manage patients, track follow-ups, and silently send prescriptions via WhatsApp — all from a single clean interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 New Prescription (Rx) | Create prescriptions with medicines, dosages, diagnosis, and advice |
| 💊 Medicine Search | Live autocomplete with 200+ Indian medicines — name, strength & notes auto-fill |
| 👤 Patient Management | Add, search, and view full patient history and past consultations |
| 📱 Silent WhatsApp Delivery | Send prescriptions as PDF directly to the patient's WhatsApp |
| 🔔 Follow-up Reminders | Dashboard shows upcoming follow-ups with one-click WhatsApp reminder |
| 🖨️ PDF Export & Print | Generate and print NMC-compliant professional prescriptions as PDF |
| 📊 Dashboard Analytics | Today's patients, monthly growth, pending follow-ups at a glance |
| ⚙️ Clinic Settings | Customizable doctor profile, clinic details, and WhatsApp integration |
| 💾 Offline-First Storage | All patient data stored locally in the browser using `localStorage` |

---

## 🏗️ Project Architecture

```
DOCTOR-APP-master/
├── backend/                  # Node.js/Express backend (WhatsApp bridge + Medicine API)
│   ├── server.js             # Core server — WhatsApp client, Medicine API & REST routes
│   ├── medicines.json        # 200+ Indian medicine database (offline, no external API)
│   ├── package.json
│   └── uploads/              # Temp folder for PDF uploads (auto-generated)
│
├── src/                      # React frontend (Vite)
│   ├── screens/
│   │   ├── Dashboard.jsx     # Stats, recent patients, follow-up reminders
│   │   ├── Patients.jsx      # Patient list & search
│   │   ├── AddPatient.jsx    # Add new patient form
│   │   ├── PatientProfile.jsx# Full patient history
│   │   ├── NewRx.jsx         # Create new prescription (with live medicine search)
│   │   ├── Consultation.jsx  # Detailed consultation view
│   │   ├── PrescriptionPreview.jsx # NMC-compliant PDF preview & WhatsApp send
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
- ✅ **No Chrome/browser required** — WhatsApp now uses `baileys` (WebSocket-based, lightweight)

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

The WhatsApp integration uses **`baileys`** — a lightweight WebSocket-based library that connects directly to WhatsApp without needing a Chrome/Puppeteer browser. Works on both **local machines** and **cloud servers** like Render.

1. Start the backend server (`node server.js`)
2. Go to **Settings → Backend WhatsApp Connection** in the app
3. A QR code will appear — a **freshness timer** shows how many seconds are left before it expires
4. **Scan the QR within 60 seconds** using WhatsApp → Linked Devices → Link a Device
5. Once scanned, the app will show **"WhatsApp Connected Successfully"**

> 💡 **QR Freshness Timer:** A green banner shows `✅ QR is fresh — scan now! (54s remaining)`. If you miss it, a new QR is generated automatically.

> ⚠️ **Force Restart Button:** If the QR is stuck loading, click the **"Force Restart"** button next to the spinner to wipe the session and get a fresh QR instantly.

### 🏠 Local vs ☁️ Cloud WhatsApp

| | Local (`localhost`) | Cloud (Render free) |
|---|---|---|
| QR generation speed | ✅ ~2 seconds | ✅ ~5 seconds |
| Session persistence | ✅ Permanent on disk | ⚠️ Resets on redeploy or sleep |
| Requires Chrome? | ❌ No | ❌ No |
| WhatsApp delivery | ✅ Works | ✅ Works (while server is awake) |

> 💡 On Render free tier, the server sleeps after 15 min of inactivity. When it wakes up, you may need to scan a new QR code.

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

### WhatsApp API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/whatsapp/status` | Returns current WhatsApp connection status & QR code |
| `POST` | `/api/whatsapp/restart` | Force-wipes session & cache, generates fresh QR |
| `POST` | `/api/whatsapp/logout` | Disconnects and resets the WhatsApp session |
| `POST` | `/api/whatsapp/send-message` | Sends a plain text WhatsApp message |
| `POST` | `/api/whatsapp/send-pdf` | Sends a PDF file via WhatsApp |

### Medicine Database API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/medicines/search?q=para` | Search medicines by name or category (returns up to 20 results) |
| `GET` | `/api/medicines/categories` | Get list of all available medicine categories |

**Example response for `/api/medicines/search?q=amox`:**
```json
[
  {
    "name": "Amoxicillin",
    "strengths": ["250mg", "500mg", "875mg"],
    "category": "Antibiotic - Penicillin",
    "form": "Capsule",
    "notes": "Complete the full course"
  }
]
```

### WhatsApp Status Values

| Status | Meaning |
|---|---|
| `STARTING` | Client is initializing, connecting to WhatsApp servers |
| `WAITING_FOR_SCAN` | QR code is ready — scan within 60 seconds |
| `CONNECTED` | Fully linked and ready to send prescriptions |
| `DISCONNECTED` | Session was logged out or expired |
| `RESTARTING` | Force-restart in progress, new QR coming soon |

---

## 💊 Medicine Database

The app includes a built-in **offline medicine database** (`backend/medicines.json`) with **200+ commonly prescribed medicines** in India — no internet or external API required.

### Categories Covered

| Category | Examples |
|---|---|
| Analgesics / NSAIDs | Paracetamol, Ibuprofen, Diclofenac, Nimesulide, Tramadol |
| Antibiotics | Amoxicillin, Azithromycin, Ciprofloxacin, Cefixime, Anti-TB drugs |
| Antacids / GI | Pantoprazole, Omeprazole, Domperidone, Ondansetron, Lactulose |
| Antihistamines | Cetirizine, Levocetirizine, Fexofenadine, Montelukast |
| Respiratory | Salbutamol, Ambroxol, Budesonide Inhaler, Theophylline |
| Diabetes | Metformin, Glimepiride, Sitagliptin, Dapagliflozin, Voglibose |
| Hypertension | Amlodipine, Telmisartan, Ramipril, Atenolol, Furosemide |
| Lipid-lowering | Atorvastatin, Rosuvastatin, Fenofibrate, Ezetimibe |
| Anticoagulants | Aspirin, Clopidogrel, Warfarin, Rivaroxaban |
| Thyroid | Levothyroxine, Carbimazole |
| Corticosteroids | Prednisolone, Dexamethasone, Methylprednisolone |
| Neurology / Psych | Pregabalin, Gabapentin, Escitalopram, Clonazepam, Carbamazepine |
| Antifungals | Fluconazole, Itraconazole, Terbinafine |
| Vitamins / Supplements | Vitamin D3, B12, Folic Acid, Iron, Calcium, Zinc |
| Eye / Ear Drops | Ciprofloxacin, Moxifloxacin, Latanoprost, Timolol |
| Topical / Skin | Betamethasone, Clotrimazole, Mupirocin cream |
| Paediatric | ORS, Albendazole, Paracetamol Syrup, Dry Syrups |
| Combinations | Augmentin, Metformin+Glimepiride, Paracetamol+Tramadol |

### How the Search Works in New Rx
- Type **2+ characters** → live dropdown appears instantly
- Shows **medicine name**, **category**, and **available strengths**
- Click a medicine → **name, strength & instructions auto-fill**
- If multiple strengths available → a **dropdown selector** appears automatically
- Works **completely offline** — no internet needed

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
| **QR Code** | qrcode.react (prescription footer) |
| **Backend** | Node.js, Express.js |
| **WhatsApp** | `baileys` (WebSocket-based, no Chrome needed) |
| **Medicine DB** | Local JSON (200+ medicines, no external API) |
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

## 👨‍💻 Author

**Atul Singh**

- 🐙 GitHub: [@atulsingh1501](https://github.com/atulsingh1501)
- 📁 Repository: [github.com/atulsingh1501/digitalRX](https://github.com/atulsingh1501/digitalRX)

---

## 📜 Copyright

© 2024–2026 **Atul Singh**. All rights reserved.

This software was designed and built from scratch by **Atul Singh**. You are free to use this project for learning purposes, but **you must credit the original author** in any fork, copy, or derivative work. Claiming this project as your own original work is strictly prohibited.

---

*Built with ❤️ by **Atul Singh** — for busy doctors who deserve better tools.*
