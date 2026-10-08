import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicineSchedule extends Document {
  medicineId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  
  // Scheduling
  scheduledFor: Date;
  scheduledTime: string; // HH:MM format
  
  // Status tracking
  status: 'pending' | 'taken' | 'snoozed' | 'missed' | 'skipped';
  takenAt?: Date;
  delayMinutes?: number;
  
  // Reminder tracking
  remindersSent: number;
  lastReminderAt?: Date;
  snoozedUntil?: Date;
  
  // Response tracking
  responseType?: 'tap-taken' | 'tap-snooze' | 'auto-missed' | 'manual-skip' | 'whatsapp-taken' | 'whatsapp-not-yet';
  responseSource?: 'web' | 'whatsapp';
  notes?: string;
  
  // WhatsApp tracking
  whatsappReminderSent: boolean;
  whatsappMessageId?: string;
  whatsappResponseType?: 'TAKEN' | 'NOT_TAKEN_YET';
  whatsappResponseTimestamp?: Date;
  
  // Metadata
  beforeAfterFood: 'before' | 'after' | 'anytime';
  
  // Methods
  isOverdue(): boolean;
  getMinutesOverdue(): number;
  
  createdAt: Date;
  updatedAt: Date;
}

const medicineScheduleSchema = new Schema<IMedicineSchedule>(
  {
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
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'taken', 'snoozed', 'missed', 'skipped'],
      default: 'pending',
      index: true,
    },
    takenAt: Date,
    delayMinutes: Number,
    remindersSent: {
      type: Number,
      default: 0,
    },
    lastReminderAt: Date,
    snoozedUntil: Date,
    responseType: {
      type: String,
      enum: ['tap-taken', 'tap-snooze', 'auto-missed', 'manual-skip', 'whatsapp-taken', 'whatsapp-not-yet'],
    },
    responseSource: {
      type: String,
      enum: ['web', 'whatsapp'],
    },
    notes: String,
    whatsappReminderSent: {
      type: Boolean,
      default: false,
    },
    whatsappMessageId: String,
    whatsappResponseType: {
      type: String,
      enum: ['TAKEN', 'NOT_TAKEN_YET'],
    },
    whatsappResponseTimestamp: Date,
    beforeAfterFood: {
      type: String,
      enum: ['before', 'after', 'anytime'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
medicineScheduleSchema.index({ patientId: 1, scheduledFor: -1 });
medicineScheduleSchema.index({ patientId: 1, status: 1, scheduledFor: -1 });
medicineScheduleSchema.index({ medicineId: 1, scheduledFor: -1 });

// Helper method to check if dose is overdue
medicineScheduleSchema.methods.isOverdue = function() {
  if (this.status !== 'pending' && this.status !== 'snoozed') return false;
  
  const now = new Date();
  const checkTime = this.snoozedUntil || this.scheduledFor;
  
  return now > checkTime;
};

// Helper method to get minutes overdue
medicineScheduleSchema.methods.getMinutesOverdue = function() {
  if (!this.isOverdue()) return 0;
  
  const now = new Date();
  const checkTime = this.snoozedUntil || this.scheduledFor;
  
  return Math.floor((now.getTime() - checkTime.getTime()) / (1000 * 60));
};

export default mongoose.model<IMedicineSchedule>('MedicineSchedule', medicineScheduleSchema);
