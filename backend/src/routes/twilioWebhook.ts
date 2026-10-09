import express from 'express';
import twilio from 'twilio';
import { protect } from '../middleware/auth';
import WhatsAppConsent from '../models/WhatsAppConsent';
import MedicineSchedule from '../models/MedicineSchedule';
import Medicine from '../models/Medicine';
import DoseEvent from '../models/DoseEvent';
import WhatsAppMessage from '../models/WhatsAppMessage';
import User from '../models/User';
import {
  parseIncomingResponse,
  verifyTwilioSignature,
  sendWhatsAppReminder,
  fromNumber,
  isTwilioLive,
} from '../services/twilioService';

const router = express.Router();

// A reply can only apply to a dose that is already due (or about to be), not
// to the future doses pre-generated for the rest of the week.
const LOOKBACK_HOURS = 12;

const replies = {
  en: {
    taken: (name: string) => `✅ Thanks! ${name} marked as taken.`,
    snoozed: `⏰ OK, we'll remind you again in 30 minutes.`,
    noDose: `No pending dose found right now. 🙏`,
    help: `Reply *1* if you've taken your medicine, or *2* if not yet.`,
  },
  hi: {
    taken: (name: string) => `✅ धन्यवाद! ${name} ले ली गई दर्ज कर दी है।`,
    snoozed: `⏰ ठीक है, हम 30 मिनट बाद फिर याद दिलाएंगे।`,
    noDose: `अभी कोई दवाई बाकी नहीं है। 🙏`,
    help: `दवाई ले ली हो तो *1* भेजें, अभी नहीं तो *2* भेजें।`,
  },
};

function sendTwiml(res: express.Response, text?: string) {
  const twiml = new twilio.twiml.MessagingResponse();
  if (text) twiml.message(text);
  res.type('text/xml').status(200).send(twiml.toString());
}

/**
 * @route   POST /api/twilio/webhook
 * @desc    Receive incoming WhatsApp messages from Twilio
 * @access  Public (Twilio signed)
 */
router.post('/webhook', express.urlencoded({ extended: false }), async (req, res) => {
  if (process.env.TWILIO_SKIP_SIGNATURE_CHECK !== 'true' && !verifyTwilioSignature(req)) {
    console.warn('❌ Rejected Twilio webhook: invalid or missing signature');
    return res.status(403).send('Invalid signature');
  }

  try {
    const from: string = req.body.From || ''; // format: "whatsapp:+91XXXXXXXXXX"
    const body: string = req.body.Body || '';
    const messageSid: string = req.body.MessageSid || '';

    const phone = from.replace('whatsapp:', '');
    console.log(`📥 Twilio message from ${phone}: "${body}"`);

    // Twilio retries on timeouts; don't record the same message twice
    const msgId = `twilio_${messageSid || Date.now()}`;
    if (messageSid && (await WhatsAppMessage.exists({ whatsappMessageId: msgId }))) {
      return sendTwiml(res);
    }

    const consent = await WhatsAppConsent.findOne({
      whatsappPhone: phone,
      isActive: true,
    });

    if (!consent) {
      console.log(`No patient found for ${phone}`);
      return sendTwiml(res);
    }

    const patientId = consent.patientId;
    const user = await User.findById(patientId).select('preferredLanguage');
    const t = replies[user?.preferredLanguage === 'en' ? 'en' : 'hi'];

    const response = parseIncomingResponse(body);
    if (!response) {
      console.log(`Unrecognized response: "${body}"`);
      return sendTwiml(res, t.help);
    }

    const now = new Date();
    const leadMs = parseInt(process.env.REMINDER_LEAD_TIME_MINUTES || '15') * 60 * 1000;

    // Most recent dose that is due now (within lead time) or recently overdue
    const schedule = await MedicineSchedule.findOne({
      patientId,
      status: { $in: ['pending', 'snoozed'] },
      scheduledFor: {
        $gte: new Date(now.getTime() - LOOKBACK_HOURS * 60 * 60 * 1000),
        $lte: new Date(now.getTime() + leadMs),
      },
    })
      .sort({ scheduledFor: -1 })
      .populate('medicineId');

    if (!schedule) {
      console.log(`No due schedule for patient ${patientId}`);
      return sendTwiml(res, t.noDose);
    }

    const medicineName = (schedule.medicineId as any)?.name || '';
    let replyText: string;

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

      console.log(`✅ Dose TAKEN recorded for ${medicineName}`);
      replyText = t.taken(medicineName);
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
      replyText = t.snoozed;
    }

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

    sendTwiml(res, replyText);
  } catch (err: any) {
    console.error('Twilio webhook error:', err.message);
    // Still 200 so Twilio doesn't retry a message we may have partly processed
    sendTwiml(res);
  }
});

/**
 * @route   POST /api/twilio/test
 * @desc    Send a test reminder to the logged-in patient's WhatsApp number
 * @access  Private
 */
router.post('/test', protect, async (req: any, res) => {
  try {
    const consent = await WhatsAppConsent.findOne({ patientId: req.user._id, isActive: true });
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: 'Enable WhatsApp reminders with your phone number first',
      });
    }

    const result = await sendWhatsAppReminder(
      consent.whatsappPhone,
      {
        patientName: req.user.firstName,
        medicineName: 'Test',
        dosage: '',
        scheduledTime: new Date().toTimeString().slice(0, 5),
        beforeAfterFood: 'anytime',
        language: req.user.preferredLanguage === 'en' ? 'en' : 'hi',
      },
      'test-message'
    );

    if (!result.success) {
      return res.status(502).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      data: { messageId: result.messageId, live: isTwilioLive(), to: consent.whatsappPhone },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to send test message' });
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
      live: isTwilioLive(),
      sandboxNumber: fromNumber(),
    },
  });
});

export default router;
