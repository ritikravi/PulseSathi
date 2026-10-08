import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientBehaviourProfile extends Document {
  patientId: mongoose.Types.ObjectId;
  
  // Adherence patterns
  medicationAdherenceRate: number; // 0-1
  checkInConsistency: number; // 0-1
  experimentCompletionRate: number; // 0-1
  
  // Response patterns
  successfulInterventions: Array<{
    interventionType: string;
    description: string;
    effectSize: number;
    successRate: number;
    lastUsed: Date;
  }>;
  
  unsuccessfulInterventions: Array<{
    interventionType: string;
    description: string;
    reason: string;
    lastTried: Date;
  }>;
  
  // Engagement patterns
  preferredCheckInTime: string;
  averageResponseTime: number; // minutes
  notificationResponseRate: number; // 0-1
  
  // Behavioral insights
  motivationalProfile: {
    respondsToGoals: boolean;
    respondsToComparison: boolean;
    respondsToFamilySupport: boolean;
    respondsToData: boolean;
  };
  
  // Risk factors
  riskFactors: string[];
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const patientBehaviourProfileSchema = new Schema<IPatientBehaviourProfile>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    medicationAdherenceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    checkInConsistency: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    experimentCompletionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    successfulInterventions: [
      {
        interventionType: String,
        description: String,
        effectSize: Number,
        successRate: Number,
        lastUsed: Date,
      },
    ],
    unsuccessfulInterventions: [
      {
        interventionType: String,
        description: String,
        reason: String,
        lastTried: Date,
      },
    ],
    preferredCheckInTime: String,
    averageResponseTime: Number,
    notificationResponseRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    motivationalProfile: {
      respondsToGoals: { type: Boolean, default: true },
      respondsToComparison: { type: Boolean, default: false },
      respondsToFamilySupport: { type: Boolean, default: true },
      respondsToData: { type: Boolean, default: true },
    },
    riskFactors: [String],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPatientBehaviourProfile>(
  'PatientBehaviourProfile',
  patientBehaviourProfileSchema
);
