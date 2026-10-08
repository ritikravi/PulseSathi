import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppMessage extends Document {
  patientId: mongoose.Types.ObjectId;
  scheduleId?: mongoose.Types.ObjectId;
  medicineId?: mongoose.Types.ObjectId;
  
  // Message direction
  direction: 'outgoing' | 'incoming';
  
  // WhatsApp identifiers
  whatsappMessageId: string; // Meta's message ID
  phoneNumber: string;
  
  // Message details
  messageType: 'dose-reminder' | 'followup-reminder' | 'adherence-alert' | 'patient-response';
  templateName?: string;
  content: string;
  
  // Status tracking (for outgoing messages)
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  statusUpdatedAt?: Date;
  failureReason?: string;
  
  // Response tracking (for outgoing reminders)
  responseReceived: boolean;
  responseType?: 'TAKEN' | 'NOT_TAKEN_YET';
  responseTimestamp?: Date;
  responseMessageId?: string; // The incoming message ID that was the response
  
  // Metadata
  metadata: {
    reminderNumber?: number; // 1st, 2nd reminder for this dose
    language?: string;
    timezone?: string;
    deliveryAttempts?: number;
    [key: string]: any;
  };
  
  // Timestamps
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppMessageSchema = new Schema<IWhatsAppMessage>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'MedicineSchedule',
      index: true,
    },
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: 'Medicine',
      index: true,
    },
    direction: {
      type: String,
      enum: ['outgoing', 'incoming'],
      required: true,
      index: true,
    },
    whatsappMessageId: {
      type: String,
      required: true,
      unique: true, // Ensure no duplicate message IDs
      index: true, // For fast lookup when processing status updates
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ['dose-reminder', 'followup-reminder', 'adherence-alert', 'patient-response'],
      required: true,
      index: true,
    },
    templateName: String,
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
      index: true,
    },
    statusUpdatedAt: Date,
    failureReason: String,
    responseReceived: {
      type: Boolean,
      default: false,
      index: true,
    },
    responseType: {
      type: String,
      enum: ['TAKEN', 'NOT_TAKEN_YET'],
    },
    responseTimestamp: Date,
    responseMessageId: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
whatsAppMessageSchema.index({ patientId: 1, createdAt: -1 });
whatsAppMessageSchema.index({ scheduleId: 1, direction: 1 });
whatsAppMessageSchema.index({ patientId: 1, responseReceived: 1 });
whatsAppMessageSchema.index({ phoneNumber: 1, createdAt: -1 });

export default mongoose.model<IWhatsAppMessage>('WhatsAppMessage', whatsAppMessageSchema);
