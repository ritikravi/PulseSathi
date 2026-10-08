import express from 'express';
import { protect, authorize } from '../middleware/auth';
import PatientProfile from '../models/PatientProfile';
import PatientBehaviourProfile from '../models/PatientBehaviourProfile';

const router = express.Router();

// @route   GET /api/patient/profile
// @desc    Get patient profile
// @access  Private (Patient)
router.get('/profile', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id });
    const behaviourProfile = await PatientBehaviourProfile.findOne({ patientId: req.user._id });
    
    res.json({
      success: true,
      data: { profile, behaviourProfile },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/patient/profile
// @desc    Update patient profile
// @access  Private (Patient)
router.put('/profile', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/patient/dashboard
// @desc    Get patient dashboard summary
// @access  Private (Patient)
router.get('/dashboard', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const GlucoseReading = (await import('../models/GlucoseReading')).default;
    const MedicationLog = (await import('../models/MedicationLog')).default;
    const DetectedPattern = (await import('../models/DetectedPattern')).default;
    const Experiment = (await import('../models/Experiment')).default;
    
    const patientId = req.user._id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Latest glucose readings
    const latestGlucose = await GlucoseReading.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    // Medication adherence (last 7 days)
    const medications = await MedicationLog.find({
      patientId,
      scheduledTime: { $gte: sevenDaysAgo },
    });
    
    const totalMeds = medications.length;
    const takenMeds = medications.filter(m => m.status === 'taken').length;
    const adherenceRate = totalMeds > 0 ? (takenMeds / totalMeds) * 100 : 0;
    
    // Active patterns
    const activePatterns = await DetectedPattern.find({
      patientId,
      status: 'detected',
    }).limit(3);
    
    // Active experiment
    const activeExperiment = await Experiment.findOne({
      patientId,
      status: 'active',
    });
    
    res.json({
      success: true,
      data: {
        latestGlucose,
        adherenceRate: Math.round(adherenceRate),
        activePatterns,
        activeExperiment,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
