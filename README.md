# 💊 PulseSathi — Medication Adherence Management System

> **CaseBlitz 2026** | AI-Powered WhatsApp Medication Adherence Platform for Type 2 Diabetes Patients

**Live Demo:** https://pulse-sathi-rosy.vercel.app

---

## 🎯 Problem Statement

An established Type 2 Diabetes patient taking multiple medicines **repeatedly forgets ONE specific medicine**, and existing workflows don't provide timely support before the lapse.

**Target Persona:** Suresh Kumar, 56, retired railway clerk, Kanpur
- Takes 3 diabetes medicines daily
- Frequently forgets Glipizide (evening dose) — PDC dropped to 62%
- Comfortable with WhatsApp and YouTube
- Son Rahul lives in Pune, books appointments and orders medicines

---

## 💡 Solution

PulseSathi brings medication adherence tracking into the patient's **existing WhatsApp routine**:

```
Dose Due → WhatsApp Reminder → Patient replies Y/N → Dashboard Updates → Caregiver Alerted
```

No app installation. No login required. Just WhatsApp.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   React Frontend│────▶│  Node.js Backend │────▶│  MongoDB Atlas   │
│   (Vercel)      │     │  (Render)        │     │  (Cloud DB)      │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
             ┌──────▼──────┐    ┌────────▼────────┐
             │ Twilio/Meta │    │  Python ML      │
             │ WhatsApp API│    │  FastAPI Service│
             └─────────────┘    └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2 | UI Framework |
| TypeScript | 5.2 | Type Safety |
| Vite | 5.0 | Build Tool |
| TailwindCSS | 3.3 | Styling |
| TanStack Query | 5.12 | Data Fetching & Caching |
| Zustand | 4.4 | State Management |
| React Router | 6.20 | Client-side Routing |
| Recharts | 2.10 | Data Visualization |
| Lucide React | 0.294 | Icons |
| date-fns | 2.30 | Date Formatting |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.18 | Web Framework |
| TypeScript | 5.3 | Type Safety |
| MongoDB | Atlas | Primary Database |
| Mongoose | 8.0 | ODM |
| JWT | 9.0 | Authentication |
| bcryptjs | 2.4 | Password Hashing |
| Twilio SDK | Latest | WhatsApp/SMS API |
| Axios | 1.6 | HTTP Client |
| Helmet | 7.1 | Security Headers |
| express-rate-limit | 7.1 | Rate Limiting |
| Morgan | 1.10 | HTTP Logging |

### ML / AI Service
| Technology | Purpose |
|-----------|---------|
| Python 3.11 | Runtime |
| FastAPI | API Framework |
| XGBoost | Risk Prediction Model |
| SHAP | Model Explainability |
| Pandas / NumPy | Data Processing |
| Scikit-learn | ML Utilities |

### Infrastructure & Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend Hosting (Free) |
| Render | Backend + ML Hosting (Free) |
| MongoDB Atlas | Cloud Database (Free) |
| Twilio | WhatsApp/SMS API |
| GitHub | Version Control |

---

## 📊 Database Models

| Model | Purpose |
|-------|---------|
| `User` | Patient, Clinician, Caregiver accounts |
| `Medicine` | Medicine definitions with adherence tracking |
| `MedicineSchedule` | Individual dose schedules with status |
| `DoseEvent` | Audit log of all dose-related events |
| `AdherenceRisk` | AI risk assessments per medicine |
| `WhatsAppConsent` | Patient consent + communication preferences |
| `WhatsAppMessage` | WhatsApp message history |
| `WebhookEvent` | Idempotency store for webhooks |
| `Notification` | In-app notifications |
| `CaregiverConsent` | Family access permissions |
| `PatientProfile` | Extended patient demographics |

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/login          — Login
POST /api/auth/register       — Register
GET  /api/auth/me             — Get current user
```

### Medicine Management
```
GET    /api/medicines          — List patient medicines
POST   /api/medicines          — Add medicine (auto-schedules 7 days)
PUT    /api/medicines/:id      — Update medicine
DELETE /api/medicines/:id      — Deactivate medicine
GET    /api/medicines/today    — Today's schedule (overdue/due/upcoming/done)
POST   /api/medicines/:id/dose/taken   — Mark dose taken (web)
POST   /api/medicines/:id/dose/snooze  — Snooze reminder
```

### Adherence & Risk
```
GET  /api/adherence/overview             — Overall PDC summary
GET  /api/adherence/medicine/:id         — Per-medicine adherence + patterns
POST /api/adherence/calculate-risk       — Run risk engine
GET  /api/adherence/risks                — Active risk assessments
```

### WhatsApp / Notifications
```
GET  /api/whatsapp/webhook        — Meta webhook verification
POST /api/whatsapp/webhook        — Incoming WhatsApp events
POST /api/whatsapp/consent        — Register consent + phone
GET  /api/whatsapp/consent/status — Integration status
POST /api/whatsapp/simulate       — Demo mode simulator
POST /api/sms/webhook             — Incoming SMS replies
POST /api/twilio/webhook          — Twilio WhatsApp webhook
```

### Multi-role Dashboards
```
GET /api/patient/dashboard        — Patient summary
GET /api/clinician/patients       — Clinician patient list
GET /api/caregiver/patients       — Caregiver patient list
GET /api/caregiver/patients/:id/adherence — Patient adherence for caregiver
GET /api/notifications            — In-app notifications
```

---

## � User Roles

| Role | Access | Features |
|------|--------|---------|
| **Patient** | Own data only | Today view, WhatsApp reminders, dose tracking |
| **Caregiver** | Consented patient data | Adherence overview, risk alerts, contact |
| **Clinician** | Assigned patients | Full adherence history, patterns, interventions |

---

## 📱 WhatsApp Integration Flow

```
1. Patient's medicine is due
2. Reminder scheduler (runs every 60s) detects due dose
3. WhatsApp/SMS reminder sent to patient's number
4. Patient replies: "Y" (taken) or "N" (not yet)
5. Webhook receives response
6. Database updated (dose marked taken or snoozed)
7. Adherence PDC recalculated
8. Dashboard updates in real-time (30s polling)
9. If 3+ consecutive misses → Caregiver alerted (with consent)
```

### Message Format (Hindi)
```
नमस्ते Suresh जी 🙏
आपकी दवाई का समय हो गया है।

💊 Glipizide 5mg
🕐 8:00 PM · 🍽️ खाने के बाद

क्या आपने दवाई ले ली है?
Y = हाँ, ले ली
N = नहीं, अभी नहीं
```

---

## 🤖 AI Risk Engine

Rule-based risk calculation (MVP):

```
Risk Score (0-100):
  + 40 pts — 3+ consecutive misses
  + 25 pts — 2 consecutive misses
  + 30 pts — Adherence declined >15% in 7 days
  + 20 pts — 5+ snoozes in 7 days
  + 10 pts — Consistent delays (>60 min average)

Risk Levels:
  0-29  = LOW
  30-59 = MEDIUM
  60-79 = HIGH
  80+   = CRITICAL
```

---

## 🎭 Demo Patient Data

| Field | Value |
|-------|-------|
| Name | Suresh Kumar |
| Age | 56 |
| Location | Kanpur, UP |
| Condition | T2 Diabetes, 8 years |
| Login | suresh@demo.pulsesathi.in |
| Password | Demo@1234 |

| Medicine | Schedule | PDC | Status |
|---------|---------|-----|--------|
| Metformin 500mg | 8 AM + 8 PM (after food) | 95% | ✅ Good |
| Glimepiride 2mg | 8 AM (before food) | 90% | ✅ Good |
| Glipizide 5mg | 8 PM (after food) | 62% | ⚠️ PROBLEMATIC |

**Caregiver:** Rahul Kumar (son, Pune) — `rahul@demo.pulsesathi.in` / `Demo@1234`
**Clinician:** Dr. Priya Sharma — `doctor@demo.pulsesathi.in` / `Demo@1234`

---

## 🚀 Local Setup

```bash
# Clone
git clone https://github.com/ritikravi/PulseSathi
cd PulseSathi

# Backend
cd backend
npm install
cp .env.example .env   # Fill in credentials
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Seed demo data
cd backend
npm run seed
```

### Environment Variables (backend/.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
CORS_ORIGIN=http://localhost:5173

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+17372508034
WHATSAPP_MODE=mock   # Change to 'production' for real messages

# Reminder Scheduler
REMINDER_CHECK_INTERVAL_MS=60000
REMINDER_MAX_PER_DOSE=2
REMINDER_LEAD_TIME_MINUTES=15
```

---

## � Key Metrics

| Metric | Value |
|--------|-------|
| Total API Endpoints | 30+ |
| Database Models | 12 |
| Frontend Pages | 10 |
| Lines of Code | ~8,000 |
| Test Coverage | Unit tests for risk engine, adherence, WhatsApp |
| Deployment | Live on Vercel + Render |

---

## 🔒 Security Features

- JWT authentication with expiry
- Bcrypt password hashing
- Helmet security headers
- Rate limiting (100 req/15 min)
- CORS whitelist
- Webhook signature verification (HMAC-SHA256)
- Idempotency keys for webhook events
- Consent-based caregiver access
- No medical data in logs

---

## 🌐 Deployment URLs

| Service | URL |
|---------|-----|
| Frontend | https://pulse-sathi-rosy.vercel.app |
| Backend API | https://pulseloop-backend-5il0.onrender.com |
| ML Service | https://pulseloop-ml.onrender.com |
| Health Check | https://pulseloop-backend-5il0.onrender.com/health |

---

## 📋 Product Principles

1. **Technology adapts to patient's life** — not the other way around
2. **WhatsApp-first** — meets patient where they already are
3. **Medicine-level tracking** — identify WHICH medicine is problematic
4. **Family involvement is consent-based** — not surveillance
5. **Never fake clinical outcomes** — all demo data is clearly labelled
6. **Rule-based AI first** — ML enhancement when real data available
7. **Hindi-first interface** — designed for Indian elderly users

---

## 🏆 CaseBlitz 2026

Built for CaseBlitz 2026 hackathon.

**Team:** PulseSathi
**Category:** Healthcare / Digital Health
**Focus:** Medication Adherence for Type 2 Diabetes

---

*⚠️ Demo system only. Not for clinical use without proper medical supervision.*
