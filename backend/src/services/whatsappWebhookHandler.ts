import User from '../models/User';
import WhatsAppConsent from '../models/WhatsAppConsent';
import MedicineSchedule from '../models/MedicineSchedule';
import Medicine from '../models/Medicine';
import WhatsAppMessage from '../models/WhatsAppMessage';
import DoseEvent from '../models/DoseEvent';
import WebhookEvent from '../models/WebhookEvent';
import { notifyHighRisk, notifyCaregiverAlert } from '../utils/notificationHelper';
import CaregiverConsent from '../models/CaregiverConsent';

class WhatsAppWebhookHandler {
  /**
   * Process incoming WhatsApp webhook event
   */
  async processWebhookEvent(webhookPayload: any): Promise<void> {
    try {
      // Extract event ID for idempotency
      const eventId = this.extractEventId(webhookPayload);
      
      // Check if already processed
      if (await this.isEventProcessed(eventId)) {
        console.log(`Event ${eventId} already processed, skipping`);
        return;
      }

      // Store webhook event
      const webhookEvent = await WebhookEvent.create({
        eventId,
        eventType: webhookPayload.entry?.[0]?.changes?.[0]?.field || 'unknown',
        source: 'whatsapp',
        processed: false,
        rawPayload: webhookPayload,
      });

      // Process based on event type
      const entry = webhookPayload.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        // Incoming message
        await this.processIncomingMessage(value, webhookEvent);
      } else if (value?.statuses) {
        // Status update (delivered, read, etc.)
        await this.processStatusUpdate(value, webhookEvent);
      }

      // Mark as processed
      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
      await webhookEvent.save();

    } catch (error: any) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  /**
   * Process incoming message from patient
   */
  private async processIncomingMessage(value: any, webhookEvent: any): Promise<void> {
    const message = value.messages?.[0];
    if (!message) return;

    const from = message.from; // WhatsApp phone number
    const messageId = message.id;
    const messageText = message.text?.body || '';
    const messageType = message.type;

    console.log(`Processing incoming message from ${from}: "${messageText}"`);

    // Resolve patient
    const patient = await this.resolvePatient(from);
    if (!patient) {
      console.log(`Patient not found for phone ${from}`);
      return;
    }

    webhookEvent.patientId = patient._id;
    await webhookEvent.save();

    // Process button reply if available
    if (message.interactive?.type === 'button_reply') {
      const buttonId = message.interactive.button_reply.id;
      await this.processButtonReply(buttonId, patient, from, messageId);
      return;
    }

    // Process text message
    if (messageType === 'text') {
      await this.processTextMessage(messageText, patient, from, messageId);
    }
  }

  /**
   * Process interactive button reply
   */
  private async processButtonReply(
    buttonId: string,
    patient: any,
    from: string,
    messageId: string
  ): Promise<void> {
    // Button ID format: "taken_{scheduleId}" or "not_yet_{scheduleId}"
    const [action, scheduleId] = buttonId.split('_');

    if (!scheduleId) {
      console.error('Invalid button ID format:', buttonId);
      return;
    }

    // Find the schedule
    const schedule = await MedicineSchedule.findOne({
      _id: scheduleId,
      patientId: patient._id,
    }).populate('medicineId');

    if (!schedule) {
      console.log(`Schedule ${scheduleId} not found for patient ${patient._id}`);
      return;
    }

    if (action === 'taken') {
      await this.recordTakenResponse(schedule, patient, from, messageId);
    } else if (action === 'not') { // "not_yet" becomes "not"
      await this.recordNotTakenYetResponse(schedule, patient, from, messageId);
    }
  }

  /**
   * Process text message (fallback for non-interactive flow)
   */
  private async processTextMessage(
    messageText: string,
    patient: any,
    from: string,
    messageId: string
  ): Promise<void> {
    const normalizedText = messageText.toLowerCase().trim();

    // Find the most recent pending reminder sent to this patient
    const recentReminder = await WhatsAppMessage.findOne({
      patientId: patient._id,
      direction: 'outgoing',
      responseReceived: false,
      scheduleId: { $exists: true },
    }).sort({ createdAt: -1 }).populate('scheduleId');

    if (!recentReminder || !recentReminder.scheduleId) {
      console.log('No pending reminder found for this patient');
      return;
    }

    const schedule: any = recentReminder.scheduleId;

    // Check for TAKEN responses
    const takenKeywords = ['taken', 'yes', 'done', 'ले ली', 'हाँ', 'ली', 'लिया'];
    if (takenKeywords.some(keyword => normalizedText.includes(keyword))) {
      await this.recordTakenResponse(schedule, patient, from, messageId);
      return;
    }

    // Check for NOT TAKEN YET responses
    const notYetKeywords = ['not yet', 'not taken', 'no', 'नहीं', 'अभी नहीं'];
    if (notYetKeywords.some(keyword => normalizedText.includes(keyword))) {
      await this.recordNotTakenYetResponse(schedule, patient, from, messageId);
      return;
    }

    console.log(`Unrecognized response: "${messageText}"`);
  }

  /**
   * Record TAKEN response
   */
  private async recordTakenResponse(
    schedule: any,
    patient: any,
    from: string,
    incomingMessageId: string
  ): Promise<void> {
    const now = new Date();
    const delayMinutes = Math.floor(
      (now.getTime() - schedule.scheduledFor.getTime()) / (1000 * 60)
    );

    console.log(`Recording TAKEN response for schedule ${schedule._id}`);

    // Update schedule
    schedule.status = 'taken';
    schedule.takenAt = now;
    schedule.delayMinutes = delayMinutes;
    schedule.responseType = 'whatsapp-taken';
    schedule.responseSource = 'whatsapp';
    schedule.whatsappResponseType = 'TAKEN';
    schedule.whatsappResponseTimestamp = now;
    await schedule.save();

    // Update medicine adherence
    const medicine = await Medicine.findById(schedule.medicineId);
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
      patientId: patient._id,
      eventType: 'dose-taken',
      timestamp: now,
      metadata: {
        source: 'whatsapp',
        delayMinutes,
        whatsappMessageId: incomingMessageId,
        phoneNumber: from,
      },
    });

    // Update WhatsApp message record
    await WhatsAppMessage.updateOne(
      { scheduleId: schedule._id, direction: 'outgoing', responseReceived: false },
      {
        responseReceived: true,
        responseType: 'TAKEN',
        responseTimestamp: now,
        responseMessageId: incomingMessageId,
      }
    );

    // Store incoming message
    await WhatsAppMessage.create({
      patientId: patient._id,
      scheduleId: schedule._id,
      medicineId: schedule.medicineId,
      direction: 'incoming',
      whatsappMessageId: incomingMessageId,
      phoneNumber: from,
      messageType: 'patient-response',
      content: 'TAKEN',
      status: 'sent',
      sentAt: now,
      metadata: { responseType: 'TAKEN' },
    });

    console.log(`✅ Successfully recorded TAKEN response`);
  }

  /**
   * Record NOT TAKEN YET response
   */
  private async recordNotTakenYetResponse(
    schedule: any,
    patient: any,
    from: string,
    incomingMessageId: string
  ): Promise<void> {
    const now = new Date();

    console.log(`Recording NOT_TAKEN_YET response for schedule ${schedule._id}`);

    // Keep status as pending or snoozed
    if (schedule.status === 'pending') {
      schedule.status = 'snoozed';
      schedule.snoozedUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    }
    
    schedule.responseType = 'whatsapp-not-yet';
    schedule.responseSource = 'whatsapp';
    schedule.whatsappResponseType = 'NOT_TAKEN_YET';
    schedule.whatsappResponseTimestamp = now;
    await schedule.save();

    // Log dose event
    await DoseEvent.create({
      scheduleId: schedule._id,
      medicineId: schedule.medicineId,
      patientId: patient._id,
      eventType: 'dose-snoozed',
      timestamp: now,
      metadata: {
        source: 'whatsapp',
        whatsappMessageId: incomingMessageId,
        phoneNumber: from,
        snoozeMinutes: 30,
      },
    });

    // Update WhatsApp message record
    await WhatsAppMessage.updateOne(
      { scheduleId: schedule._id, direction: 'outgoing', responseReceived: false },
      {
        responseReceived: true,
        responseType: 'NOT_TAKEN_YET',
        responseTimestamp: now,
        responseMessageId: incomingMessageId,
      }
    );

    // Store incoming message
    await WhatsAppMessage.create({
      patientId: patient._id,
      scheduleId: schedule._id,
      medicineId: schedule.medicineId,
      direction: 'incoming',
      whatsappMessageId: incomingMessageId,
      phoneNumber: from,
      messageType: 'patient-response',
      content: 'NOT_TAKEN_YET',
      status: 'sent',
      sentAt: now,
      metadata: { responseType: 'NOT_TAKEN_YET' },
    });

    console.log(`⏰ Successfully recorded NOT_TAKEN_YET response`);
  }

  /**
   * Process status update (delivered, read, failed)
   */
  private async processStatusUpdate(value: any, webhookEvent: any): Promise<void> {
    const status = value.statuses?.[0];
    if (!status) return;

    const messageId = status.id;
    const statusType = status.status; // sent, delivered, read, failed

    console.log(`Status update for message ${messageId}: ${statusType}`);

    // Update WhatsApp message record
    const updateData: any = {
      status: statusType,
      statusUpdatedAt: new Date(),
    };

    if (statusType === 'delivered') {
      updateData.deliveredAt = new Date(status.timestamp * 1000);
    } else if (statusType === 'read') {
      updateData.readAt = new Date(status.timestamp * 1000);
    } else if (statusType === 'failed') {
      updateData.failureReason = status.errors?.[0]?.title || 'Unknown error';
    }

    await WhatsAppMessage.updateOne(
      { whatsappMessageId: messageId },
      updateData
    );
  }

  /**
   * Resolve patient from WhatsApp phone number
   */
  private async resolvePatient(whatsappPhone: string): Promise<any> {
    const consent = await WhatsAppConsent.findOne({
      whatsappPhone,
      isActive: true,
    }).populate('patientId');

    return consent?.patientId || null;
  }

  /**
   * Check if event already processed (idempotency)
   */
  private async isEventProcessed(eventId: string): Promise<boolean> {
    const existing = await WebhookEvent.findOne({ eventId });
    return existing?.processed || false;
  }

  /**
   * Extract unique event ID from webhook payload
   */
  private extractEventId(webhookPayload: any): string {
    // Try to get message ID or status ID
    const entry = webhookPayload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages?.[0]?.id) {
      return value.messages[0].id;
    }

    if (value?.statuses?.[0]?.id) {
      return `status_${value.statuses[0].id}_${value.statuses[0].timestamp}`;
    }

    // Fallback: generate from timestamp and entry ID
    return `event_${entry?.id}_${Date.now()}`;
  }
}

export default new WhatsAppWebhookHandler();
