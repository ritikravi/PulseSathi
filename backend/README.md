# PulseLoop Backend

Node.js + Express + TypeScript + MongoDB backend API for PulseLoop.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run build
npm run seed  # Create demo data
npm run dev
```

## API Documentation

### Authentication

**POST /api/auth/register**
- Register new user
- Body: { email, password, firstName, lastName, role, dateOfBirth, gender, diabetesType, diagnosisDate }

**POST /api/auth/login**
- Login user
- Body: { email, password }
- Returns: { user, token }

**GET /api/auth/me**
- Get current user
- Requires: Bearer token

### Patient

**GET /api/patient/dashboard**
- Get dashboard summary
- Returns: Latest glucose, adherence rate, active patterns, active experiment

**GET /api/patient/profile**
- Get patient profile

**PUT /api/patient/profile**
- Update patient profile

### Health Data

**POST /api/glucose**
- Log glucose reading
- Body: { value, readingType, timestamp, notes, mealContext }

**GET /api/glucose**
- Get glucose readings
- Query params: startDate, endDate, limit

**POST /api/medication**
- Log medication

**GET /api/medication**
- Get medication logs

**POST /api/activity**
- Log activity

**GET /api/activity**
- Get activity logs

**POST /api/meal**
- Log meal

**GET /api/meal**
- Get meal logs

### Patterns

**GET /api/patterns**
- Get detected patterns for patient

**POST /api/patterns/detect**
- Trigger pattern detection (calls ML service)

**PUT /api/patterns/:id/dismiss**
- Dismiss a pattern

### Experiments

**GET /api/experiments**
- Get all experiments for patient

**POST /api/experiments**
- Create new experiment
- Body: { patternId, title, hypothesis, intervention, dates, primaryOutcome }

**GET /api/experiments/:id**
- Get experiment details with events

**POST /api/experiments/:id/checkin**
- Log daily check-in
- Body: { dayNumber, adherenceStatus, notes, measurements }

**POST /api/experiments/:id/complete**
- Complete experiment and calculate results

## Environment Variables

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pulseloop
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

## Database Models

- User
- PatientProfile
- PatientBehaviourProfile
- GlucoseReading
- MedicationLog
- ActivityLog
- MealLog
- DetectedPattern
- Experiment
- ExperimentEvent
- CaregiverConsent

## Demo Data

```bash
npm run seed
```

Creates demo patient:
- Email: ramesh@demo.com
- Password: password123
- 30 days of synthetic data with detectable patterns
