import express from 'express';
import { protect, authorize } from '../middleware/auth';
import MealLog from '../models/MealLog';

const router = express.Router();

router.post('/', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const log = await MealLog.create({
      patientId: req.user._id,
      ...req.body,
    });
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req: any, res, next) => {
  try {
    const logs = await MealLog.find({ patientId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

export default router;
