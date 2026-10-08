# PulseLoop ML Service

Python + FastAPI pattern detection service for behavioral health insights.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

pip install -r requirements.txt

cp .env.example .env
# Edit .env with MongoDB URI

python main.py
```

## API Endpoints

### POST /detect-patterns

Detect behavioral patterns from patient data.

**Request:**
```json
{
  "patient_id": "507f1f77bcf86cd799439011",
  "min_observation_days": 14,
  "min_confidence": 0.6
}
```

**Response:**
```json
{
  "patterns": [
    {
      "patternType": "correlation",
      "title": "Late Dinner Pattern Detected",
      "description": "Your fasting glucose was higher on 4 of 5 days following a late dinner",
      "confidenceScore": 0.72,
      "baselineAverage": 120,
      "patternAverage": 135,
      "percentageDifference": 12.5,
      "effectSize": 15,
      "aiExplanation": "We observed a pattern..."
    }
  ]
}
```

## Pattern Detection Algorithm

### Hybrid Intelligence

**Rules + Statistics + ML**

NOT black-box AI. Explainable pattern detection.

### Pattern Types

1. **Late Dinner Pattern**
   - Detects: Dinner after 9 PM → Higher fasting glucose
   - Method: Compare late vs normal dinner days
   - Stats: T-test for significance

2. **Medication Adherence Pattern**
   - Detects: Missed medication → Higher glucose
   - Method: Compare days with/without medication
   - Stats: Effect size calculation

3. **Post-Meal Activity Pattern**
   - Detects: Activity after meals → Better glucose control
   - Method: Compare with/without post-meal activity
   - Stats: Confidence scoring

### Confidence Calculation

```python
confidence = f(
    effect_size,      # Magnitude of difference
    sample_size,      # Number of observations
    p_value,          # Statistical significance
    consistency       # Pattern consistency
)
```

### Safety Constraints

- Minimum 5 observations required
- Minimum effect size thresholds
- Only approved intervention types
- Never claim causation, only correlation
- All patterns flagged for clinician review

## Testing

```bash
# With demo data seeded in backend:
curl -X POST http://localhost:8000/detect-patterns \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "YOUR_PATIENT_ID"}'
```

## Dependencies

- fastapi: Web framework
- pymongo: MongoDB client
- pandas: Data manipulation
- numpy: Numerical computing
- scikit-learn: Statistical tests
- scipy: Scientific computing

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/pulseloop
PORT=8000
```
