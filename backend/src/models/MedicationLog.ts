import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationLog extends Document {
  patientId: mongoose.Types.ObjectId;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: 'taken' | 'missed' | 'delayed' | 'pending';
  delayMinutes?: number;
  notes?: string;
  createdAt: Date;
}

const medicationLogSchema = new Schema<IMedicationLog>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    medicationName: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
      index: true,
    },
    takenTime: Date,
    status: {
      type: String,
      enum: ['taken', 'missed', 'delayed', 'pending'],
      default: 'pending',
    },
    delayMinutes: Number,
    notes: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

glucoseReadingSchema.index({ patientId: 1, scheduledTime: -1 });

export default mongoose.model<IMedicationLog>('MedicationLog', medicationLogSchema);
