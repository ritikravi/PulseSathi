import express from 'express';
import { z } from 'zod';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import PatientBehaviourProfile from '../models/PatientBehaviourProfile';
import { generateToken } from '../utils/generateToken';
import { protect } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['patient', 'clinician', 'caregiver']),
  phone: z.string().optional(),
  // Patient-specific fields
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  diabetesType: z.enum(['type1', 'type2', 'prediabetes']).optional(),
  diagnosisDate: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      email: validated.email,
      password: validated.password,
      firstName: validated.firstName,
      lastName: validated.lastName,
      role: validated.role,
      phone: validated.phone,
    });
    
    // If patient, create profile and behaviour profile
    if (validated.role === 'patient') {
      if (!validated.dateOfBirth || !validated.gender || !validated.diabetesType || !validated.diagnosisDate) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          error: 'Patient registration requires dateOfBirth, gender, diabetesType, and diagnosisDate',
        });
      }
      
      await PatientProfile.create({
        userId: user._id,
        dateOfBirth: new Date(validated.dateOfBirth),
        gender: validated.gender,
        diabetesType: validated.diabetesType,
        diagnosisDate: new Date(validated.diagnosisDate),
        language: 'en',
      });
      
      await PatientBehaviourProfile.create({
        patientId: user._id,
      });
    }
    
    const token = generateToken(user._id.toString());
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    
    const user = await User.findOne({ email: validated.email });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id.toString());
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req: any, res, next) => {
  try {
    let profileData = null;
    
    if (req.user.role === 'patient') {
      profileData = await PatientProfile.findOne({ userId: req.user._id });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          phone: req.user.phone,
        },
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
