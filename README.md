<div align="center">
  
# 📘 Digital Rx: Clinic Management & Automated Prescription System

A modern, lightning-fast Full-Stack Medical Application designed to digitize local clinics. It replaces paper prescriptions with professional A4 printable PDFs and features an automated, headless WhatsApp integration to dispatch digital prescriptions securely directly to patients' phones.

**[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Installation](#%EF%B8%8F-installation--setup) • [Architecture](#%EF%B8%8F-architecture)**

</div>

---

## 🚀 Key Features

* **Instant Digital Prescriptions (A4 Print-Ready):** Rapidly draft prescriptions with auto-complete medicine databases, customizable dosages, and durations. Generates pixel-perfect A4 PDFs on the fly using `html2canvas` and `jsPDF`.
* **Silent WhatsApp Automation:** No more manual forwarding! Thanks to a custom Node.js/Puppeteer backend, doctors scan a QR code once to link their WhatsApp. From then on, generating an Rx dispatches the PDF silently to the patient's phone via `whatsapp-web.js` in milliseconds—without ever opening the WhatsApp app.
* **1-Click Follow-Up Reminders:** The intelligent dashboard flags patients who missed or have scheduled follow-up dates. Doctors can dispatch a "Gentle Reminder" text to their WhatsApp with a single button click.
* **Intelligent Patient Demographics Lookup:** Entering a patient's phone number instantly auto-fills their demographic data (Name, Age, Gender, Address) across the system.
* **Offline-First Resilience:** Clinics often suffer from poor Wi-Fi. The frontend strictly employs a sophisticated caching and `localStorage` architecture, ensuring patient history, old consultations, and settings remain perfectly intact and instantly loadable offline.
* **Premium Dashboard Analytics:** View daily patient throughput, unaddressed follow-ups, and month-over-month clinic growth analytics visualized on a sleek UI utilizing Lucide React iconography.
* **Smart QR Branding:** The doctor's public WhatsApp number is auto-generated into a dynamic, scannable QR Code printed on the footer of every prescription.

---

## 🛠 Tech Stack

### **Frontend Interface**
* **React 19** & **Vite**: For extremely fast HMR and optimized production bundles.
* **React Router DOM v7**: Seamless SPA routing without page reloads.
* **CSS3 / Inline Styles**: Custom UI system mirroring premium glassmorphism and modern medical design languages. No heavy CSS libraries; pure lightweight rendering.
* **Libraries**: `lucide-react` (iconography), `qrcode.react` (QR generation), `jspdf` & `html2canvas` (client-side PDF compilation).

### **Backend & Automation**
* **Node.js** & **Express**: Lightweight REST API to handle the local orchestration.
* **whatsapp-web.js**: Headless instance of WhatsApp Web wrapping Puppeteer. Bypasses the need for expensive Meta Business API keys while securing exactly the same functionality.
* **Multer**: For cleanly processing binary PDF blobs forwarded by the frontend.

---

## ⚙️ Installation & Setup

Because this is a hybrid full-stack application relying on local hardware for the WhatsApp orchestration, you need to run both the Frontend and the Backend concurrently.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/digitalrx.git
cd digitalrx
```

### 2. Frontend Setup (React/Vite)
```bash
npm install
npm run dev
```
*The frontend will boot up blazingly fast at `http://localhost:5173`*

### 3. Backend Setup (Node.js WhatsApp Engine)
Open a separate terminal window:
```bash
cd backend
npm install
node server.js
```
*Alternatively, simply double-click the included `start-backend.bat` script at the root directory.*

---

## 📖 Usage Walkthrough (For Recruiters)

1. **Authentication & Core Setup**:
   - Begin by navigating to **Settings**. Fill in the Doctor's clinic details.
   - You will see a live **"Backend WhatsApp Connection"** panel polling the local Node server. A QR Code will appear. Scan this via the "Linked Devices" page on your physical WhatsApp application to authenticate the headless server session.
2. **Patient Onboarding**:
   - Navigate to the **Dashboard** or **Patients** tab and onboard a dummy profile.
3. **Drafting an Rx**:
   - Click the green **New Prescription** button. Type in the phone number to trigger the auto-population engine.
   - Enter Chief Complaints, Diagnosis, and map out the Medicine Table.
4. **The Magic (Silent WhatsApp Dispatch)**:
   - When finished, hit **"Send WhatsApp"**. The frontend compiles the DOM into an A4 canvas, parses it as a JS Blob, and POSTs it via Multipart-Form to the Express Backend.
   - The user interface immediately reports "Success!" while the server silently routes the payload to the provided phone number.

---

## 👨‍💻 Engineering Decisions

* **Why localStorage over MongoDB?** 
  Targeting independent, rural, or highly-localized medical practitioners means dealing with fragile internet connections. By storing the primary source-of-truth locally in the browser's persistent storage, read speeds are instantaneous and data privacy is absolutely maximized; zero patient health records (PHI) ever hit a third-party cloud.
* **Why whatsapp-web.js instead of Meta Cloud API?**
  The official Meta API costs money per message loop and requires corporate business verification, which is overwhelmingly tedious for standard clinical practitioners. By containerizing a headless Chromium browser instance natively, the doctor's standard, pre-existing WhatsApp number is democratized as a powerful broadcasting API with zero setup costs.

<br />
<div align="center">
  <b>Built specifically to bridge the friction between modern healthtech APIs and the local clinic experience.</b>
</div>
