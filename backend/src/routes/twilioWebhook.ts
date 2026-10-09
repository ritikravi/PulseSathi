import express from 'express';
import WhatsAppConsent from '../models/WhatsAppConsent';
import MedicineSchedule from '../models/MedicineSchedule';
import Medicine from '../models/Medicine';
import DoseEvent from '../models/DoseEvent';
import WhatsAppMessage from '../models/WhatsAppMessage';
import { processIncomingTwilio } from '../services/twilioService';

const router = express.Router();

/**
 * @route   POST /api/twilio/webhook
 * @desc    Receive incoming WhatsApp messages from Twilio
 * @access  Public (Twilio signed)
 */
router.post('/webhook', express.urlencoded({ extended: false }), async (req, res) => {
  // Always respond 200 to Twilio immediately
  res.status(200).send('<Response></Response>');

  try {
    const from: string = req.body.From || ''; // format: "whatsapp:+91XXXXXXXXXX"
    const body: string = req.body.Body || '';

    const phone = from.replace('whatsapp:', '');
    console.log(`📥 Twilio message from ${phone}: "${body}"`);

    // Find patient by phone
    const consent = await WhatsAppConsent.findOne({
      whatsappPhone: phone,
      isActive: true,
    });

    if (!consent) {
      console.log(`No patient found for ${phone}`);
      return;
    }

    const patientId = consent.patientId;

    // Parse response
    const response = await processIncomingTwilio(phone, body);
    if (!response) {
      console.log(`Unrecognized response: "${body}"`);
      return;
    }

    // Find most recent pending/snoozed schedule
    const schedule = await MedicineSchedule.findOne({
      patientId,
      status: { $in: ['pending', 'snoozed'] },
    })
      .sort({ scheduledFor: -1 })
      .populate('medicineId');

    if (!schedule) {
      console.log(`No pending schedule for patient ${patientId}`);
      return;
    }

    const now = new Date();
    const msgId = `twilio_${req.body.MessageSid || Date.now()}`;

    if (response === 'TAKEN') {
      const delay = Math.max(0, Math.floor((now.getTime() - schedule.scheduledFor.getTime()) / 60000));
      schedule.status = 'taken';
      schedule.takenAt = now;
      schedule.delayMinutes = delay;
      schedule.responseType = 'whatsapp-taken';
      schedule.responseSource = 'whatsapp';
      schedule.whatsappResponseType = 'TAKEN';
      schedule.whatsappResponseTimestamp = now;
      await schedule.save();

      const medicine = await Medicine.findById(schedule.medicineId);
      if (medicine) {
        medicine.totalDosesTaken += 1;
        medicine.lastTaken = now;
        medicine.consecutiveMisses = 0;
        medicine.updateAdherenceScore();
        await medicine.save();
      }

      await DoseEvent.create({
        scheduleId: schedule._id,
        medicineId: schedule.medicineId,
        patientId,
        eventType: 'dose-taken',
        timestamp: now,
        metadata: { source: 'twilio-whatsapp', delayMinutes: delay },
      });

      console.log(`✅ Dose TAKEN recorded for ${(schedule.medicineId as any)?.name}`);
    } else {
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
        patientId,
        eventType: 'dose-snoozed',
        timestamp: now,
        metadata: { source: 'twilio-whatsapp', snoozeMinutes: 30 },
      });

      console.log(`⏰ NOT_TAKEN_YET recorded`);
    }

    // Store message log
    await WhatsAppMessage.create({
      patientId,
      scheduleId: schedule._id,
      medicineId: schedule.medicineId,
      direction: 'incoming',
      whatsappMessageId: msgId,
      phoneNumber: phone,
      messageType: 'patient-response',
      content: body,
      status: 'sent',
      sentAt: now,
      metadata: { responseType: response, provider: 'twilio' },
    });

  } catch (err: any) {
    console.error('Twilio webhook error:', err.message);
  }
});

/**
 * @route   GET /api/twilio/status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      provider: 'twilio',
      mode: process.env.WHATSAPP_MODE || 'mock',
      configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      sandboxNumber: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    },
  });
});

export default router;
