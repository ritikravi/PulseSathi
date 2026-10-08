import mongoose, { Schema, Document } from 'mongoose';

export interface IDetectedPattern extends Document {
  patientId: mongoose.Types.ObjectId;
  patternType: 'correlation' | 'trend' | 'anomaly' | 'recurring';
  title: string;
  description: string;
  
  // Pattern details
  feature1: {
    type: string; // e.g., 'meal_timing', 'medication_adherence', 'activity'
    value: string;
  };
  feature2?: {
    type: string;
    value: string;
  };
  outcome: {
    type: string; // e.g., 'glucose_level'
    metric: string; // e.g., 'fasting_glucose'
  };
  
  // Evidence
  occurrences: number;
  totalObservations: number;
  confidenceScore: number; // 0-1
  effectSize?: number;
  
  // Statistical details
  baselineAverage?: number;
  patternAverage?: number;
  percentageDifference?: number;
  
  // Time context
  detectionDate: Date;
  observationPeriodDays: number;
  
  // Status
  status: 'detected' | 'experiment-created' | 'dismissed' | 'archived';
  dismissedReason?: string;
  
  // AI explanation
  aiExplanation?: string;
  suggestedIntervention?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const detectedPatternSchema = new Schema<IDetectedPattern>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patternType: {
      type: String,
      enum: ['correlation', 'trend', 'anomaly', 'recurring'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    feature1: {
      type: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    },
    feature2: {
      type: String,
      value: String,
    },
    outcome: {
      type: {
        type: String,
        required: true,
      },
      metric: {
        type: String,
        required: true,
      },
    },
    occurrences: {
      type: Number,
      required: true,
    },
    totalObservations: {
      type: Number,
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    effectSize: Number,
    baselineAverage: Number,
    patternAverage: Number,
    percentageDifference: Number,
    detectionDate: {
      type: Date,
      default: Date.now,
    },
    observationPeriodDays: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['detected', 'experiment-created', 'dismissed', 'archived'],
      default: 'detected',
    },
    dismissedReason: String,
    aiExplanation: String,
    suggestedIntervention: String,
  },
  {
    timestamps: true,
  }
);

detectedPatternSchema.index({ patientId: 1, status: 1, detectionDate: -1 });

export default mongoose.model<IDetectedPattern>('DetectedPattern', detectedPatternSchema);
