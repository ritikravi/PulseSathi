import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'patient' | 'clinician' | 'caregiver' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  
  // WhatsApp integration
  whatsappPhone?: string; // International format with country code
  whatsappVerified: boolean;
  preferredLanguage: 'en' | 'hi'; // English or Hindi
  timezone: string; // e.g., 'Asia/Kolkata'
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['patient', 'clinician', 'caregiver', 'admin'],
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    whatsappPhone: {
      type: String,
      trim: true,
      sparse: true, // Allow null but ensure uniqueness when present
      index: true,
    },
    whatsappVerified: {
      type: Boolean,
      default: false,
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi'],
      default: 'hi', // Default to Hindi for Indian users
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
