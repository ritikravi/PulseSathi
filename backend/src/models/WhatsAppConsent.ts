import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppConsent extends Document {
  patientId: mongoose.Types.ObjectId;
  whatsappPhone: string; // with country code, e.g., +919876543210
  consentGiven: boolean;
  consentDate: Date;
  consentVersion: string;
  
  // Communication preferences
  communicationPreferences: {
    doseReminders: boolean;
    adherenceAlerts: boolean;
    caregiverNotifications: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string; // HH:MM format, e.g., "22:00"
    quietHoursEnd: string;   // HH:MM format, e.g., "07:00"
    reminderLeadTimeMinutes: number; // Remind X minutes before dose
  };
  
  // Status
  isActive: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  
  // Verification
  phoneVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  verifiedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppConsentSchema = new Schema<IWhatsAppConsent>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One consent per patient
      index: true,
    },
    whatsappPhone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          // Basic validation for international phone format
          return /^\+[1-9]\d{1,14}$/.test(v);
        },
        message: 'Phone number must be in international format (e.g., +919876543210)'
      },
      index: true, // For fast lookup during webhook processing
    },
    consentGiven: {
      type: Boolean,
      required: true,
      default: true,
    },
    consentDate: {
      type: Date,
      default: Date.now,
    },
    consentVersion: {
      type: String,
      default: '1.0.0',
    },
    communicationPreferences: {
      doseReminders: {
        type: Boolean,
        default: true,
      },
      adherenceAlerts: {
        type: Boolean,
        default: true,
      },
      caregiverNotifications: {
        type: Boolean,
        default: true,
      },
      quietHoursEnabled: {
        type: Boolean,
        default: true,
      },
      quietHoursStart: {
        type: String,
        default: '22:00',
      },
      quietHoursEnd: {
        type: String,
        default: '07:00',
      },
      reminderLeadTimeMinutes: {
        type: Number,
        default: 15, // Remind 15 minutes before scheduled time
        min: 0,
        max: 60,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    revokedAt: Date,
    revokedReason: String,
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationCodeExpiry: Date,
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for webhook processing - find patient by phone quickly
whatsAppConsentSchema.index({ whatsappPhone: 1, isActive: 1 });

// Helper method to check if within quiet hours
whatsAppConsentSchema.methods.isQuietHours = function(): boolean {
  if (!this.communicationPreferences.quietHoursEnabled) return false;
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const start = this.communicationPreferences.quietHoursStart;
  const end = this.communicationPreferences.quietHoursEnd;
  
  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (start > end) {
    return currentTime >= start || currentTime < end;
  }
  
  // Handle same-day quiet hours (e.g., 13:00 to 15:00)
  return currentTime >= start && currentTime < end;
};

export default mongoose.model<IWhatsAppConsent>('WhatsAppConsent', whatsAppConsentSchema);
