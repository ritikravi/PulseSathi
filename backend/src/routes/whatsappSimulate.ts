import express from 'express';
import { protect } from '../middleware/auth';
import MedicineSchedule from '../models/MedicineSchedule';
import Medicine from '../models/Medicine';
import DoseEvent from '../models/DoseEvent';
import WhatsAppMessage from '../models/WhatsAppMessage';
import WhatsAppConsent from '../models/WhatsAppConsent';

const router = express.Router();

/**
 * @route   POST /api/whatsapp/simulate
 * @desc    Simulate a WhatsApp response from a patient (DEMO MODE ONLY)
 * @access  Private
 */
router.post('/', protect, async (req: any, res) => {
  // Only available in demo/mock mode
  if (process.env.WHATSAPP_MODE === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Simulation not available in production mode',
    });
  }

  const { scheduleId, response } = req.body;

  if (!scheduleId || !['TAKEN', 'NOT_TAKEN_YET'].includes(response)) {
    return res.status(400).json({
      success: false,
      error: 'scheduleId and response (TAKEN or NOT_TAKEN_YET) are required',
    });
  }

  try {
    const schedule = await MedicineSchedule.findOne({
      _id: scheduleId,
      patientId: req.user._id,
    }).populate('medicineId');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }

    if (schedule.status === 'taken' || schedule.status === 'skipped') {
      return res.status(400).json({
        success: false,
        error: `Dose already ${schedule.status}`,
      });
    }

    const medicine = schedule.medicineId as any;
    const now = new Date();
    const mockMessageId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Get patient's WhatsApp phone for demo
    const consent = await WhatsAppConsent.findOne({ patientId: req.user._id });
    const demoPhone = consent?.whatsappPhone || '+910000000000';

    console.log(`\n🎭 DEMO: Simulating WhatsApp "${response}" for ${medicine?.name}`);

    if (response === 'TAKEN') {
      const delayMinutes = Math.floor(
        (now.getTime() - schedule.scheduledFor.getTime()) / 60000
      );

      schedule.status = 'taken';
      schedule.takenAt = now;
      schedule.delayMinutes = Math.max(0, delayMinutes);
      schedule.responseType = 'whatsapp-taken';
      schedule.responseSource = 'whatsapp';
      schedule.whatsappResponseType = 'TAKEN';
      schedule.whatsappResponseTimestamp = now;
      await schedule.save();

      // Update medicine adherence
      if (medicine) {
        medicine.totalDosesTaken += 1;
        medicine.lastTaken = now;
        medicine.consecutiveMisses = 0;
        medicine.updateAdherenceScore();
        await medicine.save();
      }

      // Log dose event
      await DoseEvent.create({
        scheduleId: schedule._id,
        medicineId: schedule.medicineId,
        patientId: req.user._id,
        eventType: 'dose-taken',
        timestamp: now,
        metadata: {
          source: 'whatsapp-simulated',
          delayMinutes: Math.max(0, delayMinutes),
          mockMessageId,
          isSimulated: true,
        },
      });

    } else {
      // NOT_TAKEN_YET
      schedule.status = 'snoozed';
      schedule.snoozedUntil = new Date(now.getTime() + 30 * 60 * 1000);
      schedule.responseType = 'whatsapp-not-yet';
      schedule.responseSource = 'whatsapp';
      schedule.whatsappResponseType = 'NOT_TAKEN_YET';
      schedule.whatsappResponseTimestamp = now;
      await schedule.save();

      await DoseEvent.create({
        scheduleId: schedule._id,
        medicineId: schedule.medicineId,
        patientId: req.user._id,
        eventType: 'dose-snoozed',
        timestamp: now,
        metadata: {
          source: 'whatsapp-simulated',
          snoozeMinutes: 30,
          mockMessageId,
          isSimulated: true,
        },
      });
    }

    // Store simulated message record for audit trail
    await WhatsAppMessage.create({
      patientId: req.user._id,
      scheduleId: schedule._id,
      medicineId: schedule.medicineId,
      direction: 'incoming',
      whatsappMessageId: mockMessageId,
      phoneNumber: demoPhone,
      messageType: 'patient-response',
      content: response,
      status: 'sent',
      sentAt: now,
      metadata: {
        responseType: response,
        isSimulated: true,
        simulatedBy: req.user._id,
      },
    });

    res.json({
      success: true,
      message: `Simulated WhatsApp response: ${response}`,
      data: {
        scheduleId,
        response,
        isSimulated: true,
        timestamp: now,
        newStatus: schedule.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/whatsapp/messages
 * @desc    Get WhatsApp message history for patient
 * @access  Private
 */
router.get('/messages', protect, async (req: any, res) => {
  try {
    const { limit = 20 } = req.query;

    const messages = await WhatsAppMessage.find({
      patientId: req.user._id,
    })
      .populate('medicineId', 'name dosage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
