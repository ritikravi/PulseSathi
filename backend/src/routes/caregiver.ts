import express from 'express';
import { protect, authorize } from '../middleware/auth';
import CaregiverConsent from '../models/CaregiverConsent';

const router = express.Router();

router.get('/patients', protect, authorize('caregiver'), async (req: any, res, next) => {
  try {
    const consents = await CaregiverConsent.find({
      caregiverId: req.user._id,
      isActive: true,
    }).populate('patientId', 'firstName lastName');
    res.json({ success: true, data: consents });
  } catch (error) {
    next(error);
  }
});

export default router;
