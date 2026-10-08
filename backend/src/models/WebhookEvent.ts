import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookEvent extends Document {
  eventId: string; // Unique event ID from Meta or generated
  eventType: string; // message, status, etc.
  source: 'whatsapp' | 'other';
  
  // Processing status
  processed: boolean;
  processedAt?: Date;
  processingError?: string;
  
  // Related entities (resolved after processing)
  patientId?: mongoose.Types.ObjectId;
  scheduleId?: mongoose.Types.ObjectId;
  messageId?: mongoose.Types.ObjectId;
  
  // Raw data
  rawPayload: any;
  
  createdAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true, // Ensure idempotency
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['whatsapp', 'other'],
      default: 'whatsapp',
    },
    processed: {
      type: Boolean,
      default: false,
      index: true,
    },
    processedAt: Date,
    processingError: String,
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'MedicineSchedule',
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'WhatsAppMessage',
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for cleanup queries (delete old processed events)
webhookEventSchema.index({ processed: 1, createdAt: 1 });

export default mongoose.model<IWebhookEvent>('WebhookEvent', webhookEventSchema);
