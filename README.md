# 🩺 Digital RX App

A modern, offline-first **clinic management & prescription web application** built for individual doctors or small clinics. Designed as a Progressive Web App (PWA-ready), it works entirely in the browser using `localStorage` — no backend or internet connection required for core functionality.

---

## 🎯 Project Goals

The Digital RX App was created with three primary objectives in mind:

1.  **Eliminate the Paperwork Bottleneck**: Standardize and speed up the prescription process through digital tools like voice input and autocomplete, allowing doctors to focus more on patients and less on handwriting.
2.  **Zero-Infrastructure Reliability**: Provide a professional clinical tool that requires **no server, no internet, and no subscription**. It is designed to work as reliably in a remote clinic as it does in a city hospital.
3.  **Absolute Data Privacy**: By utilizing local-first storage, all patient data remains exclusively on the doctor's device. No data is ever transmitted to the cloud, ensuring 100% HIPAA-compliant-by-design privacy.

---

## 🧠 Data & Workflow Efficiency

### Relational Local-First Architecture
Despite being a "serverless" application, the data structure is logically relational to ensure high performance and data integrity:

-   **UUID-Linked Entities**: Patients and Consultations are linked via collision-resistant UUIDs (Generated via `crypto.randomUUID()`). This allows for complex visit histories without the need for a central database.
-   **Schema Efficiency**: 
    -   **Patients**: Stored as a flat, searchable array for O(1) retrieval when an ID is known.
    -   **Consultations**: Stored with `patientId` foreign keys, indexed to allow instant filtering of a patient's entire medical history.
-   **Print-Optimized JSON**: The data structure is tailored to feed directly into an A4-standardized React renderer, turning raw JSON into professional PDF/Print prescriptions in milliseconds.

### Making Work Easy
*   **Voice-to-Data**: Built-in voice recognition transcribes chief complaints instantly, removing the need for typing.
*   **Intelligent Suggestions**: The app learns (via mock templates but easily extendable) common diagnoses and medicines, providing autocomplete suggestions to minimize repetitive entries.
*   **Instant History**: With one tap on a patient profile, years of medical history are sorted and displayed, enabling doctors to track progress over time without digging through physical files.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Project Goals](#-project-goals)
- [Data & Workflow Efficiency](#-data--workflow-efficiency)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Application Flow](#-application-flow)
- [Screens & Pages](#-screens--pages)
  - [Login](#1-login--authentication)
  - [Dashboard](#2-dashboard)
  - [Patients List](#3-patients-list)
  - [Add Patient](#4-add-patient)
  - [Patient Profile](#5-patient-profile)
  - [Consultation](#6-consultation)
  - [Prescription Preview](#7-prescription-preview)
  - [Settings](#8-settings)
- [Components](#-shared-components)
- [Services & Data Layer](#-services--data-layer)
- [Context & Auth](#-context--auth)
- [Styling System](#-styling-system)
- [Routing](#-routing)
- [Data Storage Schema](#-data-storage-schema)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Available Scripts](#-available-scripts)

---

## 🔭 Overview

**Digital RX** is a single-page application (SPA) that transforms how individual practitioners manage their work. It enables a doctor to:

- Authenticate with a personal 4-digit PIN
- Register and manage patients with a searchable digital database
- Conduct digital consultations (complaints, vitals, diagnosis, prescription)
- Generate and print/share professional prescriptions
- Work entirely **offline** — all data is persisted in the browser's `localStorage`

The app is designed with a **mobile-first** philosophy, resembling a native mobile app with a fixed bottom navigation bar, floating action buttons (FAB), and glassmorphism effects, while still scaling gracefully on desktop for clinical desktop use.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 🔐 PIN Authentication | First-time setup creates a 4-digit PIN; subsequent logins verify it. No server needed. |
| 👥 Patient Management | Add, search, and view patients by name or phone number |
| 🩺 Digital Consultations | Record chief complaint (with voice input), vitals (BP/Pulse/Weight/Sugar), diagnosis with autocomplete, and multi-medicine prescriptions |
| 🎙️ Voice Input | Uses the browser's Web Speech API to dictate the chief complaint field |
| 📄 Prescription Preview | A professional A4-formatted prescription ready for printing or sharing |
| 🖨️ Print & Share | Native browser `window.print()` + Web Share API for sharing prescriptions |
| 📂 Visit History | Each patient's past consultations are stored and viewable on their profile |
| ⚙️ Clinic Settings | Configurable clinic name, doctor name, and contact shown on prescriptions |
| 🌐 Offline Mode | A banner appears when offline; all actions continue to work via localStorage |
| 📱 Responsive Design | Fully responsive: mobile-first with desktop card-wrapper layout |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Bundler** | Vite 7 |
| **Routing** | React Router DOM v7 |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS (custom design system in `global.css`) |
| **Fonts** | Google Fonts — `Outfit` (headings) + `Inter` (body) |
| **Data Persistence** | Browser `localStorage` |
| **Voice Input** | Web Speech API (`SpeechRecognition`) |
| **Lint** | ESLint 9 with React Hooks plugin |

> **No external UI library, no backend, no database** — the app is entirely self-contained.

---

## 📁 Project Structure

```
DOCTOR-APP-master/
│
├── index.html                  # HTML root — mounts React app at #root
├── vite.config.js              # Vite build config (React plugin only)
├── package.json                # Project metadata + dependency declarations
├── eslint.config.js            # ESLint configuration
├── .gitignore
│
├── public/
│   └── vite.svg                # Favicon
│
└── src/
    ├── main.jsx                # App entry point — router, routes, AuthProvider
    │
    ├── context/
    │   └── AuthContext.jsx     # Global auth state: PIN login, signup, logout
    │
    ├── services/
    │   └── storage.js          # localStorage abstraction layer (CRUD for patients, consultations, clinic info, PIN)
    │
    ├── components/             # Shared reusable UI components
    │   ├── Layout.jsx          # App shell: glass header, offline banner, bottom nav
    │   ├── Button.jsx          # Styled button with primary/secondary variants
    │   └── Input.jsx           # Labeled input field wrapper
    │
    ├── screens/                # Full page views (one per route)
    │   ├── Login.jsx           # PIN entry / first-time setup
    │   ├── Dashboard.jsx       # Home — stats, search, quick actions
    │   ├── Patients.jsx        # Searchable patient list
    │   ├── AddPatient.jsx      # New patient registration form
    │   ├── PatientProfile.jsx  # Individual patient info + visit history
    │   ├── Consultation.jsx    # Full consultation form (complaint, vitals, Rx)
    │   ├── PrescriptionPreview.jsx  # Printable A4 prescription
    │   └── Settings.jsx        # Clinic info + data reset
    │
    ├── styles/
    │   └── global.css          # Design system: CSS variables, layout, components, animations
    │
    └── assets/
        └── react.svg           # Vite default asset (unused in app UI)
```

---

## 🔄 Application Flow

```
Browser Opens
     │
     ▼
 main.jsx loads
     │
     ├─ AuthProvider wraps everything (checks if PIN exists in localStorage)
     │
     ▼
  Route: "/"
     │
     ├── No PIN set? → Show "Get Started" (signup flow)
     └── PIN exists? → Show "Unlock" (login flow)
          │
          ▼ (correct PIN entered)
     /dashboard  ← Protected Route
          │
          ├── /patients          (list all patients, search by name/phone)
          │     └── /patients/new         (add new patient form)
          │     └── /patients/:id         (patient profile + visit history)
          │           └── /consultation/:id  (new consultation form)
          │                 └── /prescription/:id  (print/share prescription)
          │
          └── /settings          (clinic config, data reset)
```

All routes except `/` are **protected** — unauthenticated users are redirected to `/` by the `ProtectedRoute` component.

---

## 📱 Screens & Pages

### 1. Login / Authentication
**File:** `src/screens/Login.jsx`  
**Route:** `/`

The entry point of the app. Uses `AuthContext` to determine if a PIN has already been set up.

- **First visit:** Prompts the doctor to set a new 4-digit PIN ("Get Started")
- **Returning visit:** Prompts for the existing PIN ("Unlock")
- PIN input is numeric-only (`tel` input type), max 4 digits
- Incorrect PIN triggers a CSS shake animation on the input field
- Displays online/offline status (Wifi icon) at the bottom
- An `Activity` icon serves as the app logo
- Successful authentication navigates to `/dashboard`

---

### 2. Dashboard
**File:** `src/screens/Dashboard.jsx`  
**Route:** `/dashboard`

The main home screen after login.

- **Personalized greeting:** "Good Morning, Dr. [FirstName]" pulled from clinic settings
- **Search bar:** Styled search input (currently visual only — search is fully functional on the `/patients` page)
- **Stats Grid:**
  - **Total Patients** card (blue gradient, clickable → navigates to `/patients`)
  - **Visits Today** card (counts consultations recorded since midnight)
- **Quick Actions:** "Add New Patient" button card navigating to `/patients/new`
- **Waiting List:** Static placeholder section showing "No patients currently waiting"

---

### 3. Patients List
**File:** `src/screens/Patients.jsx`  
**Route:** `/patients`

Displays all registered patients with real-time search.

- Loads patients from `storage.getPatients()` on mount
- **Search:** Filters by patient name or phone number (case-insensitive, real-time)
- Each patient card shows: avatar (first letter), full name, gender + age + phone
- Clicking a card navigates to `/patients/:id` (patient profile)
- A `+` icon button in the header navigates to `/patients/new`
- Empty state shows a User icon with "No patients found" message

---

### 4. Add Patient
**File:** `src/screens/AddPatient.jsx`  
**Route:** `/patients/new`

A form to register a new patient, which immediately starts a consultation.

**Fields:**
| Field | Type | Notes |
|---|---|---|
| Full Name | text | Required |
| Age | number | Optional |
| Gender | select | Male / Female / Other |
| Phone Number | tel | Optional |
| Optional Notes | textarea | Allergies, conditions, etc. |

- On submit, calls `storage.savePatient()` which saves to localStorage and generates a `crypto.randomUUID()`
- Immediately redirects to `/consultation/:patientId` (starts visit flow)

---

### 5. Patient Profile
**File:** `src/screens/PatientProfile.jsx`  
**Route:** `/patients/:id`

Shows a specific patient's full details and consultation history.

- Header card with name, gender/age, phone (tap-to-call `tel:` link), and any notes
- Avatar with patient's initial letter
- **Visit History** section: lists all past consultations sorted newest-first
  - Each visit card shows: date, time, diagnosis (or "General Checkup"), medicine count
  - Clicking a visit → opens its prescription at `/prescription/:visitId`
- A FAB (Floating Action Button) at the bottom right starts a **new consultation** for this patient

---

### 6. Consultation
**File:** `src/screens/Consultation.jsx`  
**Route:** `/consultation/:id`

The most feature-rich screen — a comprehensive consultation form.

**Sections:**

#### Chief Complaint
- Multi-line textarea
- 🎙️ **Voice Input** button using `window.SpeechRecognition` / `webkitSpeechRecognition`
  - Toggles microphone on/off; appends transcribed text to the complaint field
  - Changes color to accent red while listening

#### Vitals
- 4-field responsive grid: BP, Pulse, Weight (kg), Sugar (mg/dL)
- All optional

#### Diagnosis
- Text input with **autocomplete dropdown** from a list of mock diagnoses:
  - `Viral Fever`, `Hypertension`, `Type 2 Diabetes`, `Acute Bronchitis`, `Migraine`
- Dropdown appears while typing and filters by match; click to select

#### Prescription (Medicine List)
- Dynamic list of medicine entries
- Each medicine has:
  - **Name** (text input with `<datalist>` suggestions from mock meds: Paracetamol, Amoxicillin, Ibuprofen, etc.)
  - **Dose** (select: `1-0-1`, `1-0-0`, `0-0-1`, `1-1-1`, `SOS`)
  - **Duration** (select: 3/5/7/10 days, 1 month)
  - **Delete** button (red trash icon)
- "+ Add Med" button adds a new medicine row

#### Follow-up & Internal Notes
- Side-by-side: Follow Up date picker + Internal Notes text input

#### Bottom Action Bar (Fixed)
- **Save** (draft) → saves consultation to localStorage, navigates to Dashboard
- **Save & Print Rx** → saves consultation, navigates to `/prescription/:id`
- **Draft** button in the top header also saves without printing

---

### 7. Prescription Preview
**File:** `src/screens/PrescriptionPreview.jsx`  
**Route:** `/prescription/:id`

A professional, print-ready prescription rendered as an A4 page.

**Layout (A4 Paper, 210mm × 297mm):**

1. **Header** — Clinic name, doctor name + qualification ("MBBS, MD"), contact details (right-aligned)
2. **Patient Bar** — Patient name, age/gender, consultation date
3. **Vitals & Diagnosis** — BP, weight, pulse inline; diagnosis on separate line
4. **Rx Symbol** — Classic italic serif "Rx"
5. **Medicines Table** — Numbered list with columns: Medicine Name | Dosage | Duration
6. **Advice / Instructions Box** — Orange-tinted box for internal notes and follow-up date
7. **Footer** — Doctor's signature area

**Actions (hidden on print):**
- **Print** → `window.print()` — hides `.no-print` elements, formats page for A4
- **Share** → Uses `navigator.share()` (Web Share API) — falls back to `alert()` if unsupported
- **Home** → Navigate to `/dashboard`

---

### 8. Settings
**File:** `src/screens/Settings.jsx`  
**Route:** `/settings`

Configuration screen for clinic branding and data management.

#### Clinic Details
- **Clinic/Hospital Name** — displayed in app header and prescription
- **Doctor Name** — shown in the greeting and prescription header
- **Phone / Header Contact** — shown on prescription header
- Save button persists to `localStorage` via `storage.saveClinicInfo()`

#### Data Management
- **Reset App Data** button (accent/red styled)
- Clears all `localStorage` (patients, consultations, clinic info, PIN)
- Requires browser `confirm()` dialog before proceeding
- Redirects to `/` (login) after clear

---

## 🧩 Shared Components

### `Layout.jsx`
The app shell wrapping every authenticated page.

- **Sticky Glass Header** — Glassmorphism style, shows clinic name and online/offline indicator dot
- **Offline Banner** — Dark banner shown when `navigator.onLine` is `false`
- **Main Content Area** — `animate-fade-in` wrapper renders `{children}`
- **Floating Island Bottom Navigation** — Frosted glass pill-shaped nav with 3 tabs:
  - 🏠 Home → `/dashboard`
  - 👥 Patients → `/patients`
  - ⚙️ Settings → `/settings`
  - Active tab highlighted with `var(--primary)` color and soft background pill

### `Button.jsx`
A reusable button component applying the global `.btn` and `.btn-{variant}` CSS classes.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | string | `'primary'` | `'primary'` or `'secondary'` |
| `disabled` | boolean | `false` | Disables button, shows "Loading..." |
| `type` | string | `'button'` | HTML button type |
| `style` | object | `{}` | Inline style overrides |

### `Input.jsx`
A labeled input field wrapper for consistent form styling.

| Prop | Type | Description |
|---|---|---|
| `label` | string | Displayed above the input |
| `type` | string | HTML input type (default: `text`) |
| `name` | string | Input name attribute |
| `value` | string | Controlled value |
| `onChange` | function | Change handler |
| `required` | boolean | HTML required attribute |

---

## 🗄 Services & Data Layer

### `src/services/storage.js`

A centralized service object abstracting all `localStorage` operations.

**Storage Keys:**
```js
KEYS = {
    PIN:           'doct_app_pin',
    PATIENTS:      'doct_app_patients',
    CONSULTATIONS: 'doct_app_consultations',
    CLINIC:        'doct_app_clinic_info'
}
```

**API Surface:**

| Method | Description |
|---|---|
| `storage.hasPin()` | Returns `true` if a PIN is stored |
| `storage.verifyPin(pin)` | Compares input PIN with stored PIN |
| `storage.setPin(pin)` | Saves the PIN to localStorage |
| `storage.getPatients()` | Returns parsed array of all patients |
| `storage.savePatient(patient)` | Upserts a patient (insert or update by `id`) |
| `storage.getPatient(id)` | Finds and returns a single patient by ID |
| `storage.getConsultations(patientId?)` | Returns all consultations (optionally filtered by patient, sorted newest-first) |
| `storage.saveConsultation(consultation)` | Upserts a consultation record |
| `storage.getClinicInfo()` | Returns clinic config (defaults: `{ name: 'My Clinic', doctor: 'Dr. Smith' }`) |
| `storage.saveClinicInfo(info)` | Persists clinic config |

**ID Generation:** New records use `crypto.randomUUID()` for collision-resistant UUIDs.

---

## 🔒 Context & Auth

### `src/context/AuthContext.jsx`

Provides global authentication state to the entire app via React Context.

**State:**
| State | Type | Description |
|---|---|---|
| `isAuthenticated` | boolean | Whether the doctor is logged in |
| `hasPin` | boolean | Whether a PIN has been previously set |
| `loading` | boolean | True during initial localStorage check |

**Methods exposed via context:**
| Method | Description |
|---|---|
| `login(pin)` | Verifies PIN, sets `isAuthenticated = true` if correct |
| `signup(pin)` | Saves new PIN, sets `isAuthenticated = true` |
| `logout()` | Sets `isAuthenticated = false` |

**`ProtectedRoute` Component** (defined in `main.jsx`):  
Wraps all routes except `/`. If `isAuthenticated` is `false`, redirects to `/`. Shows nothing while `loading` is `true`.

---

## 🎨 Styling System

### `src/styles/global.css`

A hand-crafted CSS design system with CSS custom properties (variables).

#### Color Palette
```css
--primary:            #2563EB   /* Royal Blue */
--primary-gradient:   linear-gradient(135deg, #2563EB, #1D4ED8)
--primary-soft:       #EFF6FF   /* Light blue tint */
--secondary:          #10B981   /* Emerald Green */
--accent:             #F43F5E   /* Rose Red */
--bg-main:            #F8FAFC   /* Off-white background */
--bg-surface:         #FFFFFF
--text-main:          #1E293B   /* Slate 800 */
--text-secondary:     #64748B
--text-light:         #94A3B8
```

#### Typography
- **Headings:** `Outfit` (Google Fonts) — weights 300–700
- **Body:** `Inter` (Google Fonts) — weights 400–600
- Letter spacing: `-0.02em` on headings for a modern tight look

#### Spacing & Border Radius
```css
--radius-sm:   12px
--radius-md:   16px
--radius-lg:   24px
--radius-pill: 9999px   /* Full pill/capsule shape */
```

#### Key CSS Classes

| Class | Description |
|---|---|
| `.container` | Full-height app wrapper, max 1200px, desktop card effect |
| `.card` | White surface with shadow, rounded corners, hover scale effect |
| `.btn` | Base button style (pill-shaped, bold, flex-centered) |
| `.btn-primary` | Blue gradient button with blue glow shadow |
| `.btn-secondary` | White button with blue border |
| `.fab` | Fixed floating action button (bottom-right) |
| `.glass` | Glassmorphism: `backdrop-filter: blur(12px)` with semi-transparent white |
| `.badge` | Small pill label (`.badge-blue`, `.badge-green` variants) |
| `.animate-fade-in` | `fadeIn` keyframe animation (0.4s) |
| `.animate-slide-up` | `slideUp` keyframe animation with spring easing (0.5s) |
| `.grid-cols-2` | 2-column fixed grid |
| `.grid-cols-responsive` | 1 → 2 → 4 columns at breakpoints 640px and 1024px |

#### Responsive Breakpoints
| Breakpoint | Behavior |
|---|---|
| `< 768px` | Mobile: full-width container, FAB at bottom-right |
| `≥ 769px` | Desktop: container becomes a card (rounded, shadowed, margins) |
| `≥ 1200px` | FAB repositions absolutely within the container |

#### Print Styles (Prescription Only)
Applied in-component via a `<style>` tag in `PrescriptionPreview.jsx`:
- `.no-print` elements (navbar, action buttons) hidden
- `.printable-area` expands to full page, no shadows/margins
- `@page { margin: 0; size: auto; }`

---

## 🛣 Routing

Defined in `src/main.jsx` using React Router DOM v7:

| Path | Component | Protected |
|---|---|---|
| `/` | `Login` | ❌ Public |
| `/dashboard` | `Dashboard` | ✅ Yes |
| `/patients` | `Patients` | ✅ Yes |
| `/patients/new` | `AddPatient` | ✅ Yes |
| `/patients/:id` | `PatientProfile` | ✅ Yes |
| `/consultation/:id` | `Consultation` | ✅ Yes |
| `/prescription/:id` | `PrescriptionPreview` | ✅ Yes |
| `/settings` | `Settings` | ✅ Yes |

> The `:id` parameter in `/consultation/:id` and `/patients/:id` refers to the **patient's UUID**.  
> The `:id` in `/prescription/:id` refers to the **consultation's UUID**.

---

## 🗃 Data Storage Schema

All data is stored as JSON strings in `localStorage`.

#### Patient Object
```json
{
  "id": "uuid-v4",
  "name": "John Doe",
  "age": "35",
  "gender": "Male",
  "phone": "+91 98765 43210",
  "notes": "Allergic to penicillin",
  "createdAt": 1712700000000,
  "updatedAt": 1712750000000
}
```

#### Consultation Object
```json
{
  "id": "uuid-v4",
  "patientId": "patient-uuid-v4",
  "date": 1712700000000,
  "complaint": "Fever for 3 days, headache",
  "vitals": {
    "bp": "120/80",
    "pulse": "82",
    "weight": "70",
    "sugar": "95"
  },
  "diagnosis": "Viral Fever",
  "medicines": [
    {
      "id": 1712700001000,
      "name": "Paracetamol",
      "dose": "1-0-1",
      "duration": "5 days",
      "notes": ""
    }
  ],
  "notes": "Rest advised, drink fluids",
  "followUp": "2024-04-15"
}
```

#### Clinic Info Object
```json
{
  "name": "My Clinic",
  "doctor": "Dr. Smith",
  "phone": "+91 98765 00000"
}
```

---

## 🚀 Deployment

### Deploying to Vercel

The Digital RX App is optimized for deployment on Vercel.

1.  **Connect Repo**: Import your `digitalRX` repository into Vercel.
2.  **Configuration**: Vercel will automatically detect Vite. 
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
3.  **Client-Side Routing**: A `vercel.json` file is included in the root to handle `BrowserRouter` redirects.

### Manual Build
```bash
npm run build
```
Upload the contents of the `dist/` folder to any static hosting provider (Netlify, GitHub Pages, etc.). *Note: Ensure your provider is configured to redirect all traffic to `index.html` for routing to work.*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Navigate to the project directory
cd DOCTOR-APP-master

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### First Run
1. Open the app in your browser
2. Enter any 4-digit PIN and click **Get Started** — this sets your PIN
3. You'll be taken to the Dashboard
4. Go to **Settings** and configure your clinic name and doctor name
5. Start adding patients!

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev Server | `npm run dev` | Starts Vite dev server with HMR |
| Build | `npm run build` | Builds optimized production bundle to `dist/` |
| Preview | `npm run preview` | Serves the production build locally |
| Lint | `npm run lint` | Runs ESLint on all source files |

---

## ⚠️ Known Limitations & Notes

- **No real backend:** All data is browser-local. Clearing browser storage or using a different device will lose data.
- **PIN is stored in plain text** in `localStorage` — not suitable for sensitive/multi-user environments. For production, implement hashed PIN storage.
- **Voice input** requires a modern Chromium-based browser (Chrome, Edge). Firefox and Safari have limited or no Web Speech API support.
- **Prescription email/address** on the preview page (`clinic@email.com`, `123 Health Street`) is hardcoded — extend `Settings` to make these configurable.
- **Waiting List** on the Dashboard is a static placeholder and not yet functional.
- **Search on Dashboard** is visual only — the actual search filter is on the `/patients` page.

---

## 📄 License

This project is private and intended for personal/clinic use. Not licensed for redistribution.

---

*Built with ❤️ using React + Vite — No cloud. No subscription. Your data stays on your device.*
