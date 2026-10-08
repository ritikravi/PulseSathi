# 🩺 PulseLoop

**Personalized Behavior Experiments for Diabetes Care**

> *CaseBlitz 2026 - Project Pulse Solution*

---

## 🎯 The Problem

**77 million Type-2 Diabetes patients in India don't know what specific behaviors affect THEIR health.**

- Generic health apps give one-size-fits-all advice that doesn't work
- Hospital visits are quarterly and reactive, not proactive
- Patients struggle with sustained behavior change
- Nobody knows **what actually works for each individual**

## 💡 Our Solution

**PulseLoop: Personalized Behavior Experiments**

We don't give generic advice. We **discover patterns specific to each patient**, then validate them through **structured experiments**.

### The Core Loop

```
DISCOVER → TEST → MEASURE → LEARN → REPEAT
```

**"WE FOUND A PATTERN SPECIFIC TO YOU — LET'S TEST ONE CHANGE"**

### How It Works

1. **DISCOVER**: System analyzes patient data to find behavioral patterns
   - *Example: "Your glucose is higher on days after late dinner"*

2. **TEST**: Patient runs a 5-day behavior experiment
   - *Example: "Let's test eating dinner before 9 PM"*

3. **MEASURE**: System calculates before/after outcomes
   - *Example: "11% improvement in fasting glucose"*

4. **LEARN**: Successful interventions saved to patient profile
   - *Next recommendations personalized based on what worked*

## ✨ Key Differentiation

| Feature | Traditional Apps | PulseLoop |
|---------|-----------------|-----------|
| Insights | Generic for everyone | Personalized per patient |
| Recommendations | "Walk 30 mins daily" | "YOUR glucose is higher when YOU skip post-dinner walks" |
| Validation | Trust the app | Test it yourself |
| Learning | Static advice | Learns what works for YOU |
| Intelligence | Black-box AI | Explainable rules + stats + ML |

## 🚀 Quick Start

**Get running locally in 5 minutes:**

```bash
# 1. Start MongoDB
brew services start mongodb-community  # macOS

# 2. Backend (Terminal 1)
cd backend
npm install && npm run seed && npm run dev

# 3. ML Service (Terminal 2)
cd ml-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python main.py

# 4. Frontend (Terminal 3)
cd frontend
npm install && npm run dev

# 5. Open http://localhost:5173
# Login: ramesh@demo.com / password123
```

**📖 Detailed instructions:** See [QUICK_START.md](QUICK_START.md)

---

## 🌍 Deploy to Production

**Deploy to Vercel (Frontend) + Render (Backend + ML) in ~25 minutes:**

```bash
# 1. Initialize and push to GitHub
./deploy-init.sh
# Follow prompts to push to GitHub

# 2. Follow deployment guide
# See DEPLOYMENT.md for step-by-step instructions
```

**📖 Full deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)  
**✅ Deployment checklist:** [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)

### Free Tier Hosting
- **Frontend**: Vercel (Free forever)
- **Backend**: Render (Free tier)
- **ML Service**: Render (Free tier)
- **Database**: MongoDB Atlas (512MB free)
- **Total Cost**: $0/month for demo/pilot

**Production upgrade**: ~$43/month for unlimited uptime + better performance

## 🎬 Demo Flow

1. **Login** as Ramesh (demo patient with 30 days of data)
2. **Dashboard**: See health summary, glucose trends, 85% medication adherence
3. **Discover Patterns**: Click button → ML analyzes data
4. **Pattern Found**: "Late dinner → +15 mg/dL higher morning glucose"
5. **Create Experiment**: Test "Earlier dinner" for 5 days
6. **Daily Check-ins**: Track adherence + glucose
7. **Results**: 11% improvement, evidence: strong
8. **System Learned**: This intervention now saved for Ramesh

**🎯 WOW MOMENT:** Pattern discovery showing personalized evidence

## 🏗️ Architecture

```
Patient Data (glucose, meals, activity, medication)
          ↓
Rules + Statistics + ML Pattern Detection
          ↓
Detected Patterns (with confidence scores)
          ↓
Approved Intervention Library
          ↓
Safety Guardrail (no diagnosis/prescription)
          ↓
LLM Explanation (natural language)
          ↓
Patient / Family / Clinician
```

### Technology Stack

**Frontend**: React + TypeScript + Vite + TailwindCSS  
**Backend**: Node.js + Express + MongoDB  
**ML Service**: Python + FastAPI + scikit-learn  
**Intelligence**: Hybrid (Rules + Statistics + ML)  
**Auth**: JWT with role-based access control

## 📊 Project Structure

```
pulseloop/
├── backend/          # Node.js API (15 models, 10 routes)
├── ml-service/       # Python pattern detection (3 algorithms)
├── frontend/         # React UI (6 pages, full demo flow)
├── docs/             # Documentation (8 comprehensive guides)
└── *.md              # Quick references
```

**📂 Complete structure:** See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 🧠 Pattern Detection

### Implemented Algorithms (3)

1. **Late Dinner Pattern**
   - Detects: Dinner after 9 PM → Higher fasting glucose
   - Method: Compare late vs normal dinner days
   - Stats: T-test, effect size calculation

2. **Medication Adherence Pattern**
   - Detects: Missed medication → Higher glucose
   - Method: Compare days with/without medication

3. **Post-Meal Activity Pattern**
   - Detects: Activity after meals → Better glucose control
   - Method: Compare with/without post-meal activity

### Key Features

- ✅ Statistical significance testing
- ✅ Confidence scoring (0-1)
- ✅ Minimum observation requirements
- ✅ Effect size validation
- ✅ No causation claims (only correlations)
- ✅ All patterns explainable and auditable

## 🔒 Safety & Compliance

### Medical Safety

✅ **NO** diagnosis  
✅ **NO** prescription  
✅ **NO** medication dosage changes  
✅ **NO** unsupported medical claims  
✅ All interventions from approved library  
✅ Clinician oversight enabled  
✅ Safety guardrails on all outputs

### Language Safety

Uses probabilistic language:
- ❌ "You must..." → ✅ "We observed..."
- ❌ "This will cure..." → ✅ "This may help..."
- ❌ "Proven fact" → ✅ "Data suggests..."

## 🗂️ Database Schema

**15 MongoDB Collections:**

Core: Users, PatientProfiles, PatientBehaviourProfiles  
Health Data: GlucoseReadings, MedicationLogs, ActivityLogs, MealLogs  
Intelligence: DetectedPatterns, Experiments, ExperimentEvents  
Access: CaregiverConsents, ClinicianProfiles

## 🎯 Core Features (MVP Complete)

✅ User authentication (JWT + RBAC)  
✅ Patient medical profiles  
✅ Health data tracking (glucose, medication, activity, meals)  
✅ Pattern detection engine (3 algorithms)  
✅ Experiment framework (create, track, measure)  
✅ Behavioral learning system  
✅ Dashboard with charts (Recharts)  
✅ Pattern discovery UI  
✅ Experiment management UI  
✅ Daily check-in interface  
✅ Results calculation & visualization  
✅ Demo data (30 days synthetic patient)

## 🚧 Planned Features

🔲 Multilingual support (Hindi, Tamil, Telugu, etc.)  
🔲 Offline mode (Progressive Web App)  
🔲 Push notifications  
🔲 Glucometer Bluetooth integration  
🔲 ABDM/ABHA integration (India healthcare ID)  
🔲 Clinician full dashboard  
🔲 Family caregiver interface  
🔲 Advanced analytics & reports

## 📈 Business Model (India-Focused)

**Target Market:**
- 77M Type-2 Diabetes patients in India
- Beachhead: 15M digitally-literate urban patients
- ₹36B-72B annual addressable market

**Revenue Model:**
- B2B2C via hospitals: ₹200-400/patient/month
- B2B via insurers: Chronic disease management programs
- B2C freemium (future): Premium features

**Go-to-Market:**
- Phase 1: 2 hospital pilots, 100 patients
- Phase 2: 10 clinics, 1,000 patients
- Phase 3: Regional expansion, 10,000 patients
- Phase 4: National scale, 100,000+ patients

## 🏆 Competitive Advantage

### vs BeatO, Sugar.fit (India)
- **Them**: Coaching + generic reminders
- **Us**: Data-driven personalized experiments

### vs HealthifyMe, MyFitnessPal
- **Them**: Track everything, generic insights
- **Us**: Focused on diabetes, testable experiments

### The Moat
1. **Behavioral data**: Every experiment improves the system
2. **Personal profiles**: Each patient has unique learned preferences
3. **Network effect**: More users → More patterns → Better recommendations
4. **Clinical trust**: Transparent, safe, doctor-involved

## 👥 User Roles

- **Patient**: Track data, run experiments, view insights
- **Clinician**: Monitor patients, review experiments, safety oversight
- **Caregiver**: Consent-based family access
- **Admin**: System management

## 📚 Documentation

| File | Purpose | Time |
|------|---------|------|
| **Local Development** |
| [QUICK_START.md](QUICK_START.md) | 5-minute local setup | 5 min |
| [START.md](START.md) | Detailed startup guide | 10 min |
| [SETUP.md](SETUP.md) | Complete technical docs | 20 min |
| [INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md) | Setup verification | 5 min |
| **Deployment** |
| [DEPLOY_NOW.md](DEPLOY_NOW.md) | ⚡ **Deploy in 25 min** | 25 min |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Complete deployment guide | 30 min |
| [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) | Step-by-step checklist | - |
| [FINAL_CHECKLIST.md](FINAL_CHECKLIST.md) | Pre-deployment verification | 10 min |
| **Project Info** |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Full project overview | 15 min |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Architecture details | 10 min |
| [CASEBLITZ_PITCH.md](CASEBLITZ_PITCH.md) | Competition pitch deck | 10 min |

## 🧪 Testing

### Verify Installation

```bash
# Backend health
curl http://localhost:5000/health

# ML service health
curl http://localhost:8000/health

# Database check
mongosh pulseloop
> db.users.findOne({email: "ramesh@demo.com"})
```

### Demo Credentials

**Email:** ramesh@demo.com  
**Password:** password123  
**Role:** Patient  
**Data:** 30 days of glucose, meals, activity with detectable patterns

## 🎓 Clinical Evidence Context

**Existing research on digital diabetes interventions:**
- 0.3-0.5% HbA1c reduction (multiple RCTs)
- 15-25% improvement in medication adherence
- 10-20% reduction in complications

**Personalized N-of-1 trials:**
- Higher engagement than generic advice
- Better adherence to personalized recommendations
- Validated in chronic disease management

**PulseLoop hypothesis (6-month pilot):**
- 0.4-0.6% HbA1c reduction
- 20-30% improvement in adherence
- 80%+ patient engagement rate

*We're building the platform to GENERATE this evidence.*

## 🚀 Getting Started

### For Developers

1. **Quick Setup**: [QUICK_START.md](QUICK_START.md) (5 minutes)
2. **Full Setup**: [START.md](START.md) (detailed)
3. **Verification**: [INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)

### For Judges/Reviewers

1. **Overview**: This README (you're here!)
2. **Technical**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
3. **Pitch**: [CASEBLITZ_PITCH.md](CASEBLITZ_PITCH.md)

### For Demo

1. Start all services (see QUICK_START.md)
2. Login as ramesh@demo.com
3. Follow demo flow (Dashboard → Patterns → Experiment)
4. Practice 5-minute pitch (see CASEBLITZ_PITCH.md)

## 📞 Support & Questions

**Common Issues:**
- MongoDB connection → See SETUP.md
- Port conflicts → See INSTALLATION_CHECKLIST.md
- ML service errors → Check virtual environment activation

**Documentation:**
- Technical questions → PROJECT_SUMMARY.md
- Setup issues → INSTALLATION_CHECKLIST.md
- Architecture → PROJECT_STRUCTURE.md

## 🎯 CaseBlitz 2026 Strategy

### The Wow Moment
Pattern discovery showing **personalized evidence specific to Ramesh**

### Key Messages
1. Personalized, not generic
2. Test, don't guess
3. Evidence-based and explainable
4. Continuous learning
5. Safe and clinically sound

### Prepared Responses
- "How is this different?" → Personalized experiments vs generic coaching
- "What if ML is wrong?" → No medical decisions, only correlations, approved interventions
- "Where's the evidence?" → Building platform to generate evidence, based on proven methods
- "How to scale?" → Software scales, hospital partnerships, government integration

**Full pitch:** See [CASEBLITZ_PITCH.md](CASEBLITZ_PITCH.md)

## ✅ Status: Production-Ready MVP

- ✅ Complete backend API
- ✅ Working ML pattern detection
- ✅ Functional frontend UI
- ✅ Demo patient with 30 days data
- ✅ Full experiment workflow
- ✅ Comprehensive documentation
- ✅ Safety guardrails implemented
- ✅ Ready for pilot deployment

## 🏁 Next Steps

### Immediate (Post-CaseBlitz)
1. Finalize pilot design with clinical advisor
2. Recruit 2 partner hospitals
3. Enroll 50 patients
4. 3-month validation study

### Short-term (6 months)
1. Publish pilot results
2. Expand to 10 clinics, 1,000 patients
3. Insurer partnership pilot
4. Mobile app (iOS + Android)

### Long-term (12-24 months)
1. Regional expansion (10,000 patients)
2. Series A fundraise
3. Multi-disease platform
4. National scale

---

## 🎉 Let's Win CaseBlitz 2026!

**PulseLoop: Discover. Test. Measure. Learn.**

Healthcare that learns what works for **YOU**.

## License

MIT
