import mongoose, { Schema, Document } from 'mongoose';

export interface IAdherenceRisk extends Document {
  patientId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  
  // Risk assessment
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictionHorizon: '24h' | '48h' | '7d';
  
  // Contributing factors
  factors: Array<{
    factor: string;
    contribution: number; // 0-100
    description: string;
  }>;
  
  // Recommendations
  recommendedIntervention?: {
    type: 'reminder' | 'personalized-message' | 'caregiver-alert' | 'clinician-review';
    priority: 'low' | 'medium' | 'high';
    message?: string;
  };
  
  // Model info
  modelVersion: string;
  modelType: 'rule-based' | 'ml-xgboost' | 'hybrid';
  
  // Validation
  actualOutcome?: 'adhered' | 'missed' | 'delayed';
  predictionAccurate?: boolean;
  
  calculatedAt: Date;
  validUntil: Date;
  
  createdAt: Date;
}

const adherenceRiskSchema = new Schema<IAdherenceRisk>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
      index: true,
    },
    predictionHorizon: {
      type: String,
      enum: ['24h', '48h', '7d'],
      default: '24h',
    },
    factors: [
      {
        factor: {
          type: String,
          required: true,
        },
        contribution: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    recommendedIntervention: {
      type: {
        type: String,
        enum: ['reminder', 'personalized-message', 'caregiver-alert', 'clinician-review'],
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
      message: String,
    },
    modelVersion: {
      type: String,
      default: '1.0.0-rule-based',
    },
    modelType: {
      type: String,
      enum: ['rule-based', 'ml-xgboost', 'hybrid'],
      default: 'rule-based',
    },
    actualOutcome: {
      type: String,
      enum: ['adhered', 'missed', 'delayed'],
    },
    predictionAccurate: Boolean,
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
adherenceRiskSchema.index({ patientId: 1, riskLevel: 1, calculatedAt: -1 });
adherenceRiskSchema.index({ patientId: 1, medicineId: 1, calculatedAt: -1 });
adherenceRiskSchema.index({ validUntil: 1 }); // For cleanup of expired predictions

export default mongoose.model<IAdherenceRisk>('AdherenceRisk', adherenceRiskSchema);
