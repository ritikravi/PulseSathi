from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from pattern_detector import PatternDetector

load_dotenv()

app = FastAPI(title="PulseLoop ML Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pattern detector
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/pulseloop")
pattern_detector = PatternDetector(mongodb_uri)


class PatternDetectionRequest(BaseModel):
    patient_id: str
    min_observation_days: int = 14
    min_confidence: float = 0.6


class PatternResponse(BaseModel):
    patterns: List[dict]


@app.get("/")
def root():
    return {"service": "PulseLoop ML Service", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/detect-patterns", response_model=PatternResponse)
def detect_patterns(request: PatternDetectionRequest):
    """
    Detect behavioral patterns from patient data.
    
    Core algorithm:
    1. Load patient data (glucose, meals, activity, medication)
    2. Apply rule-based pattern detection
    3. Calculate statistical significance
    4. Return patterns with confidence scores
    
    This is NOT an AI diagnosis system.
    This detects correlations, not causation.
    """
    try:
        patterns = pattern_detector.detect_patterns(
            patient_id=request.patient_id,
            min_observation_days=request.min_observation_days,
            min_confidence=request.min_confidence
        )
        
        return PatternResponse(patterns=patterns)
    
    except Exception as e:
        print(f"Pattern detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
