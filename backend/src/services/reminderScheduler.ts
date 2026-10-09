import MedicineSchedule from '../models/MedicineSchedule';
import Medicine from '../models/Medicine';
import User from '../models/User';
import WhatsAppConsent from '../models/WhatsAppConsent';
import WhatsAppMessage from '../models/WhatsAppMessage';
import { sendWhatsAppReminder } from './twilioService';

class ReminderScheduler {
  private isRunning = false;
  private reminderMaxPerDose: number;
  private reminderLeadTimeMinutes: number;

  constructor() {
    this.reminderMaxPerDose = parseInt(process.env.REMINDER_MAX_PER_DOSE || '2');
    this.reminderLeadTimeMinutes = parseInt(process.env.REMINDER_LEAD_TIME_MINUTES || '15');
  }

  /**
   * Main scheduler function - find and send due reminders
   */
  async sendDueReminders(): Promise<void> {
    if (this.isRunning) {
      console.log('Reminder scheduler already running, skipping this cycle');
      return;
    }

    this.isRunning = true;

    try {
      console.log(`🔄 Reminder scheduler starting at ${new Date().toISOString()}`);

      const dueDoses = await this.findDueDoses();
      console.log(`Found ${dueDoses.length} doses due for reminders`);

      for (const schedule of dueDoses) {
        try {
          await this.sendReminder(schedule);
        } catch (error) {
          console.error(`Error sending reminder for schedule ${schedule._id}:`, error);
          // Continue with next reminder even if one fails
        }
      }

      console.log(`✅ Reminder scheduler completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Reminder scheduler error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Find doses that are due for WhatsApp reminders
   */
  private async findDueDoses(): Promise<any[]> {
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + this.reminderLeadTimeMinutes * 60 * 1000);

    // Find pending doses that:
    // 1. Are scheduled within the reminder window
    // 2. Haven't been marked as taken/skipped
    // 3. Haven't exceeded reminder limit
    // 4. Either have no reminder sent yet, or last reminder was sent and it's time for followup
    const dueDoses = await MedicineSchedule.find({
      status: { $in: ['pending', 'snoozed'] },
      scheduledFor: {
        $gte: now,
        $lte: reminderWindow,
      },
      remindersSent: { $lt: this.reminderMaxPerDose },
      whatsappReminderSent: { $ne: true }, // First reminder not sent yet
    })
      .populate('medicineId')
      .populate('patientId')
      .sort({ scheduledFor: 1 })
      .limit(50); // Process max 50 reminders per cycle

    // Filter by consent and quiet hours
    const eligibleDoses: any[] = [];

    for (const dose of dueDoses) {
      const patient = dose.patientId;
      if (!patient) continue;

      // Check if patient has active WhatsApp consent
      const consent = await WhatsAppConsent.findOne({
        patientId: patient._id,
        isActive: true,
        'communicationPreferences.doseReminders': true,
      });

      if (!consent) {
        continue; // Skip if no consent
      }

      // Check quiet hours
      if (this.isInQuietHours(consent)) {
        console.log(`Patient ${patient._id} in quiet hours, skipping`);
        continue;
      }

      eligibleDoses.push({
        schedule: dose,
        patient,
        consent,
        medicine: dose.medicineId,
      });
    }

    return eligibleDoses;
  }

  /**
   * Send WhatsApp reminder for a specific dose
   */
  private async sendReminder(doseData: any): Promise<void> {
    const { schedule, patient, consent, medicine } = doseData;

    if (!medicine) {
      console.error(`Medicine not found for schedule ${schedule._id}`);
      return;
    }

    console.log(`Sending reminder to ${patient.firstName} for ${medicine.name}`);

    // Format scheduled time
    const scheduledTime = schedule.scheduledTime;

    // Send WhatsApp message via Twilio
    const result = await sendWhatsAppReminder(
      consent.whatsappPhone,
      {
        patientName: patient.firstName,
        medicineName: medicine.name,
        dosage: medicine.dosage,
        scheduledTime,
        beforeAfterFood: schedule.beforeAfterFood,
        language: patient.preferredLanguage || 'hi',
      },
      schedule._id.toString()
    );

    if (result.success && result.messageId) {
      // Update schedule
      schedule.whatsappReminderSent = true;
      schedule.whatsappMessageId = result.messageId;
      schedule.remindersSent += 1;
      schedule.lastReminderAt = new Date();
      await schedule.save();

      // Store WhatsApp message record
      await WhatsAppMessage.create({
        patientId: patient._id,
        scheduleId: schedule._id,
        medicineId: medicine._id,
        direction: 'outgoing',
        whatsappMessageId: result.messageId,
        phoneNumber: consent.whatsappPhone,
        messageType: 'dose-reminder',
        templateName: 'dose_reminder', // If using approved template
        content: `Reminder for ${medicine.name}`,
        status: 'sent',
        sentAt: new Date(),
        metadata: {
          reminderNumber: schedule.remindersSent,
          language: patient.preferredLanguage,
          timezone: patient.timezone,
        },
      });

      console.log(`✅ Reminder sent successfully (Message ID: ${result.messageId})`);
    } else {
      console.error(`❌ Failed to send reminder: ${result.error}`);
      
      // Store failed message record for debugging
      await WhatsAppMessage.create({
        patientId: patient._id,
        scheduleId: schedule._id,
        medicineId: medicine._id,
        direction: 'outgoing',
        whatsappMessageId: `failed_${Date.now()}`,
        phoneNumber: consent.whatsappPhone,
        messageType: 'dose-reminder',
        content: `Reminder for ${medicine.name}`,
        status: 'failed',
        failureReason: result.error,
        sentAt: new Date(),
        metadata: {
          reminderNumber: schedule.remindersSent + 1,
          deliveryAttempts: 1,
        },
      });
    }
  }

  /**
   * Check if current time is within patient's quiet hours
   */
  private isInQuietHours(consent: any): boolean {
    if (!consent.communicationPreferences.quietHoursEnabled) {
      return false;
    }

    return consent.isQuietHours();
  }

  /**
   * Check if a specific dose can receive reminder
   */
  private canSendReminder(schedule: any): boolean {
    // Already exceeded max reminders
    if (schedule.remindersSent >= this.reminderMaxPerDose) {
      return false;
    }

    // Dose is already taken or skipped
    if (['taken', 'skipped', 'missed'].includes(schedule.status)) {
      return false;
    }

    return true;
  }

  /**
   * Send followup reminder for snoozed/not-taken-yet doses
   */
  async sendFollowupReminders(): Promise<void> {
    const now = new Date();

    // Find snoozed doses that are past their snooze time
    const overdueSnoozes = await MedicineSchedule.find({
      status: 'snoozed',
      snoozedUntil: { $lte: now },
      remindersSent: { $lt: this.reminderMaxPerDose },
    })
      .populate('medicineId')
      .populate('patientId')
      .limit(20);

    console.log(`Found ${overdueSnoozes.length} doses needing followup`);

    for (const schedule of overdueSnoozes) {
      try {
        const patient = schedule.patientId as any;
        const medicine = schedule.medicineId as any;

        const consent = await WhatsAppConsent.findOne({
          patientId: patient._id,
          isActive: true,
        });

        if (!consent || this.isInQuietHours(consent)) {
          continue;
        }

        // Send followup reminder
        await this.sendReminder({
          schedule,
          patient,
          consent,
          medicine,
        });
      } catch (error) {
        console.error(`Error sending followup for schedule ${schedule._id}:`, error);
      }
    }
  }
}

export default new ReminderScheduler();
