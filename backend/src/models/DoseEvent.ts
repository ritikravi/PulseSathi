import mongoose, { Schema, Document } from 'mongoose';

export interface IDoseEvent extends Document {
  scheduleId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  
  // Event details
  eventType: 'reminder-sent' | 'reminder-opened' | 'dose-taken' | 'dose-snoozed' | 'dose-missed' | 'dose-skipped';
  timestamp: Date;
  
  // Context
  metadata?: {
    reminderChannel?: 'push' | 'sms' | 'in-app';
    snoozeMinutes?: number;
    missReason?: 'auto' | 'manual';
    deviceType?: string;
    appVersion?: string;
    [key: string]: any;
  };
  
  createdAt: Date;
}

const doseEventSchema = new Schema<IDoseEvent>(
  {
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'MedicineSchedule',
      required: true,
      index: true,
    },
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['reminder-sent', 'reminder-opened', 'dose-taken', 'dose-snoozed', 'dose-missed', 'dose-skipped'],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for analytics
doseEventSchema.index({ patientId: 1, eventType: 1, timestamp: -1 });
doseEventSchema.index({ medicineId: 1, timestamp: -1 });

export default mongoose.model<IDoseEvent>('DoseEvent', doseEventSchema);
