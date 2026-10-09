import express from 'express';
import WhatsAppConsent from '../models/WhatsAppConsent';
import MedicineSchedule from '../models/MedicineSchedule';
import Medicine from '../models/Medicine';
import DoseEvent from '../models/DoseEvent';
import WhatsAppMessage from '../models/WhatsAppMessage';
import { parseSMSResponse } from '../services/smsService';
import User from '../models/User';

const router = express.Router();

/**
 * @route   POST /api/sms/webhook
 * @desc    Receive incoming SMS replies from Twilio
 */
router.post('/webhook', express.urlencoded({ extended: false }), async (req, res) => {
  res.status(200).send('<Response></Response>');

  try {
    const from: string = (req.body.From || '').replace(/\s/g, '');
    const body: string = req.body.Body || '';

    console.log(`📥 SMS from ${from}: "${body}"`);

    // Find patient by phone number
    let patient = await User.findOne({ phone: from, role: 'patient' });
    if (!patient) patient = await User.findOne({ whatsappPhone: from, role: 'patient' });
    if (!patient) {
      // Try without country code
      const localNumber = from.replace('+91', '').replace('+1', '');
      patient = await User.findOne({ phone: { $regex: localNumber }, role: 'patient' });
    }

    if (!patient) {
      console.log(`No patient found for ${from}`);
      return;
    }

    const response = parseSMSResponse(body);
    if (!response) {
      console.log(`Unrecognized SMS: "${body}"`);
      return;
    }

    // Find most recent pending schedule
    const schedule = await MedicineSchedule.findOne({
      patientId: patient._id,
      status: { $in: ['pending', 'snoozed'] },
    }).sort({ scheduledFor: -1 }).populate('medicineId');

    if (!schedule) {
      console.log(`No pending schedule for ${patient._id}`);
      return;
    }

    const now = new Date();

    if (response === 'TAKEN') {
      const delay = Math.max(0, Math.floor((now.getTime() - schedule.scheduledFor.getTime()) / 60000));
      schedule.status = 'taken';
      schedule.takenAt = now;
      schedule.delayMinutes = delay;
      schedule.responseType = 'whatsapp-taken';
      schedule.responseSource = 'whatsapp';
      await schedule.save();

      const med = await Medicine.findById(schedule.medicineId);
      if (med) {
        med.totalDosesTaken += 1;
        med.lastTaken = now;
        med.consecutiveMisses = 0;
        med.updateAdherenceScore();
        await med.save();
      }

      await DoseEvent.create({
        scheduleId: schedule._id,
        medicineId: schedule.medicineId,
        patientId: patient._id,
        eventType: 'dose-taken',
        timestamp: now,
        metadata: { source: 'sms', phone: from },
      });

      console.log(`✅ SMS TAKEN recorded for ${(schedule.medicineId as any)?.name}`);
    } else {
      schedule.status = 'snoozed';
      schedule.snoozedUntil = new Date(now.getTime() + 30 * 60 * 1000);
      schedule.responseType = 'whatsapp-not-yet';
      schedule.responseSource = 'whatsapp';
      await schedule.save();

      await DoseEvent.create({
        scheduleId: schedule._id,
        medicineId: schedule.medicineId,
        patientId: patient._id,
        eventType: 'dose-snoozed',
        timestamp: now,
        metadata: { source: 'sms', snoozeMinutes: 30 },
      });

      console.log(`⏰ SMS NOT_TAKEN_YET recorded`);
    }

    // Log
    await WhatsAppMessage.create({
      patientId: patient._id,
      scheduleId: schedule._id,
      medicineId: schedule.medicineId,
      direction: 'incoming',
      whatsappMessageId: `sms_${req.body.SmsSid || Date.now()}`,
      phoneNumber: from,
      messageType: 'patient-response',
      content: body,
      status: 'sent',
      sentAt: now,
      metadata: { responseType: response, provider: 'sms' },
    });

  } catch (err: any) {
    console.error('SMS webhook error:', err.message);
  }
});

export default router;
