# PulseLoop - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MongoDB 6.0+

## Quick Start

### 1. MongoDB Setup

```bash
# Install MongoDB locally or use MongoDB Atlas (cloud)
# Local installation:
brew install mongodb-community@7.0  # macOS
# OR use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# - MONGODB_URI
# - JWT_SECRET
# - ML_SERVICE_URL

# Build TypeScript
npm run build

# Seed demo data (creates Ramesh demo patient)
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. ML Service Setup

```bash
cd ml-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with MongoDB URI

# Start ML service
python main.py
```

ML Service will run on `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Demo Credentials

After running `npm run seed` in backend:

- **Email**: ramesh@demo.com
- **Password**: password123
- **Role**: Patient
- **Data**: 30 days of synthetic glucose/meal/activity data with detectable pattern

## Demo Flow

1. Login as Ramesh
2. View Dashboard - see recent glucose readings and adherence
3. Click "Discover Patterns" button
4. System detects: "Late Dinner → Higher Morning Glucose"
5. Click "Start Experiment"
6. Review 5-day experiment design
7. Complete daily check-ins
8. View experiment results
9. System learns and updates behavior profile

## Project Structure

```
pulseloop/
├── backend/              # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth, RBAC
│   │   ├── scripts/     # Seed data
│   │   └── server.ts    # Main server
│   └── package.json
│
├── ml-service/          # Python + FastAPI
│   ├── main.py          # FastAPI app
│   ├── pattern_detector.py  # Core pattern detection
│   └── requirements.txt
│
├── frontend/            # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── store/       # Zustand state
│   │   ├── lib/         # API client
│   │   └── main.tsx
│   └── package.json
│
└── docs/                # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Patient
- `GET /api/patient/dashboard` - Dashboard summary
- `GET /api/patient/profile` - Patient profile
- `PUT /api/patient/profile` - Update profile

### Health Data
- `POST /api/glucose` - Log glucose reading
- `GET /api/glucose` - Get glucose readings
- `POST /api/medication` - Log medication
- `POST /api/activity` - Log activity
- `POST /api/meal` - Log meal

### Patterns
- `GET /api/patterns` - Get detected patterns
- `POST /api/patterns/detect` - Trigger pattern detection
- `PUT /api/patterns/:id/dismiss` - Dismiss pattern

### Experiments
- `GET /api/experiments` - Get experiments
- `POST /api/experiments` - Create experiment
- `GET /api/experiments/:id` - Get experiment details
- `POST /api/experiments/:id/checkin` - Daily check-in
- `POST /api/experiments/:id/complete` - Complete experiment

### ML Service
- `POST /detect-patterns` - Detect behavioral patterns

## Database Collections

- `users` - User accounts
- `patientprofiles` - Patient medical data
- `patientbehaviourprofiles` - Learned behavior patterns
- `glucosereadings` - Blood glucose measurements
- `medicationlogs` - Medication adherence
- `activitylogs` - Physical activity
- `meallogs` - Meal tracking
- `detectedpatterns` - Discovered correlations
- `experiments` - Behavior experiments
- `experimentevents` - Experiment check-ins
- `caregiverconsents` - Family access permissions

## Core Features Implemented

### ✅ Authentication & Authorization
- JWT-based auth
- Role-based access control (Patient, Clinician, Caregiver, Admin)
- Password hashing with bcrypt

### ✅ Data Tracking
- Glucose readings (fasting, post-meal, random, bedtime)
- Medication logs with adherence tracking
- Activity logs with duration and intensity
- Meal logs with timing and portions

### ✅ Pattern Detection Engine
- **Rule-based + Statistical analysis** (NOT black-box AI)
- Late dinner → Higher fasting glucose
- Missed medication → Higher glucose
- Post-meal activity → Better glucose control
- Confidence scoring
- Effect size calculation
- Statistical significance testing

### ✅ Experiment Engine
- Personalized behavior experiments
- 5-day intervention design
- Baseline vs intervention comparison
- Daily check-ins
- Results calculation
- Automated learning

### ✅ Behavior Profile
- Tracks successful interventions
- Tracks unsuccessful interventions
- Adherence patterns
- Response patterns
- Continuous learning

### ✅ Safety
- No diagnosis
- No prescription
- No medication dosage changes
- All interventions from approved library
- Clinician oversight enabled

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pulseloop
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

### ML Service (.env)
```
MONGODB_URI=mongodb://localhost:27017/pulseloop
PORT=8000
```

## Testing

### Backend
```bash
cd backend
npm run test
```

### Pattern Detection
```bash
cd ml-service
# With demo data seeded:
curl -X POST http://localhost:8000/detect-patterns \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "PATIENT_ID_FROM_DB"}'
```

## Deployment

### Option 1: Traditional Hosting

**Backend**: Deploy to Railway/Render/AWS EC2
**ML Service**: Deploy to Railway/Render/AWS EC2
**Frontend**: Deploy to Vercel/Netlify
**Database**: MongoDB Atlas

### Option 2: Containerized (Docker)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/pulseloop
    depends_on:
      - mongodb
  
  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/pulseloop
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mongo-data:
```

## CaseBlitz Demo Script

1. **Login**: ramesh@demo.com / password123
2. **Dashboard**: "Meet Ramesh, 58, Type-2 Diabetes, tracking for 30 days"
3. **Data View**: Show glucose trends, adherence rate
4. **Pattern Discovery**: Click "Discover Patterns"
5. **Pattern Result**: "Late Dinner → +15 mg/dL Higher Morning Glucose"
6. **Explanation**: "We noticed a pattern. 4 of your last 5 high morning readings followed late dinners"
7. **Proposal**: "Let's test one change: Earlier dinner (before 9 PM)"
8. **Experiment Design**: 5-day intervention, daily check-in
9. **Check-in Flow**: Show adherence tracking
10. **Results**: Show before/after comparison, % improvement
11. **Learning**: "System now knows this intervention works for Ramesh"
12. **Clinician View**: Show care brief for doctor

## Key Differentiators

1. **Pattern Discovery**: NOT generic reminders - discovers patterns SPECIFIC to each patient
2. **Experiment Framework**: Structured behavior testing with measurable outcomes
3. **Continuous Learning**: System improves recommendations based on what works for YOU
4. **Explainable**: Shows the data, shows the pattern, explains the reasoning
5. **Safety-First**: No diagnosis, no prescription, clinician oversight
6. **India-Specific**: Hindi/English support, works on budget devices, offline-capable (PWA ready)

## Next Steps for Full Production

1. **Frontend Pages**: Complete all UI pages (partially implemented)
2. **Offline Support**: Service workers for PWA
3. **Multilingual**: i18n for Hindi, Tamil, Telugu, etc.
4. **Device Integration**: Glucometer Bluetooth integration
5. **ABDM Integration**: ABHA ID, health records
6. **AI Explanations**: LLM integration for natural language explanations
7. **Clinician Dashboard**: Full monitoring interface
8. **Family Dashboard**: Consent-based caregiver view
9. **Notifications**: Push notifications for check-ins
10. **Analytics**: Advanced reporting and insights

## Support

For issues or questions:
- Check logs in backend/ml-service
- Verify MongoDB connection
- Ensure all services are running
- Check CORS settings if frontend can't reach backend

## License

MIT
