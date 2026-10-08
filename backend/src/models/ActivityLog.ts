import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  patientId: mongoose.Types.ObjectId;
  activityType: 'walking' | 'running' | 'cycling' | 'yoga' | 'gym' | 'household' | 'other';
  duration: number; // minutes
  intensity: 'light' | 'moderate' | 'vigorous';
  timestamp: Date;
  notes?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: ['walking', 'running', 'cycling', 'yoga', 'gym', 'household', 'other'],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    intensity: {
      type: String,
      enum: ['light', 'moderate', 'vigorous'],
      default: 'moderate',
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    notes: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activityLogSchema.index({ patientId: 1, timestamp: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
