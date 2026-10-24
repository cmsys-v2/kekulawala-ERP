# Kekulawala Unified Enterprise ERP System (v6.0 — Aurora Command)

[![Firebase](https://img.shields.io/badge/Firebase-Cloud%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://console.firebase.google.com/project/kekulawala-erp)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)


A comprehensive, cloud-synchronized Enterprise Resource Planning (ERP) platform designed for large-scale operations, construction engineering, manufacturing, and commercial enterprises.

---

## ✨ Aurora Command — Interface v6.0

The entire workspace has been re-created around a cinematic, AI-native visual
language inspired by modern AI landing pages — while keeping every ERP workflow
intact.

| | |
| :-- | :-- |
| **Living backdrop** | Animated aurora blobs (cyan → blue → emerald), precision grid and film grain behind translucent glass panels. |
| **Glass command shell** | Floating 24 px-radius sidebar, breadcrumb topbar with live badge, ⌘K command palette, notification tray and instant theme picker. |
| **Bento Command Center** | Hero with live clock and gradient headline, sparkline KPI tiles, financial pulse chart, portfolio ring, Gemini copilot panel with a rotating conic frame, legal pulse, stock signals and live activity. |
| **Four themes** | Midnight Aurora (default) · Emerald Flux · Onyx Neon · Daylight Pearl — persisted locally, instant. |
| **Motion system** | Page-rise choreography, staggered KPI reveals, count-up metrics, sheen-swept primary buttons, boot splash and reduced-motion support. |
| **Brand integrated** | The Kekulawala aperture mark, "Since 1982" lockup and real print-studio work are surfaced in the UI; brand assets live in `Kekulawala-Unified-ERP/public/brand/`. |
| **Print preserved** | Quotations, invoices, POs and letters still render as pixel-perfect white A4 documents with letterhead, stamp and Sinhala watermark. |

Full specification: [`Kekulawala-Unified-ERP/DESIGN_SYSTEM.md`](Kekulawala-Unified-ERP/DESIGN_SYSTEM.md)

Connected to **Google Firebase Project**: [`kekulawala-erp`](https://console.firebase.google.com/project/kekulawala-erp)

---

## 🏛️ System Architecture & Topology

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      CENTRAL MASTER SERVER / 4th PC                         │
 │                                                                             │
 │  ┌─────────────────────────┐        ┌───────────────────────────────────┐   │
 │  │ Express REST Backend    │  <───> │ Firebase Cloud Firestore / Cache  │   │
 │  │ Port: 5000              │        │ Project: kekulawala-erp           │   │
 │  └────────────┬────────────┘        └───────────────────────────────────┘   │
 └───────────────┼─────────────────────────────────────────────────────────────┘
                 │
       ┌─────────┴───────────────────────┬─────────────────────────┐
       │ MAN / LAN Workstations          │ Remote Web Access       │ Cloud Sync
       ▼                                 ▼                         ▼
┌─────────────────────────┐   ┌────────────────────┐   ┌──────────────────────┐
│ Local Client Browsers   │   │ Firebase Hosting   │   │ Cloud Firestore &    │
│ http://localhost:3000   │   │ Web App Client     │   │ Firebase Storage     │
└─────────────────────────┘   └────────────────────┘   └──────────────────────┘
```

---

## 📦 Project Repository Structure

```
Kekulawala-ERP/
├── Kekulawala-Unified-ERP/          # Primary v5.0 Unified Enterprise ERP System
│   ├── src/                         # React 19 Frontend Application
│   │   ├── components/              # Reusable UI & Letterhead Canvas components
│   │   ├── config/                  # Firebase & Legal Knowledge base config
│   │   ├── context/                 # Application & Theme state contexts
│   │   ├── data/                    # Initial ERP Master data & Letter templates
│   │   ├── services/                # Firebase Firestore real-time service layer
│   │   └── views/                   # 15+ Enterprise functional modules & views
│   ├── server/                      # Node.js / Express Central Master Backend
│   │   └── server.js                # Port 5000 REST API & Static Asset Server
│   ├── scripts/                     # Master database seeding & migration scripts
│   │   └── seedFirebase.js          # Firestore database synchronization seeder
│   ├── public/                      # Static assets and icons
│   │   └── brand/                   # Logos, watermark, studio imagery (v6)
│   ├── firebase.json                # Firebase Firestore, Storage, & Hosting config
│   ├── firestore.rules              # Firestore Security & Access Rules
│   ├── storage.rules                # Firebase Storage Security Rules
│   ├── DESIGN_SYSTEM.md             # Aurora Command UI/UX specification (v6)
│   ├── package.json                 # Unified ERP dependencies & scripts
│   └── vite.config.js               # Vite frontend bundler configuration
├── Kekulawala-System-A/             # Standalone Module A: Business, HR & Finance
├── Kekulawala-System-B/             # Standalone Module B: Procurement & Inventory
├── Kekulawala-System-C/             # Standalone Module C: Quotations & Estimator
├── implementation_plan.md           # Detailed v5.0 Architecture Master Plan
├── implementation_plan log.md       # Master Server Deployment & MAN Topology
└── start-backend.bat                # 1-Click Unified Master Backend Launcher
```

---

## 🚀 Key Modules & Capabilities

1. **Executive Command Center**: Real-time cashflow, pipeline valuations, active work orders, overdue receivables, and low-inventory telemetry.
2. **CRM & Client Directory**: Full client lifecycles, credit ratings, project history, and payment accounts.
3. **Projects & Work Order Cards**: Job status tracking, budget vs. actual costs, milestones, and workforce assignments.
4. **12-Grade Master Inventory**: Specialized grading system for engineering and construction materials with automated reorder thresholds.
5. **Tool & Equipment Pool**: Asset tracking, allocation status, depreciation schedules, and maintenance logging.
6. **Supplier & Procurement Directory**: Vendor ratings, purchase history, payment schedules, and performance audits.
7. **Purchase Orders (POs)**: Multi-stage requisition, review, approval, and receiving workflow.
8. **Workforce, Attendance & Payroll**:
   - Monthly and daily attendance tracking.
   - Sri Lankan statutory payroll calculations (EPF 8% employee / 12% employer, ETF 3% employer).
   - Inland Revenue Department (IRD) APIT progressive tax calculations.
9. **Quotations & AI Estimator**: Interactive BOQ builder, markup calculations, tax configurations, and blueprint analysis.
10. **Document & Agreement Studio**: Automated document generator for 8+ commercial letter formats (Mobilization Advance Requests, Payment Reminders, RFQs, MOUs, Subcontractor Agreements).
11. **Custom Letterhead, Stamp & Watermark Print Engine**: Pixel-perfect A4 printable documents featuring custom letterheads, authorized signatures, official company stamps, and opacity-controlled watermarks.
12. **Sri Lanka Commercial Legal Advisor**: Built-in compliance engine covering Sri Lankan Contract Law, Shop & Office Employees Act, EPF/ETF Acts, and CIDA/ICTAD standards.
13. **Master Double-Entry Financial Ledger**: Income and expense tracking, account classifications, and transaction audit logs.
14. **Fleet & Transport Logistics**: Mileage tracking, fuel expense monitoring, driver logging, and trip history.

---

## 🔥 Firebase Cloud Configuration

The system connects to **Google Firebase** with the following credentials:

| Parameter | Configuration Value |
| :--- | :--- |
| **Project ID** | `kekulawala-erp` |
| **Auth Domain** | `kekulawala-erp.firebaseapp.com` |
| **Storage Bucket** | `kekulawala-erp.firebasestorage.app` |
| **Messaging Sender ID** | `560015673217` |
| **App ID** | `1:560015673217:web:da59e652f0bbfcecd84a80` |

### Cloud Firestore Collections

- `settings` — System company profile, letterhead layout, stamps, and watermarks
- `clients` — Client database and accounts
- `projects` — Active projects and work orders
- `materials` — 12-Grade material inventory
- `tools` — Tool and machinery asset pool
- `suppliers` — Vendor directory and payment terms
- `employees` — Staff, labour force, and subcontractors
- `quotations` — Estimates and BOQs
- `letters` — Official business letters, MOUs, and agreements
- `transactions` — Financial ledger entries
- `orders` — Purchase orders
- `transports` — Fleet vehicle trips and mileage
- `attendance` — Daily workforce attendance records
- `payroll` — Payroll ledgers and salary slips
- `legal` — Sri Lankan legal knowledge base and compliance tips

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
```bash
cd "Kekulawala-Unified-ERP"
npm install
```

### 3. Initialize & Seed Firestore Database
To populate the Firebase Firestore database with initial master schemas and default records:
```bash
npm run seed
```

### 4. Start Central Master Backend Server (Port 5000)
```bash
npm run server
# or execute start-backend.bat from the root directory
```
Backend endpoints:
- Health Check: `GET http://localhost:5000/api/health`
- Database Stats: `GET http://localhost:5000/api/db/stats`
- Database Backup: `GET http://localhost:5000/api/db/backup`
- Seeder API: `POST http://localhost:5000/api/db/seed`

### 5. Launch Frontend Development Server (Port 3000)
```bash
npm run dev
```
Navigate your browser to `http://localhost:3000`.

### 6. Production Build
```bash
npm run build
```
The compiled SPA will be output to `Kekulawala-Unified-ERP/dist` and automatically served by the master backend.

---

## 📄 License & Ownership
Copyright © 2026 **Kekulawala Group**. All rights reserved.
