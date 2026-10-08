import mongoose, { Schema, Document } from 'mongoose';

export interface IMealLog extends Document {
  patientId: mongoose.Types.ObjectId;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
  foods: string[];
  portionSize: 'small' | 'medium' | 'large';
  carbohydrateEstimate?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: Date;
}

const mealLogSchema = new Schema<IMealLog>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    foods: [String],
    portionSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    carbohydrateEstimate: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    notes: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

mealLogSchema.index({ patientId: 1, timestamp: -1 });

export default mongoose.model<IMealLog>('MealLog', mealLogSchema);
