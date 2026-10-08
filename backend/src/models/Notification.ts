import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'dose-reminder' | 'dose-overdue' | 'high-risk-alert' | 'caregiver-alert' | 'pattern-detected' | 'experiment-checkin';
  title: string;
  message: string;
  actionUrl?: string;
  relatedEntityType?: 'medicine' | 'schedule' | 'pattern' | 'experiment';
  relatedEntityId?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['dose-reminder', 'dose-overdue', 'high-risk-alert', 'caregiver-alert', 'pattern-detected', 'experiment-checkin'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  actionUrl: String,
  relatedEntityType: {
    type: String,
    enum: ['medicine', 'schedule', 'pattern', 'experiment'],
  },
  relatedEntityId: Schema.Types.ObjectId,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
