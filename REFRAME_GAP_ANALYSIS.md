# PulseSathi Reframe: Gap Analysis & Implementation Plan

## EXECUTIVE SUMMARY

**Current State:** Generic diabetes management platform with pattern detection and n-of-1 experiments
**Target State:** Medication adherence orchestration platform for established T2D patients with family support

## PATIENT PERSONA ALIGNMENT

### Target User
- **Name:** Suresh Kumar (demo patient)
- **Age:** 56 years
- **Location:** Kanpur, UP
- **Condition:** Type 2 Diabetes (8 years)
- **Medications:** 3 prescribed medicines (frequently forgets 1)
- **Device:** Budget Android smartphone
- **Digital Literacy:** WhatsApp + YouTube comfortable
- **Family:** Son in Pune (books appointments, orders meds), Wife cooks common family meals

### Problem Statement (REFRAMED)
**OLD:** "Patients need better diabetes tracking and pattern detection"
**NEW:** "An established T2D patient taking multiple medicines repeatedly forgets ONE specific medicine, and existing workflows don't provide timely support before the lapse"

---

## GAP ANALYSIS BY COMPONENT

### 1. DATABASE MODELS

| Model | Status | Action | Priority |
|-------|--------|--------|----------|
| User | ✅ EXISTS | MODIFY - Add preferredLanguage, deviceType | P1 |
| PatientProfile | ✅ EXISTS | MODIFY - Simplify, focus on medication adherence | P1 |
| MedicationLog | ✅ EXISTS | ENHANCE - Add medicine-specific tracking, reminder responses | P1 |
| CaregiverConsent | ✅ EXISTS | ENHANCE - Add notification preferences, relationship details | P1 |
| GlucoseReading | ✅ EXISTS | KEEP - But deprioritize in UI | P2 |
| DetectedPattern | ✅ EXISTS | MODIFY - Reframe for adherence patterns | P2 |
| Experiment | ✅ EXISTS | MODIFY - Simplify for medication adherence tests | P2 |
| **Medicine** | ❌ MISSING | **CREATE** - Master medicine definition | **P0** |
| **MedicineSchedule** | ❌ MISSING | **CREATE** - Scheduled doses per patient | **P0** |
| **DoseEvent** | ❌ MISSING | **CREATE** - Individual dose tracking | **P0** |
| **ReminderEvent** | ❌ MISSING | **CREATE** - Reminder history | **P0** |
| **AdherenceMetrics** | ❌ MISSING | **CREATE** - Medicine-level adherence scores | **P0** |
| **RiskPrediction** | ❌ MISSING | **CREATE** - Adherence lapse risk scoring | **P1** |
| **InterventionLog** | ❌ MISSING | **CREATE** - Intervention history | **P1** |

### 2. BACKEND API ROUTES

| Route | Status | Action | Priority |
|-------|--------|--------|----------|
| `/api/auth/*` | ✅ EXISTS | KEEP - Working | P3 |
| `/api/patient/dashboard` | ✅ EXISTS | **REWRITE** - Focus on TODAY's meds | **P0** |
| `/api/patient/profile` | ✅ EXISTS | MODIFY - Simplify | P1 |
| `/api/medication/*` | ✅ EXISTS | **REBUILD** - Medicine-centric design | **P0** |
| `/api/glucose/*` | ✅ EXISTS | KEEP - But secondary | P2 |
| `/api/patterns/*` | ✅ EXISTS | MODIFY - Adherence patterns | P2 |
| `/api/experiments/*` | ✅ EXISTS | MODIFY - Adherence experiments | P2 |
| `/api/clinician/*` | 🟡 PARTIAL | ENHANCE - Med adherence focus | P1 |
| `/api/caregiver/*` | ❌ MISSING | **CREATE** - Caregiver dashboard API | **P1** |
| **`/api/medicines/*`** | ❌ MISSING | **CREATE** - Medicine management | **P0** |
| **`/api/adherence/*`** | ❌ MISSING | **CREATE** - Adherence analytics | **P0** |
| **`/api/reminders/*`** | ❌ MISSING | **CREATE** - Reminder system | **P0** |
| **`/api/risk/*`** | ❌ MISSING | **CREATE** - Risk assessment | **P1** |
| **`/api/interventions/*`** | ❌ MISSING | **CREATE** - Intervention engine | **P1** |

### 3. FRONTEND PAGES

| Page | Status | Action | Priority |
|------|--------|--------|----------|
| LoginPage | ✅ EXISTS | MODIFY - Add language selection | P1 |
| DashboardPage | ✅ EXISTS | **REDESIGN** - WhatsApp-like, TODAY focus | **P0** |
| PatternsPage | ✅ EXISTS | MODIFY - Adherence patterns only | P2 |
| ExperimentsPage | ✅ EXISTS | MODIFY - Simplify for adherence | P2 |
| HistoryPage | ✅ EXISTS | MODIFY - Medicine-centric history | P1 |
| ProfilePage | ✅ EXISTS | SIMPLIFY - Remove complexity | P1 |
| ClinicianDashboard | 🟡 PARTIAL | ENHANCE - Med adherence focus | P1 |
| **OnboardingFlow** | ❌ MISSING | **CREATE** - Medicine setup wizard | **P0** |
| **MedicineListPage** | ❌ MISSING | **CREATE** - Patient's 3 medicines | **P0** |
| **TodayViewPage** | ❌ MISSING | **CREATE** - Simple today's doses | **P0** |
| **CaregiverDashboard** | ❌ MISSING | **CREATE** - Son's monitoring view | **P1** |
| **ReminderSettings** | ❌ MISSING | **CREATE** - Notification preferences | **P1** |

### 4. ML/AI SERVICE

| Component | Status | Action | Priority |
|-----------|--------|--------|----------|
| Pattern Detector | ✅ EXISTS | **REFRAME** - Detect adherence lapses | **P1** |
| Late Dinner Pattern | ✅ EXISTS | KEEP - But secondary | P2 |
| Medication Pattern | ✅ EXISTS | **ENHANCE** - Medicine-specific | **P1** |
| Activity Pattern | ✅ EXISTS | KEEP - But secondary | P2 |
| **AdherenceLapsePredictor** | ❌ MISSING | **CREATE** - 24hr risk prediction | **P0** |
| **RiskScoreEngine** | ❌ MISSING | **CREATE** - Rule-based initially | **P0** |
| **ExplainabilityService** | ❌ MISSING | **CREATE** - Why is risk high? | **P1** |
| **InterventionRecommender** | ❌ MISSING | **CREATE** - Suggest interventions | **P1** |

### 5. UX/UI REQUIREMENTS

| Requirement | Status | Action | Priority |
|-------------|--------|--------|----------|
| Mobile-first | 🟡 PARTIAL | ENHANCE - Budget phone focus | **P0** |
| Large touch targets | 🟡 PARTIAL | ENHANCE - Elderly-friendly | **P0** |
| Hindi/vernacular | ❌ MISSING | **CREATE** - i18n support | **P1** |
| WhatsApp-like UI | ❌ MISSING | **REDESIGN** - Familiar patterns | **P0** |
| Minimal typing | ❌ MISSING | **REDESIGN** - One-tap actions | **P0** |
| Voice support | ❌ MISSING | ADD - Optional voice input | P2 |
| Simplified clinician UI | 🟡 PARTIAL | IMPROVE - Medicine focus | P1 |
| Caregiver-specific UI | ❌ MISSING | **CREATE** - Monitoring view | **P1** |

---

## CRITICAL NEW FEATURES (P0 - Build First)

### 1. Medicine Management System

**Models Needed:**
```typescript
Medicine {
  _id
  patientId
  name: string (e.g., "Metformin")
  dosage: string (e.g., "500mg")
  frequency: 'once' | 'twice' | 'thrice' | 'custom'
  timings: string[] (e.g., ["08:00", "20:00"])
  beforeAfterFood: 'before' | 'after' | 'anytime'
  isProblematic: boolean  // Frequently missed?
  adherenceScore: number  // 0-100
  consecutiveMisses: number
  lastTaken: Date
  createdAt: Date
}

MedicineSchedule {
  _id
  medicineId
  patientId
  scheduledFor: Date
  status: 'pending' | 'taken' | 'snoozed' | 'missed' | 'skipped'
  takenAt: Date
  delayMinutes: number
  remindersSent: number
  responseType: 'tap-taken' | 'tap-snooze' | 'auto-missed'
  notes: string
}

DoseEvent {
  _id
  scheduleId
  medicineId
  patientId
  eventType: 'reminder-sent' | 'reminder-opened' | 'dose-taken' | 'dose-snoozed' | 'dose-missed'
  timestamp: Date
  metadata: Object
}
```

**API Routes:**
- `POST /api/medicines` - Add medicine
- `GET /api/medicines` - List patient's medicines
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Remove medicine
- `GET /api/medicines/:id/adherence` - Medicine-specific adherence
- `POST /api/medicines/:id/dose` - Record dose taken
- `POST /api/medicines/:id/snooze` - Snooze reminder

### 2. Today View (Simple Patient Interface)

**Features:**
- Show ONLY today's pending doses
- Big "TAKEN" button per medicine
- "Remind me in 30 min" button
- Medicine name + time due
- Before/after food indicator
- Minimal text, maximum clarity

**Design Pattern:**
```
┌─────────────────────────┐
│  🌅 Good Morning Suresh │
│                         │
│  📋 Today's Medicines   │
│                         │
│  ┌───────────────────┐  │
│  │ 🔴 OVERDUE        │  │
│  │ Metformin 500mg   │  │
│  │ 8:00 AM (30 min)  │  │
│  │ ☕ After food     │  │
│  │ [✓ TAKEN] [⏰ +30min]│ │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 🟢 DUE NOW        │  │
│  │ Glimepiride 2mg   │  │
│  │ 8:00 AM           │  │
│  │ ☕ Before food    │  │
│  │ [✓ TAKEN] [⏰ +30min]│ │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 3. Adherence Tracking Engine

**Functionality:**
- Track every dose event
- Calculate per-medicine PDC (Proportion of Days Covered)
- Identify problematic medicine
- Detect patterns:
  - Time-of-day patterns (morning vs evening)
  - Day-of-week patterns (weekday vs weekend)
  - Consecutive misses (risk indicator)
  - Snooze frequency (emerging problem)

**Metrics:**
```
Medicine A (Metformin):
- PDC: 96% ✓
- Consecutive misses: 0
- Avg delay: 12 minutes
- Status: Good adherence

Medicine B (Glimepiride):
- PDC: 91% ✓
- Consecutive misses: 1
- Avg delay: 25 minutes
- Status: Fair adherence

Medicine C (Glipizide):
- PDC: 62% ⚠️
- Consecutive misses: 3 🚨
- Avg delay: 78 minutes
- Status: PROBLEMATIC
```

### 4. Smart Reminder System

**Rules:**
- Don't spam - max 2 reminders per dose
- Context-aware messages
- Escalation based on importance
- Respect snooze preferences

**Example Flow:**
```
Time: 08:00 - First reminder
"सुप्रभात! आपकी सुबह की दवा Metformin लेने का समय है"
"Good morning! Time for your morning Metformin"

User: [Snoozes +30 min]

Time: 08:30 - Second reminder
"Metformin अभी भी बाकी है"
"Metformin is still pending"

User: [No action]

Time: 09:00 - Auto-marked as missed
Record: Dose missed, schedule next intervention
```

### 5. Risk Prediction Engine

**Algorithm (Rule-based MVP):**
```python
def calculate_adherence_risk(patient, medicine):
    risk_score = 0
    
    # Recent misses (40% weight)
    if medicine.consecutive_misses >= 3:
        risk_score += 40
    elif medicine.consecutive_misses == 2:
        risk_score += 25
    elif medicine.consecutive_misses == 1:
        risk_score += 10
    
    # PDC decline (30% weight)
    pdc_7day = get_pdc(medicine, days=7)
    pdc_30day = get_pdc(medicine, days=30)
    if pdc_7day < pdc_30day - 0.15:  # Declined by 15%
        risk_score += 30
    elif pdc_7day < pdc_30day - 0.10:
        risk_score += 20
    
    # Snooze frequency (20% weight)
    snoozes_7day = count_snoozes(medicine, days=7)
    if snoozes_7day >= 5:
        risk_score += 20
    elif snoozes_7day >= 3:
        risk_score += 10
    
    # Time pattern (10% weight)
    if is_always_delayed(medicine):
        risk_score += 10
    
    return min(risk_score, 100)

risk_level = "LOW" if risk < 30 else "MEDIUM" if risk < 60 else "HIGH"
```

---

## IMPLEMENTATION PHASES

### Phase 0: Foundation (Week 1)
1. Create new database models (Medicine, MedicineSchedule, DoseEvent)
2. Build medicine management API
3. Create medicine-specific adherence calculation
4. Setup basic reminder infrastructure

### Phase 1: Patient Core (Week 1-2)
1. Medicine onboarding wizard
2. Today View page (simplified dashboard)
3. One-tap dose confirmation
4. Snooze functionality
5. Medicine list with adherence scores

### Phase 2: Caregiver Integration (Week 2)
1. Caregiver consent flow
2. Caregiver dashboard (monitoring view)
3. Alert notifications for caregiver
4. Respect patient privacy settings

### Phase 3: Risk & Intervention (Week 3)
1. Rule-based risk score engine
2. Adherence lapse prediction
3. Intervention recommendation engine
4. Escalation hierarchy

### Phase 4: ML Enhancement (Week 3-4)
1. Reframe pattern detector for adherence
2. Medicine-specific pattern detection
3. XGBoost model for 24hr prediction
4. SHAP explanations

### Phase 5: Clinician Tools (Week 4)
1. Clinician dashboard reframe
2. Medicine-level adherence heatmap
3. High-risk patient alerts
4. Intervention effectiveness tracking

### Phase 6: UX Polish (Week 4-5)
1. Hindi/vernacular support (i18n)
2. WhatsApp-like interactions
3. Voice input (optional)
4. Large touch targets
5. Elderly-friendly design

---

## WHAT TO KEEP vs REMOVE

### ✅ KEEP (but deprioritize)
- Glucose tracking (optional feature)
- Meal logging (optional feature)
- Activity logging (optional feature)
- Pattern detection (reframe for adherence)
- Experiments (simplify for medication testing)

### ❌ REMOVE / HIDE
- Complex analytics charts on patient view
- Technical medical terminology
- Calorie tracking
- Social features
- Generic health insights

### 🔄 TRANSFORM
- Dashboard → Today View (simple, focused)
- Pattern Detection → Adherence Pattern Detection
- Experiments → Medication Adherence Tests
- Clinician Dashboard → Adherence Monitoring Dashboard

---

## DEMO PATIENT DATA

**Patient: Suresh Kumar**
```json
{
  "name": "Suresh Kumar",
  "age": 56,
  "location": "Kanpur, UP",
  "diabetesYears": 8,
  "preferredLanguage": "hi",  // Hindi
  "deviceType": "budget-android",
  "medicines": [
    {
      "name": "Metformin",
      "dosage": "500mg",
      "timings": ["08:00", "20:00"],
      "beforeAfterFood": "after",
      "adherenceScore": 96,
      "isProblematic": false
    },
    {
      "name": "Glimepiride",
      "dosage": "2mg",
      "timings": ["08:00"],
      "beforeAfterFood": "before",
      "adherenceScore": 91,
      "isProblematic": false
    },
    {
      "name": "Glipizide",
      "dosage": "5mg",
      "timings": ["20:00"],
      "beforeAfterFood": "after",
      "adherenceScore": 62,
      "isProblematic": true  // THIS IS THE PROBLEM MEDICINE
    }
  ],
  "caregiver": {
    "name": "Rahul Kumar (Son)",
    "location": "Pune",
    "relationship": "son",
    "role": "books appointments, orders medicines",
    "notificationPreferences": {
      "highRiskAlerts": true,
      "weeklyReports": true,
      "consecutiveMisses": 2  // Alert after 2 consecutive misses
    }
  }
}
```

**Demo Scenario for CaseBlitz:**
1. Day 1-7: Good adherence, all medicines taken
2. Day 8: Glipizide missed (evening)
3. Day 9: Glipizide snoozed twice, finally taken
4. Day 10: Glipizide missed
5. Day 11: Risk score increases → Personalized intervention
6. Day 12: Glipizide missed → Caregiver notified (with consent)
7. Day 13: Patient responds to intervention, takes medicine
8. Day 14-30: Improved adherence on Glipizide

---

## SUCCESS METRICS

### Primary (P0)
- **Medicine-specific PDC** (target: >80% for all medicines)
- **Problematic medicine identification** (flag medicines <70% PDC)
- **Intervention response rate** (target: >60%)
- **Caregiver alert effectiveness** (adherence improvement after alert)

### Secondary (P1)
- **Reminder response time** (minutes to confirm)
- **Snooze frequency** (indicator of emerging issues)
- **Consecutive miss prevention** (catch before becoming pattern)
- **Risk prediction accuracy** (when ML model is trained)

### Clinical (P2 - Post-validation)
- HbA1c improvement
- Glucose control
- Hospital visits reduction

---

## TECHNICAL DEBT TO ADDRESS

1. **Remove glucose-centric assumptions** from current codebase
2. **Simplify patient UI** - remove complex charts
3. **Rewrite dashboard** - from analytics view to today's action view
4. **Add i18n infrastructure** - prepare for Hindi/vernacular
5. **Mobile optimization** - test on budget Android devices
6. **Notification system** - build proper reminder infrastructure

---

## NEXT STEPS

1. **Review this analysis** with team
2. **Prioritize P0 features** for immediate build
3. **Create new DB migrations** for Medicine models
4. **Build onboarding wizard** first (user entry point)
5. **Implement Today View** (core patient experience)
6. **Test with persona** (Suresh Kumar scenario)
7. **Build caregiver features** (family support)
8. **Refine risk engine** (rule-based first, ML later)
9. **Polish UX** for elderly users
10. **Prepare CaseBlitz demo** (end-to-end flow)

---

## CRITICAL GUARDRAILS

1. **Never fake clinical outcomes** - use "demo/synthetic data" labels
2. **Never claim diagnosis capability** - adherence support only
3. **Never change medication dosage** - track only
4. **Always get consent** for family access
5. **Always provide opt-out** for notifications
6. **Always explain AI decisions** (when ML is used)
7. **Always respect patient privacy** (caregiver access is limited)

---

**END OF GAP ANALYSIS**

**Status:** Ready for implementation
**Timeline:** 4-5 weeks for full MVP
**Priority:** Start with P0 features (Medicine management + Today View)
