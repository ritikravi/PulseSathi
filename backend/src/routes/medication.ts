import express from 'express';
import { protect, authorize } from '../middleware/auth';
import MedicationLog from '../models/MedicationLog';

const router = express.Router();

router.post('/', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const log = await MedicationLog.create({
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
    const logs = await MedicationLog.find({ patientId: req.user._id })
      .sort({ scheduledTime: -1 })
      .limit(50);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

export default router;
