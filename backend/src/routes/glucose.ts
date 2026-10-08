import express from 'express';
import { protect, authorize } from '../middleware/auth';
import GlucoseReading from '../models/GlucoseReading';
import { z } from 'zod';

const router = express.Router();

const glucoseSchema = z.object({
  value: z.number().min(20).max(600),
  readingType: z.enum(['fasting', 'post-meal', 'random', 'bedtime']),
  timestamp: z.string(),
  notes: z.string().optional(),
  mealContext: z.object({
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    timeAfterMeal: z.number().optional(),
  }).optional(),
});

// @route   POST /api/glucose
// @desc    Log glucose reading
// @access  Private (Patient)
router.post('/', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const validated = glucoseSchema.parse(req.body);
    
    const reading = await GlucoseReading.create({
      patientId: req.user._id,
      ...validated,
      timestamp: new Date(validated.timestamp),
    });
    
    res.status(201).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    next(error);
  }
});

// @route   GET /api/glucose
// @desc    Get glucose readings
// @access  Private
router.get('/', protect, async (req: any, res, next) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    const query: any = { patientId: req.user._id };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const readings = await GlucoseReading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
