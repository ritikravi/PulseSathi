# 🚀 PulseLoop - Quick Start (5 Minutes)

Get PulseLoop running in 5 minutes.

## Step 1: Prerequisites (30 seconds)

Check you have:
```bash
node --version   # Should be 18+
python3 --version  # Should be 3.9+
mongosh          # Should connect to MongoDB
```

If MongoDB not running:
```bash
brew services start mongodb-community  # macOS
```

## Step 2: Backend (90 seconds)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: Set MONGODB_URI and JWT_SECRET
npm run seed    # Creates demo data
npm run dev     # Starts on port 5000
```

Keep this terminal open!

## Step 3: ML Service (90 seconds)

Open a NEW terminal:

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: Set MONGODB_URI
python main.py  # Starts on port 8000
```

Keep this terminal open!

## Step 4: Frontend (60 seconds)

Open a NEW terminal:

```bash
cd frontend
npm install
npm run dev     # Starts on port 5173
```

## Step 5: Login & Test (60 seconds)

1. Open: http://localhost:5173
2. Login: `ramesh@demo.com` / `password123`
3. Click "Discover Patterns"
4. See detected pattern!

## ✅ Done!

You're now running PulseLoop locally.

### What You Have:

- ✅ Backend API (port 5000)
- ✅ ML pattern detection (port 8000)
- ✅ Frontend UI (port 5173)
- ✅ Demo patient with 30 days of data
- ✅ Working pattern detection

### Demo Flow:

1. **Dashboard** → See Ramesh's health summary
2. **Discover Patterns** → Find late dinner pattern
3. **Test Pattern** → Create 5-day experiment
4. **Check In** → Log daily adherence
5. **Complete** → See results and improvement

### Troubleshooting:

**MongoDB error?**
```bash
brew services start mongodb-community
```

**Port already in use?**
```bash
lsof -i :5000  # Find process
kill -9 <PID>  # Kill it
```

**ML service import error?**
```bash
source venv/bin/activate  # Make sure venv is active
pip install -r requirements.txt  # Reinstall
```

## 📚 Documentation

- **START.md** - Detailed startup guide
- **SETUP.md** - Complete technical documentation
- **PROJECT_SUMMARY.md** - Project overview
- **CASEBLITZ_PITCH.md** - Competition pitch deck
- **INSTALLATION_CHECKLIST.md** - Verification checklist

## 🎯 CaseBlitz Demo

For the competition demo:

1. Practice the 5-minute flow
2. Have all 3 terminals open
3. Browser ready at login page
4. Be ready to explain:
   - The problem (generic advice fails)
   - The solution (personalized experiments)
   - The differentiation (learns what works for YOU)

Good luck! 🏆
