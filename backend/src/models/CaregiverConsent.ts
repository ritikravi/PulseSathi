import mongoose, { Schema, Document } from 'mongoose';

export interface ICaregiverConsent extends Document {
  patientId: mongoose.Types.ObjectId;
  caregiverId: mongoose.Types.ObjectId;
  relationship: string;
  
  // Access permissions
  permissions: {
    viewGlucoseData: boolean;
    viewMedications: boolean;
    viewExperiments: boolean;
    viewInsights: boolean;
    receiveAlerts: boolean;
  };
  
  // Consent
  consentDate: Date;
  consentVersion: string;
  isActive: boolean;
  revokedDate?: Date;
  revokedReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const caregiverConsentSchema = new Schema<ICaregiverConsent>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caregiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    permissions: {
      viewGlucoseData: { type: Boolean, default: true },
      viewMedications: { type: Boolean, default: true },
      viewExperiments: { type: Boolean, default: true },
      viewInsights: { type: Boolean, default: true },
      receiveAlerts: { type: Boolean, default: true },
    },
    consentDate: {
      type: Date,
      default: Date.now,
    },
    consentVersion: {
      type: String,
      default: '1.0',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    revokedDate: Date,
    revokedReason: String,
  },
  {
    timestamps: true,
  }
);

// Ensure unique patient-caregiver pairs
caregiverConsentSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true });

export default mongoose.model<ICaregiverConsent>('CaregiverConsent', caregiverConsentSchema);
