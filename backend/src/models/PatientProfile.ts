import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId;
  clinicianId?: mongoose.Types.ObjectId;
  
  // Demographics
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  language: string;
  
  // Medical
  diagnosisDate: Date;
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    timing: string[];
  }>;
  allergies: string[];
  comorbidities: string[];
  
  // Diabetes specific
  diabetesType: 'type1' | 'type2' | 'prediabetes';
  lastHbA1c?: number;
  lastHbA1cDate?: Date;
  targetGlucoseFasting: { min: number; max: number };
  targetGlucosePostMeal: { min: number; max: number };
  
  // Lifestyle
  dietPreference: string;
  activityLevel: string;
  smokingStatus: string;
  alcoholConsumption: string;
  
  // Notifications
  notificationPreferences: {
    medication: boolean;
    checkIn: boolean;
    experiment: boolean;
    insights: boolean;
  };
  
  // Consent
  familySharingEnabled: boolean;
  dataCollectionConsent: boolean;
  researchConsent: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const patientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    clinicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    diagnosisDate: {
      type: Date,
      required: true,
    },
    currentMedications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        timing: [String],
      },
    ],
    allergies: [String],
    comorbidities: [String],
    diabetesType: {
      type: String,
      enum: ['type1', 'type2', 'prediabetes'],
      required: true,
    },
    lastHbA1c: Number,
    lastHbA1cDate: Date,
    targetGlucoseFasting: {
      min: { type: Number, default: 70 },
      max: { type: Number, default: 100 },
    },
    targetGlucosePostMeal: {
      min: { type: Number, default: 70 },
      max: { type: Number, default: 140 },
    },
    dietPreference: String,
    activityLevel: String,
    smokingStatus: String,
    alcoholConsumption: String,
    notificationPreferences: {
      medication: { type: Boolean, default: true },
      checkIn: { type: Boolean, default: true },
      experiment: { type: Boolean, default: true },
      insights: { type: Boolean, default: true },
    },
    familySharingEnabled: { type: Boolean, default: false },
    dataCollectionConsent: { type: Boolean, default: true },
    researchConsent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPatientProfile>('PatientProfile', patientProfileSchema);
