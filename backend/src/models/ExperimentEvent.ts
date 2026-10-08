import mongoose, { Schema, Document } from 'mongoose';

export interface IExperimentEvent extends Document {
  experimentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  eventType: 'check-in' | 'measurement' | 'note' | 'completion' | 'abandonment';
  dayNumber: number;
  timestamp: Date;
  
  // Check-in data
  adherenceStatus?: 'completed' | 'partial' | 'missed';
  notes?: string;
  measurements?: {
    glucose?: number;
    activity?: number;
    medicationTaken?: boolean;
  };
  
  createdAt: Date;
}

const experimentEventSchema = new Schema<IExperimentEvent>(
  {
    experimentId: {
      type: Schema.Types.ObjectId,
      ref: 'Experiment',
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['check-in', 'measurement', 'note', 'completion', 'abandonment'],
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    adherenceStatus: {
      type: String,
      enum: ['completed', 'partial', 'missed'],
    },
    notes: String,
    measurements: {
      glucose: Number,
      activity: Number,
      medicationTaken: Boolean,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

experimentEventSchema.index({ experimentId: 1, dayNumber: 1 });

export default mongoose.model<IExperimentEvent>('ExperimentEvent', experimentEventSchema);
