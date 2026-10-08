# 🚀 PulseLoop - Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Python 3.9+ installed (`python3 --version`)
- ✅ MongoDB installed or MongoDB Atlas account

## Step-by-Step Startup

### 1️⃣ Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB via Docker**
```bash
docker run -d -p 27017:27017 --name pulseloop-mongo mongo:7.0
```

**Option C: MongoDB Atlas (Cloud)**
- Use your MongoDB Atlas connection string in `.env` files

---

### 2️⃣ Backend Setup & Start

Open Terminal 1:

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env (IMPORTANT!)
# Set MONGODB_URI, JWT_SECRET, etc.
nano .env  # or use any text editor

# Seed demo data (Creates Ramesh demo patient with 30 days of data)
npm run seed

# Start backend server
npm run dev
```

✅ Backend running at: **http://localhost:5000**

---

### 3️⃣ ML Service Setup & Start

Open Terminal 2:

```bash
cd ml-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env
nano .env  # Set MONGODB_URI

# Start ML service
python main.py
```

✅ ML Service running at: **http://localhost:8000**

---

### 4️⃣ Frontend Setup & Start

Open Terminal 3:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

## 🎯 Demo Flow

### Login
1. Open http://localhost:5173
2. Use demo credentials:
   - **Email**: `ramesh@demo.com`
   - **Password**: `password123`

### Dashboard
- View Ramesh's health summary
- See recent glucose readings
- Check medication adherence (85%)

### Discover Patterns
1. Click **"Discover Patterns"** button on dashboard
2. Wait for pattern detection (calls ML service)
3. System finds: **"Late Dinner → Higher Morning Glucose"**

### Pattern Details
- Shows the correlation
- Baseline: ~120 mg/dL (normal dinner)
- Pattern: ~135 mg/dL (late dinner after 9 PM)
- Effect: +15 mg/dL difference
- Confidence: ~70%

### Create Experiment
1. Click **"Test This Pattern"**
2. System creates 5-day experiment
3. Hypothesis: "If I eat dinner earlier, my fasting glucose will improve"

### Daily Check-Ins
1. Navigate to the experiment
2. Complete daily check-in:
   - Did you follow the intervention? (Yes/Partial/No)
   - Optional: Add glucose reading
   - Optional: Add notes
3. Submit check-in

### Complete Experiment
1. After 5 days (or manually complete)
2. Click **"Complete Experiment"**
3. System calculates:
   - Baseline average
   - Intervention average
   - Percentage change
   - Improvement yes/no
   - Evidence strength

### Learning
- If successful → Saved to patient's behavior profile
- System now knows this intervention works for Ramesh
- Future recommendations will be personalized

---

## 🧪 Testing Pattern Detection

### Manually Trigger Pattern Detection

```bash
# Get patient ID from MongoDB
mongosh pulseloop
db.users.findOne({email: "ramesh@demo.com"})
# Copy the _id

# Test pattern detection
curl -X POST http://localhost:8000/detect-patterns \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "PASTE_PATIENT_ID_HERE"}'
```

Expected output: Array of detected patterns

---

## 📊 Project Structure

```
pulseloop/
├── backend/          → Port 5000
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.ts
│   └── package.json
│
├── ml-service/       → Port 8000
│   ├── main.py
│   ├── pattern_detector.py
│   └── requirements.txt
│
└── frontend/         → Port 5173
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── lib/
    └── package.json
```

---

## 🔍 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` should connect
- Verify `.env` file exists with correct MONGODB_URI
- Check port 5000 is not in use: `lsof -i :5000`

### ML Service errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`
- Verify MongoDB connection in `.env`

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check CORS settings in backend `.env`
- Clear browser cache and reload

### Pattern detection returns empty
- Ensure seed data was created: `npm run seed` in backend
- Check ML service logs for errors
- Verify patient has sufficient data (30 days from seed)

### MongoDB connection failed
- Check MongoDB is running
- Verify connection string in `.env`
- For Atlas, ensure IP whitelist is configured

---

## 🎬 CaseBlitz Demo Script

### Setup (Before Demo)
1. All 3 services running
2. Demo data seeded
3. Browser at login page

### Demo Flow (5 minutes)

**Minute 1: Introduction**
- "Meet Ramesh, 58, Type-2 Diabetes patient"
- Login with demo credentials
- Dashboard shows 30 days of tracking
- 85% medication adherence

**Minute 2: The Problem**
- "Traditional apps give generic reminders"
- "We discover patterns SPECIFIC to each patient"
- Click "Discover Patterns"

**Minute 3: Pattern Discovery (WOW MOMENT)**
- System analyzes data
- Finds: "Late dinner → +15 mg/dL higher morning glucose"
- Shows evidence: 4 of 5 occurrences
- Explains in plain language

**Minute 4: Test, Don't Guess**
- "Let's test one change"
- Click "Test This Pattern"
- 5-day experiment created
- Show daily check-in interface

**Minute 5: Learning & Results**
- Show completed experiment (simulate or pre-create)
- Before: 135 mg/dL
- After: 120 mg/dL
- 11% improvement
- System learned: This works for Ramesh

**Closing: The Differentiator**
- Not generic reminders
- Not another tracker
- Personalized behavior experiments
- Continuous learning
- Evidence-based care

---

## 🚀 Next Steps

### For Development
1. Complete remaining frontend pages (History, Profile)
2. Add offline support (Service Workers)
3. Implement push notifications
4. Add multilingual support (Hindi, etc.)
5. Build clinician dashboard
6. Add family/caregiver interface

### For Production
1. Set strong JWT_SECRET
2. Configure production MongoDB Atlas
3. Add proper error logging (Sentry)
4. Set up CI/CD pipeline
5. Configure CDN for frontend
6. Add health monitoring
7. HTTPS/SSL certificates
8. Rate limiting and security hardening

### For CaseBlitz
1. Practice the demo flow
2. Prepare backup slides
3. Have offline data ready
4. Prepare answers for:
   - "How is this different from [competitor]?"
   - "What's the clinical evidence?"
   - "How do you ensure safety?"
   - "What's the business model?"
   - "How will you scale?"

---

## 📞 Quick Commands Reference

```bash
# Stop all services
# Ctrl+C in each terminal

# Restart MongoDB
brew services restart mongodb-community  # macOS

# Clear and reseed database
cd backend
npm run seed

# Check service health
curl http://localhost:5000/health  # Backend
curl http://localhost:8000/health  # ML Service

# View MongoDB data
mongosh pulseloop
db.users.find()
db.glucosereadings.find().limit(5)
db.detectedpatterns.find()
```

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Backend running (port 5000)
- [ ] ML service running (port 8000)
- [ ] Frontend running (port 5173)
- [ ] Demo data seeded
- [ ] Can login as ramesh@demo.com
- [ ] Dashboard loads with data
- [ ] Pattern detection works
- [ ] Can create experiment
- [ ] Can complete check-in

---

## 🎉 You're Ready!

All services should now be running. Open http://localhost:5173 and start the demo!

**Questions or issues?** Check SETUP.md for detailed documentation.
