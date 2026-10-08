import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  patientId: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'custom';
  timings: string[];
  beforeAfterFood: 'before' | 'after' | 'anytime';
  instructions?: string;
  
  isProblematic: boolean;
  adherenceScore: number;
  consecutiveMisses: number;
  lastTaken?: Date;
  totalDosesScheduled: number;
  totalDosesTaken: number;
  
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  
  // Methods
  calculatePDC(): number;
  updateAdherenceScore(): void;
  
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema<IMedicine>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['once', 'twice', 'thrice', 'custom'],
      required: true,
    },
    timings: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length > 0 && v.length <= 4;
        },
        message: 'Timings must have 1-4 entries'
      }
    },
    beforeAfterFood: {
      type: String,
      enum: ['before', 'after', 'anytime'],
      required: true,
    },
    instructions: String,
    isProblematic: {
      type: Boolean,
      default: false,
    },
    adherenceScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    consecutiveMisses: {
      type: Number,
      default: 0,
    },
    lastTaken: Date,
    totalDosesScheduled: {
      type: Number,
      default: 0,
    },
    totalDosesTaken: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
medicineSchema.index({ patientId: 1, isActive: 1 });
medicineSchema.index({ patientId: 1, isProblematic: 1 });

// Calculate PDC (Proportion of Days Covered)
medicineSchema.methods.calculatePDC = function() {
  if (this.totalDosesScheduled === 0) return 100;
  return Math.round((this.totalDosesTaken / this.totalDosesScheduled) * 100);
};

// Update adherence score
medicineSchema.methods.updateAdherenceScore = function() {
  this.adherenceScore = this.calculatePDC();
  this.isProblematic = this.adherenceScore < 70 || this.consecutiveMisses >= 3;
};

export default mongoose.model<IMedicine>('Medicine', medicineSchema);
