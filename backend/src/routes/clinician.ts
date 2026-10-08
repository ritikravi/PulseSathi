import express from 'express';
import { protect, authorize } from '../middleware/auth';
import PatientProfile from '../models/PatientProfile';
import User from '../models/User';

const router = express.Router();

router.get('/patients', protect, authorize('clinician'), async (req: any, res, next) => {
  try {
    const patients = await PatientProfile.find({ clinicianId: req.user._id })
      .populate('userId', 'firstName lastName email');
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
});

export default router;
