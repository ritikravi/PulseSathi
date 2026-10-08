import express from 'express';
import { protect } from '../middleware/auth';
import Medicine from '../models/Medicine';
import MedicineSchedule from '../models/MedicineSchedule';
import AdherenceRisk from '../models/AdherenceRisk';
import CaregiverConsent from '../models/CaregiverConsent';
import { notifyHighRisk, notifyCaregiverAlert } from '../utils/notificationHelper';

const router = express.Router();

// @route   GET /api/adherence/overview
// @desc    Get patient's overall adherence overview
// @access  Private
router.get('/overview', protect, async (req: any, res) => {
  try {
    const medicines = await Medicine.find({
      patientId: req.user._id,
      isActive: true,
    });

    const overview = {
      overallAdherence: 0,
      totalMedicines: medicines.length,
      problematicMedicines: 0,
      medicineDetails: [] as any[],
    };

    let totalAdherence = 0;

    for (const medicine of medicines) {
      const adherenceData = {
        medicineId: medicine._id,
        name: medicine.name,
        dosage: medicine.dosage,
        adherenceScore: medicine.adherenceScore,
        isProblematic: medicine.isProblematic,
        consecutiveMisses: medicine.consecutiveMisses,
        status: medicine.adherenceScore >= 80 ? 'good' : medicine.adherenceScore >= 60 ? 'fair' : 'poor',
      };

      overview.medicineDetails.push(adherenceData);
      totalAdherence += medicine.adherenceScore;

      if (medicine.isProblematic) {
        overview.problematicMedicines += 1;
      }
    }

    overview.overallAdherence = medicines.length > 0
      ? Math.round(totalAdherence / medicines.length)
      : 100;

    res.json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/adherence/medicine/:medicineId
// @desc    Get detailed adherence for specific medicine
// @access  Private
router.get('/medicine/:medicineId', protect, async (req: any, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.medicineId,
      patientId: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found',
      });
    }

    // Get schedules for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const schedules = await MedicineSchedule.find({
      medicineId: medicine._id,
      scheduledFor: { $gte: thirtyDaysAgo },
    }).sort({ scheduledFor: -1 });

    // Calculate patterns
    const patterns = {
      timeOfDay: {
        morning: { taken: 0, missed: 0 },
        afternoon: { taken: 0, missed: 0 },
        evening: { taken: 0, missed: 0 },
        night: { taken: 0, missed: 0 },
      },
      dayOfWeek: {
        weekday: { taken: 0, missed: 0 },
        weekend: { taken: 0, missed: 0 },
      },
    };

    for (const schedule of schedules) {
      const hour = schedule.scheduledFor.getHours();
      const dayOfWeek = schedule.scheduledFor.getDay();
      
      let timeSlot = 'morning';
      if (hour >= 12 && hour < 17) timeSlot = 'afternoon';
      else if (hour >= 17 && hour < 21) timeSlot = 'evening';
      else if (hour >= 21 || hour < 6) timeSlot = 'night';

      const dayType = dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday';

      if (schedule.status === 'taken') {
        patterns.timeOfDay[timeSlot].taken += 1;
        patterns.dayOfWeek[dayType].taken += 1;
      } else if (schedule.status === 'missed') {
        patterns.timeOfDay[timeSlot].missed += 1;
        patterns.dayOfWeek[dayType].missed += 1;
      }
    }

    res.json({
      success: true,
      data: {
        medicine: {
          name: medicine.name,
          dosage: medicine.dosage,
          adherenceScore: medicine.adherenceScore,
          isProblematic: medicine.isProblematic,
          consecutiveMisses: medicine.consecutiveMisses,
        },
        patterns,
        recentSchedules: schedules.slice(0, 10),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/adherence/calculate-risk
// @desc    Calculate adherence risk for patient
// @access  Private
router.post('/calculate-risk', protect, async (req: any, res) => {
  try {
    const medicines = await Medicine.find({
      patientId: req.user._id,
      isActive: true,
    });

    const riskAssessments = [];

    for (const medicine of medicines) {
      const risk = await calculateAdherenceRisk(req.user._id, medicine);
      riskAssessments.push(risk);
    }

    res.json({
      success: true,
      data: riskAssessments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/adherence/risks
// @desc    Get current risk assessments
// @access  Private
router.get('/risks', protect, async (req: any, res) => {
  try {
    const risks = await AdherenceRisk.find({
      patientId: req.user._id,
      validUntil: { $gt: new Date() },
    })
      .populate('medicineId')
      .sort({ riskLevel: -1, calculatedAt: -1 });

    res.json({
      success: true,
      data: risks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Helper function: Calculate adherence risk (Rule-based)
async function calculateAdherenceRisk(patientId: any, medicine: any) {
  let riskScore = 0;
  const factors = [];

  // Factor 1: Consecutive misses (40% weight)
  if (medicine.consecutiveMisses >= 3) {
    riskScore += 40;
    factors.push({
      factor: 'consecutive_misses',
      contribution: 40,
      description: `${medicine.name} missed ${medicine.consecutiveMisses} times in a row`,
    });
  } else if (medicine.consecutiveMisses === 2) {
    riskScore += 25;
    factors.push({
      factor: 'consecutive_misses',
      contribution: 25,
      description: `${medicine.name} missed 2 times in a row`,
    });
  } else if (medicine.consecutiveMisses === 1) {
    riskScore += 10;
    factors.push({
      factor: 'recent_miss',
      contribution: 10,
      description: `${medicine.name} was missed recently`,
    });
  }

  // Factor 2: PDC decline (30% weight)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSchedules = await MedicineSchedule.find({
    medicineId: medicine._id,
    scheduledFor: { $gte: sevenDaysAgo },
  });

  if (recentSchedules.length > 0) {
    const recentTaken = recentSchedules.filter((s) => s.status === 'taken').length;
    const recentPDC = (recentTaken / recentSchedules.length) * 100;
    
    const pdcDiff = medicine.adherenceScore - recentPDC;
    
    if (pdcDiff > 15) {
      riskScore += 30;
      factors.push({
        factor: 'declining_adherence',
        contribution: 30,
        description: `Adherence declining (from ${medicine.adherenceScore}% to ${Math.round(recentPDC)}%)`,
      });
    } else if (pdcDiff > 10) {
      riskScore += 20;
      factors.push({
        factor: 'declining_adherence',
        contribution: 20,
        description: `Adherence slightly declining`,
      });
    }
  }

  // Factor 3: Snooze frequency (20% weight)
  const recentSnoozes = recentSchedules.filter((s) => s.status === 'snoozed').length;
  if (recentSnoozes >= 5) {
    riskScore += 20;
    factors.push({
      factor: 'frequent_snoozing',
      contribution: 20,
      description: `Dose reminders snoozed ${recentSnoozes} times recently`,
    });
  } else if (recentSnoozes >= 3) {
    riskScore += 10;
    factors.push({
      factor: 'snoozing',
      contribution: 10,
      description: `Some dose reminders were snoozed`,
    });
  }

  // Factor 4: Always delayed (10% weight)
  const takenSchedules = recentSchedules.filter((s) => s.status === 'taken' && s.delayMinutes);
  if (takenSchedules.length > 0) {
    const avgDelay = takenSchedules.reduce((sum, s) => sum + (s.delayMinutes || 0), 0) / takenSchedules.length;
    if (avgDelay > 60) {
      riskScore += 10;
      factors.push({
        factor: 'consistent_delays',
        contribution: 10,
        description: `Doses consistently delayed by ${Math.round(avgDelay)} minutes`,
      });
    }
  }

  riskScore = Math.min(riskScore, 100);

  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore < 30) riskLevel = 'low';
  else if (riskScore < 60) riskLevel = 'medium';
  else if (riskScore < 80) riskLevel = 'high';
  else riskLevel = 'critical';

  // Recommend intervention
  let recommendedIntervention;
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendedIntervention = {
      type: 'caregiver-alert' as const,
      priority: 'high' as const,
      message: `${medicine.name} adherence needs attention`,
    };
  } else if (riskLevel === 'medium') {
    recommendedIntervention = {
      type: 'personalized-message' as const,
      priority: 'medium' as const,
      message: `Gentle reminder about ${medicine.name}`,
    };
  }

  // Save risk assessment
  const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const riskAssessment = await AdherenceRisk.create({
    patientId,
    medicineId: medicine._id,
    riskScore,
    riskLevel,
    predictionHorizon: '24h',
    factors,
    recommendedIntervention,
    modelType: 'rule-based',
    modelVersion: '1.0.0-rule-based',
    calculatedAt: new Date(),
    validUntil,
  });

  // Send notifications for high risk
  if (riskLevel === 'high' || riskLevel === 'critical') {
    // Notify patient
    await notifyHighRisk(patientId, medicine.name, riskLevel);

    // Notify caregiver if intervention recommends it
    if (recommendedIntervention?.type === 'caregiver-alert') {
      const caregiverConsents = await CaregiverConsent.find({
        patientId,
        isActive: true,
        'permissions.receiveAlerts': true,
      });

      for (const consent of caregiverConsents) {
        await notifyCaregiverAlert(
          consent.caregiverId.toString(),
          'Patient',
          medicine.name
        );
      }
    }
  }

  return riskAssessment;
}

export default router;
