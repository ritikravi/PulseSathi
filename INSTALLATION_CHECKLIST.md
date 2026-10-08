# Installation Checklist

Use this checklist to verify your PulseLoop installation is complete and working.

## ✅ Pre-Installation

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Python 3.9+ installed (`python3 --version`)
- [ ] pip installed (`pip3 --version`)
- [ ] MongoDB installed OR MongoDB Atlas account
- [ ] Git installed (if cloning repository)

## ✅ MongoDB Setup

- [ ] MongoDB service running
  ```bash
  # Test connection
  mongosh
  # Should connect without errors
  ```
- [ ] Database "pulseloop" accessible
- [ ] Connection string ready for .env files

## ✅ Backend Setup

- [ ] Navigate to `backend/` directory
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created from `.env.example`
- [ ] `.env` configured with:
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET (strong random string)
  - [ ] ML_SERVICE_URL=http://localhost:8000
  - [ ] CORS_ORIGIN=http://localhost:5173
- [ ] TypeScript compiled (`npm run build`)
- [ ] Demo data seeded (`npm run seed`)
  - [ ] Success message: "Database seeded successfully!"
  - [ ] Demo user created: ramesh@demo.com
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check passes: http://localhost:5000/health

## ✅ ML Service Setup

- [ ] Navigate to `ml-service/` directory
- [ ] Virtual environment created (`python3 -m venv venv`)
- [ ] Virtual environment activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created from `.env.example`
- [ ] `.env` configured with:
  - [ ] MONGODB_URI (same as backend)
  - [ ] PORT=8000
- [ ] Service starts without errors (`python main.py`)
- [ ] Health check passes: http://localhost:8000/health

## ✅ Frontend Setup

- [ ] Navigate to `frontend/` directory
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Application loads: http://localhost:5173
- [ ] No console errors in browser

## ✅ Integration Tests

### Test 1: Login
- [ ] Navigate to http://localhost:5173
- [ ] See login page
- [ ] Enter: ramesh@demo.com / password123
- [ ] Click "Login"
- [ ] Successfully redirected to dashboard
- [ ] See "Welcome Back!" message

### Test 2: Dashboard
- [ ] See medication adherence stat (should be ~85%)
- [ ] See glucose chart with data points
- [ ] See "Discover Patterns" button

### Test 3: Pattern Detection
- [ ] Click "Discover Patterns" button
- [ ] System calls ML service (may take 2-3 seconds)
- [ ] Redirected to Patterns page
- [ ] See at least one detected pattern
- [ ] Pattern shows:
  - [ ] Title
  - [ ] Description
  - [ ] Confidence score
  - [ ] Baseline vs pattern averages
  - [ ] AI explanation

### Test 4: Create Experiment
- [ ] On Patterns page, click "Test This Pattern"
- [ ] Redirected to experiment detail page
- [ ] See experiment details:
  - [ ] Title
  - [ ] Hypothesis
  - [ ] Intervention description
  - [ ] Duration (5 days)
- [ ] See "Daily Check-In" form

### Test 5: Check-In
- [ ] Select adherence status
- [ ] Enter glucose reading (optional)
- [ ] Add notes (optional)
- [ ] Click "Submit Check-In"
- [ ] Check-in appears in history
- [ ] Current day increments

### Test 6: Navigation
- [ ] Click "Dashboard" in sidebar → Returns to dashboard
- [ ] Click "Patterns" → Shows patterns
- [ ] Click "Experiments" → Shows experiment list
- [ ] Click "History" → Shows history page
- [ ] Click "Profile" → Shows profile page
- [ ] Logout button → Returns to login

## ✅ API Health Checks

Run these curl commands to verify all services:

```bash
# Backend
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"..."}

# ML Service
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# Backend auth (should fail without token)
curl http://localhost:5000/api/auth/me
# Expected: 401 error (correct - requires authentication)
```

## ✅ Database Verification

```bash
mongosh pulseloop

# Check users
db.users.countDocuments()
# Expected: At least 1 (ramesh@demo.com)

# Check glucose readings
db.glucosereadings.countDocuments()
# Expected: ~30 (one per day for 30 days)

# Check meal logs
db.meallogs.countDocuments()
# Expected: ~90 (breakfast, lunch, dinner for 30 days)

# Check medication logs
db.medicationlogs.countDocuments()
# Expected: ~60 (twice daily for 30 days)
```

## ✅ Console Logs

### Backend Console Should Show:
```
MongoDB Connected: localhost
Server running in development mode on port 5000
```

### ML Service Console Should Show:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Frontend Console (Browser DevTools)
- No errors (red messages)
- May have TanStack Query cache messages (normal)

## ✅ Common Issues & Fixes

### Issue: MongoDB connection failed
- **Fix**: Start MongoDB service
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`
- **Docker**: `docker start pulseloop-mongo`

### Issue: Backend port 5000 already in use
- **Fix**: Kill process using port
- `lsof -i :5000` then `kill -9 <PID>`
- OR change PORT in backend/.env

### Issue: ML service can't import modules
- **Fix**: Ensure virtual environment is activated
- `source venv/bin/activate` (should see `(venv)` in prompt)
- Reinstall: `pip install -r requirements.txt`

### Issue: Frontend can't connect to backend
- **Fix**: Check backend is running on port 5000
- Verify CORS_ORIGIN in backend/.env matches frontend URL
- Clear browser cache

### Issue: Pattern detection returns empty
- **Fix**: Ensure demo data was seeded
- Re-run: `cd backend && npm run seed`
- Check ML service logs for errors

### Issue: "Module not found" in frontend
- **Fix**: Delete node_modules and reinstall
- `rm -rf node_modules package-lock.json`
- `npm install`

## ✅ Ready for Demo

All boxes checked? You're ready!

### Final Verification Steps:

1. **3 Terminals Open**:
   - Terminal 1: Backend running
   - Terminal 2: ML Service running
   - Terminal 3: Frontend running

2. **Login Works**: Can login as ramesh@demo.com

3. **Dashboard Shows Data**: Glucose chart visible

4. **Pattern Detection Works**: Can discover patterns

5. **Experiments Work**: Can create and check-in

### Demo Flow Practice:

- [ ] Login (10 seconds)
- [ ] Show dashboard (20 seconds)
- [ ] Discover patterns (30 seconds)
- [ ] Explain pattern (60 seconds)
- [ ] Create experiment (30 seconds)
- [ ] Show check-in (30 seconds)
- [ ] Show results (30 seconds)
- [ ] Explain learning (30 seconds)

**Total: ~4 minutes** (leaves 1 minute for Q&A in 5-minute demo)

---

## 🎉 Installation Complete!

All systems go! You're ready for CaseBlitz 2026.

**Good luck! 🚀**
