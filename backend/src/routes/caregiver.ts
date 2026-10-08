import express from 'express';
import { protect, authorize } from '../middleware/auth';
import CaregiverConsent from '../models/CaregiverConsent';
import Medicine from '../models/Medicine';
import MedicineSchedule from '../models/MedicineSchedule';
import AdherenceRisk from '../models/AdherenceRisk';

const router = express.Router();

// @route   GET /api/caregiver/patients
// @desc    Get list of patients caregiver can monitor
// @access  Private (Caregiver only)
router.get('/patients', protect, authorize('caregiver'), async (req: any, res, next) => {
  try {
    const consents = await CaregiverConsent.find({
      caregiverId: req.user._id,
      isActive: true,
    }).populate('patientId', 'firstName lastName phoneNumber');
    res.json({ success: true, data: consents });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/caregiver/patients/:patientId/adherence
// @desc    Get patient adherence summary for caregiver
// @access  Private (Caregiver only)
router.get('/patients/:patientId/adherence', protect, authorize('caregiver'), async (req: any, res, next) => {
  try {
    // Verify caregiver has consent
    const consent = await CaregiverConsent.findOne({
      caregiverId: req.user._id,
      patientId: req.params.patientId,
      isActive: true,
    });

    if (!consent) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this patient',
      });
    }

    // Get medicines
    const medicines = await Medicine.find({
      patientId: req.params.patientId,
      isActive: true,
    });

    // Get today's schedule
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySchedules = await MedicineSchedule.find({
      patientId: req.params.patientId,
      scheduledFor: { $gte: startOfDay, $lte: endOfDay },
    });

    // Get high-risk alerts
    const risks = await AdherenceRisk.find({
      patientId: req.params.patientId,
      validUntil: { $gt: new Date() },
      riskLevel: { $in: ['high', 'critical'] },
    });

    // Calculate summary
    const overallAdherence = medicines.length > 0
      ? Math.round(medicines.reduce((sum, m) => sum + m.adherenceScore, 0) / medicines.length)
      : 100;

    const problematicMedicines = medicines.filter(m => m.isProblematic).length;
    const takenToday = todaySchedules.filter(s => s.status === 'taken').length;
    const pendingToday = todaySchedules.filter(s => s.status === 'pending' || s.status === 'snoozed').length;

    res.json({
      success: true,
      data: {
        overallAdherence,
        problematicMedicines,
        highRiskCount: risks.length,
        scheduledToday: todaySchedules.length,
        takenToday,
        pendingToday,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
