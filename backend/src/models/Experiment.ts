import mongoose, { Schema, Document } from 'mongoose';

export interface IExperiment extends Document {
  patientId: mongoose.Types.ObjectId;
  patternId?: mongoose.Types.ObjectId;
  
  // Experiment design
  title: string;
  hypothesis: string;
  intervention: {
    type: string; // e.g., 'meal_timing', 'activity_increase', 'medication_adherence'
    description: string;
    specificAction: string;
    fromApprovedLibrary: boolean;
  };
  
  // Timeline
  baselineStartDate: Date;
  baselineEndDate: Date;
  interventionStartDate: Date;
  interventionEndDate: Date;
  durationDays: number;
  
  // Measurement
  primaryOutcome: {
    metric: string; // e.g., 'fasting_glucose'
    targetImprovement: string;
  };
  secondaryOutcomes: Array<{
    metric: string;
    targetImprovement: string;
  }>;
  
  // Status
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  currentDay: number;
  
  // Results (populated after completion)
  results?: {
    baselineAverage: number;
    interventionAverage: number;
    difference: number;
    percentageChange: number;
    improvement: boolean;
    completionRate: number;
    sampleSize: number;
    evidenceStrength: 'weak' | 'moderate' | 'strong';
    conclusion: string;
  };
  
  // Safety
  safetyNotes?: string;
  clinicianReviewed: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const experimentSchema = new Schema<IExperiment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patternId: {
      type: Schema.Types.ObjectId,
      ref: 'DetectedPattern',
    },
    title: {
      type: String,
      required: true,
    },
    hypothesis: {
      type: String,
      required: true,
    },
    intervention: {
      type: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      specificAction: {
        type: String,
        required: true,
      },
      fromApprovedLibrary: {
        type: Boolean,
        default: true,
      },
    },
    baselineStartDate: {
      type: Date,
      required: true,
    },
    baselineEndDate: {
      type: Date,
      required: true,
    },
    interventionStartDate: {
      type: Date,
      required: true,
    },
    interventionEndDate: {
      type: Date,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
    },
    primaryOutcome: {
      metric: {
        type: String,
        required: true,
      },
      targetImprovement: String,
    },
    secondaryOutcomes: [
      {
        metric: String,
        targetImprovement: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'abandoned'],
      default: 'pending',
    },
    currentDay: {
      type: Number,
      default: 0,
    },
    results: {
      baselineAverage: Number,
      interventionAverage: Number,
      difference: Number,
      percentageChange: Number,
      improvement: Boolean,
      completionRate: Number,
      sampleSize: Number,
      evidenceStrength: {
        type: String,
        enum: ['weak', 'moderate', 'strong'],
      },
      conclusion: String,
    },
    safetyNotes: String,
    clinicianReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

experimentSchema.index({ patientId: 1, status: 1, interventionStartDate: -1 });

export default mongoose.model<IExperiment>('Experiment', experimentSchema);
