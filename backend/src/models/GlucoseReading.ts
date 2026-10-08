import mongoose, { Schema, Document } from 'mongoose';

export interface IGlucoseReading extends Document {
  patientId: mongoose.Types.ObjectId;
  value: number;
  unit: 'mg/dL' | 'mmol/L';
  readingType: 'fasting' | 'post-meal' | 'random' | 'bedtime';
  timestamp: Date;
  source: 'manual' | 'glucometer' | 'cgm';
  notes?: string;
  mealContext?: {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    timeAfterMeal?: number; // minutes
  };
  createdAt: Date;
}

const glucoseReadingSchema = new Schema<IGlucoseReading>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: 20,
      max: 600,
    },
    unit: {
      type: String,
      enum: ['mg/dL', 'mmol/L'],
      default: 'mg/dL',
    },
    readingType: {
      type: String,
      enum: ['fasting', 'post-meal', 'random', 'bedtime'],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['manual', 'glucometer', 'cgm'],
      default: 'manual',
    },
    notes: String,
    mealContext: {
      mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      },
      timeAfterMeal: Number,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for efficient queries
glucoseReadingSchema.index({ patientId: 1, timestamp: -1 });

export default mongoose.model<IGlucoseReading>('GlucoseReading', glucoseReadingSchema);
