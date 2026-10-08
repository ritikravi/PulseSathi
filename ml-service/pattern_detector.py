from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from scipy import stats


class PatternDetector:
    """
    Rule-based + Statistical pattern detection engine.
    
    CRITICAL: This does NOT use AI for medical decisions.
    This detects correlations, NOT causation.
    All patterns must be validated through experiments.
    """
    
    def __init__(self, mongodb_uri: str):
        self.client = MongoClient(mongodb_uri)
        self.db = self.client.get_database()
    
    def detect_patterns(
        self,
        patient_id: str,
        min_observation_days: int = 14,
        min_confidence: float = 0.6
    ) -> List[Dict]:
        """Main pattern detection orchestrator."""
        
        patterns = []
        
        # Load patient data
        patient_data = self._load_patient_data(patient_id, min_observation_days)
        
        if not patient_data:
            return patterns
        
        # Pattern 1: Late dinner → Higher fasting glucose
        late_dinner_pattern = self._detect_late_dinner_pattern(patient_data)
        if late_dinner_pattern and late_dinner_pattern['confidenceScore'] >= min_confidence:
            patterns.append(late_dinner_pattern)
        
        # Pattern 2: Missed medication → Higher glucose
        medication_pattern = self._detect_medication_adherence_pattern(patient_data)
        if medication_pattern and medication_pattern['confidenceScore'] >= min_confidence:
            patterns.append(medication_pattern)
        
        # Pattern 3: Post-meal activity → Better glucose control
        activity_pattern = self._detect_post_meal_activity_pattern(patient_data)
        if activity_pattern and activity_pattern['confidenceScore'] >= min_confidence:
            patterns.append(activity_pattern)
        
        return patterns
    
    def _load_patient_data(self, patient_id: str, days: int) -> Optional[Dict]:
        """Load patient data for analysis."""
        
        try:
            patient_oid = ObjectId(patient_id)
        except:
            return None
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Glucose readings
        glucose_cursor = self.db.glucosereadings.find({
            'patientId': patient_oid,
            'timestamp': {'$gte': cutoff_date}
        }).sort('timestamp', 1)
        glucose_data = list(glucose_cursor)
        
        # Meal logs
        meal_cursor = self.db.meallogs.find({
            'patientId': patient_oid,
            'timestamp': {'$gte': cutoff_date}
        }).sort('timestamp', 1)
        meal_data = list(meal_cursor)
        
        # Activity logs
        activity_cursor = self.db.activitylogs.find({
            'patientId': patient_oid,
            'timestamp': {'$gte': cutoff_date}
        }).sort('timestamp', 1)
        activity_data = list(activity_cursor)
        
        # Medication logs
        medication_cursor = self.db.medicationlogs.find({
            'patientId': patient_oid,
            'scheduledTime': {'$gte': cutoff_date}
        }).sort('scheduledTime', 1)
        medication_data = list(medication_cursor)
        
        if not glucose_data:
            return None
        
        return {
            'glucose': glucose_data,
            'meals': meal_data,
            'activities': activity_data,
            'medications': medication_data,
            'patient_id': patient_id
        }
    
    def _detect_late_dinner_pattern(self, data: Dict) -> Optional[Dict]:
        """
        Detect: Late dinner (after 9 PM) → Higher fasting glucose next morning.
        
        Algorithm:
        1. Find dinner times
        2. Find next-morning fasting glucose
        3. Compare: late dinner days vs normal dinner days
        4. Calculate statistical significance
        """
        
        meals = data['meals']
        glucose = data['glucose']
        
        # Extract dinner meals
        dinners = [m for m in meals if m.get('mealType') == 'dinner']
        if len(dinners) < 5:
            return None
        
        # Pair dinners with next-morning fasting glucose
        pairs = []
        for dinner in dinners:
            dinner_time = dinner['timestamp']
            dinner_hour = dinner_time.hour
            
            # Find fasting glucose next morning (5 AM - 10 AM)
            next_morning_start = dinner_time.replace(hour=5, minute=0, second=0) + timedelta(days=1)
            next_morning_end = dinner_time.replace(hour=10, minute=0, second=0) + timedelta(days=1)
            
            fasting = next(
                (g for g in glucose 
                 if g['readingType'] == 'fasting' 
                 and next_morning_start <= g['timestamp'] <= next_morning_end),
                None
            )
            
            if fasting:
                pairs.append({
                    'dinner_hour': dinner_hour,
                    'is_late': dinner_hour >= 21,  # 9 PM or later
                    'glucose': fasting['value']
                })
        
        if len(pairs) < 5:
            return None
        
        # Separate into late vs normal dinner
        late_dinners = [p for p in pairs if p['is_late']]
        normal_dinners = [p for p in pairs if not p['is_late']]
        
        if len(late_dinners) < 3 or len(normal_dinners) < 3:
            return None
        
        late_glucose = [p['glucose'] for p in late_dinners]
        normal_glucose = [p['glucose'] for p in normal_dinners]
        
        late_avg = np.mean(late_glucose)
        normal_avg = np.mean(normal_glucose)
        difference = late_avg - normal_avg
        
        # Must show meaningful difference (at least 10 mg/dL)
        if difference < 10:
            return None
        
        # Statistical test (t-test)
        t_stat, p_value = stats.ttest_ind(late_glucose, normal_glucose)
        
        # Confidence score based on:
        # - Effect size
        # - Sample size
        # - Statistical significance (p-value)
        effect_size = difference / normal_avg
        sample_quality = min(len(late_dinners), len(normal_dinners)) / 5.0
        stat_confidence = 1 - p_value if p_value < 0.1 else 0
        
        confidence = min(
            (effect_size * 2 + sample_quality * 0.3 + stat_confidence * 0.5) / 2.8,
            0.95
        )
        
        if confidence < 0.5:
            return None
        
        percent_diff = (difference / normal_avg) * 100
        
        return {
            'patternType': 'correlation',
            'title': 'Late Dinner Pattern Detected',
            'description': f'Your fasting glucose was higher on {len(late_dinners)} of {len(pairs)} days following a late dinner (after 9 PM).',
            'feature1': {
                'type': 'meal_timing',
                'value': 'late_dinner_after_9pm'
            },
            'outcome': {
                'type': 'glucose_level',
                'metric': 'fasting_glucose'
            },
            'occurrences': len(late_dinners),
            'totalObservations': len(pairs),
            'confidenceScore': round(confidence, 2),
            'baselineAverage': round(normal_avg, 1),
            'patternAverage': round(late_avg, 1),
            'percentageDifference': round(percent_diff, 1),
            'effectSize': round(difference, 1),
            'observationPeriodDays': len(pairs),
            'suggestedIntervention': 'earlier_dinner',
            'aiExplanation': f'We observed a pattern in your data: On days when you had dinner after 9 PM, your fasting glucose the next morning averaged {round(late_avg)} mg/dL, compared to {round(normal_avg)} mg/dL after earlier dinners. This represents a {round(percent_diff)}% difference. Let\'s test whether eating dinner earlier helps improve your morning glucose readings.'
        }
    
    def _detect_medication_adherence_pattern(self, data: Dict) -> Optional[Dict]:
        """Detect: Missed medication → Higher glucose."""
        
        medications = data['medications']
        glucose = data['glucose']
        
        if len(medications) < 10:
            return None
        
        pairs = []
        for med in medications:
            scheduled = med['scheduledTime']
            status = med.get('status', 'pending')
            
            # Find glucose reading same day afternoon/evening
            same_day_end = scheduled.replace(hour=23, minute=59, second=59)
            
            glucose_reading = next(
                (g for g in glucose if scheduled <= g['timestamp'] <= same_day_end),
                None
            )
            
            if glucose_reading:
                pairs.append({
                    'taken': status == 'taken',
                    'glucose': glucose_reading['value']
                })
        
        if len(pairs) < 8:
            return None
        
        taken = [p['glucose'] for p in pairs if p['taken']]
        missed = [p['glucose'] for p in pairs if not p['taken']]
        
        if len(missed) < 3 or len(taken) < 5:
            return None
        
        taken_avg = np.mean(taken)
        missed_avg = np.mean(missed)
        difference = missed_avg - taken_avg
        
        if difference < 15:
            return None
        
        confidence = min(0.7 + (len(missed) / len(pairs)) * 0.2, 0.9)
        
        return {
            'patternType': 'correlation',
            'title': 'Medication Adherence Pattern',
            'description': f'Your glucose was higher on {len(missed)} days when medication was missed.',
            'feature1': {
                'type': 'medication_adherence',
                'value': 'missed_medication'
            },
            'outcome': {
                'type': 'glucose_level',
                'metric': 'daily_glucose'
            },
            'occurrences': len(missed),
            'totalObservations': len(pairs),
            'confidenceScore': round(confidence, 2),
            'baselineAverage': round(taken_avg, 1),
            'patternAverage': round(missed_avg, 1),
            'percentageDifference': round((difference / taken_avg) * 100, 1),
            'effectSize': round(difference, 1),
            'observationPeriodDays': len(pairs),
            'suggestedIntervention': 'medication_reminder',
            'aiExplanation': f'On days when you took your medication as scheduled, your glucose averaged {round(taken_avg)} mg/dL. On days when medication was missed, it averaged {round(missed_avg)} mg/dL. Consistent medication timing is important for glucose control.'
        }
    
    def _detect_post_meal_activity_pattern(self, data: Dict) -> Optional[Dict]:
        """Detect: Post-meal activity → Better post-meal glucose."""
        
        meals = data['meals']
        activities = data['activities']
        glucose = data['glucose']
        
        if len(meals) < 10:
            return None
        
        pairs = []
        for meal in meals:
            meal_time = meal['timestamp']
            
            # Check for activity within 60 minutes after meal
            activity_window_end = meal_time + timedelta(minutes=60)
            had_activity = any(
                a for a in activities 
                if meal_time <= a['timestamp'] <= activity_window_end
            )
            
            # Find post-meal glucose (1.5-3 hours after meal)
            glucose_window_start = meal_time + timedelta(minutes=90)
            glucose_window_end = meal_time + timedelta(minutes=180)
            
            post_meal_glucose = next(
                (g for g in glucose 
                 if glucose_window_start <= g['timestamp'] <= glucose_window_end),
                None
            )
            
            if post_meal_glucose:
                pairs.append({
                    'had_activity': had_activity,
                    'glucose': post_meal_glucose['value']
                })
        
        if len(pairs) < 8:
            return None
        
        with_activity = [p['glucose'] for p in pairs if p['had_activity']]
        without_activity = [p['glucose'] for p in pairs if not p['had_activity']]
        
        if len(with_activity) < 3 or len(without_activity) < 3:
            return None
        
        with_avg = np.mean(with_activity)
        without_avg = np.mean(without_activity)
        difference = without_avg - with_avg  # Positive if activity helps
        
        if difference < 10:
            return None
        
        confidence = min(0.65 + (min(len(with_activity), len(without_activity)) / 10) * 0.25, 0.85)
        
        return {
            'patternType': 'correlation',
            'title': 'Post-Meal Activity Pattern',
            'description': f'Your post-meal glucose was lower on {len(with_activity)} days when you were active after meals.',
            'feature1': {
                'type': 'physical_activity',
                'value': 'post_meal_activity'
            },
            'outcome': {
                'type': 'glucose_level',
                'metric': 'post_meal_glucose'
            },
            'occurrences': len(with_activity),
            'totalObservations': len(pairs),
            'confidenceScore': round(confidence, 2),
            'baselineAverage': round(without_avg, 1),
            'patternAverage': round(with_avg, 1),
            'percentageDifference': round((difference / without_avg) * 100, 1),
            'effectSize': round(difference, 1),
            'observationPeriodDays': len(pairs),
            'suggestedIntervention': 'post_meal_walk',
            'aiExplanation': f'When you had physical activity within an hour after eating, your post-meal glucose averaged {round(with_avg)} mg/dL. Without activity, it averaged {round(without_avg)} mg/dL. A short walk after meals may help manage your glucose levels.'
        }
