import axios from 'axios';
import crypto from 'crypto';

interface DoseReminderData {
  patientName: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  beforeAfterFood: string;
  language: 'en' | 'hi';
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private apiVersion: string;
  private mode: 'mock' | 'production';
  private appSecret: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    this.mode = (process.env.WHATSAPP_MODE as 'mock' | 'production') || 'mock';
    this.appSecret = process.env.WHATSAPP_APP_SECRET || '';
  }

  /**
   * Send dose reminder via WhatsApp
   */
  async sendDoseReminder(
    phoneNumber: string,
    data: DoseReminderData,
    scheduleId: string
  ): Promise<WhatsAppResponse> {
    if (this.mode === 'mock') {
      return this.sendMockReminder(phoneNumber, data, scheduleId);
    }

    try {
      // Format message based on language
      const message = this.formatReminderMessage(data);
      
      // For now, send as text message with instructions
      // In production with approved template, use interactive buttons
      const response = await axios.post(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send interactive button message (requires approved template)
   */
  async sendInteractiveReminder(
    phoneNumber: string,
    data: DoseReminderData,
    scheduleId: string
  ): Promise<WhatsAppResponse> {
    if (this.mode === 'mock') {
      return this.sendMockReminder(phoneNumber, data, scheduleId);
    }

    try {
      const message = this.formatReminderMessage(data);
      
      const response = await axios.post(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: message,
            },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: `taken_${scheduleId}`,
                    title: data.language === 'hi' ? 'हाँ, ले ली' : 'TAKEN',
                  },
                },
                {
                  type: 'reply',
                  reply: {
                    id: `not_yet_${scheduleId}`,
                    title: data.language === 'hi' ? 'नहीं, अभी नहीं' : 'NOT YET',
                  },
                },
              ],
            },
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      
      // Fallback to text message if interactive fails
      if (error.response?.data?.error?.code === 131051) {
        console.log('Interactive message not supported, falling back to text');
        return this.sendDoseReminder(phoneNumber, data, scheduleId);
      }
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Format reminder message in appropriate language
   */
  private formatReminderMessage(data: DoseReminderData): string {
    if (data.language === 'hi') {
      const foodInstruction = 
        data.beforeAfterFood === 'before' ? '☕ खाने से पहले' :
        data.beforeAfterFood === 'after' ? '🍽️ खाने के बाद' :
        '⏰ किसी भी समय';
      
      return `नमस्ते ${data.patientName} जी 🙏

आपकी दवाई का समय हो गया है।

💊 दवाई: ${data.medicineName} ${data.dosage}
🕐 समय: ${data.scheduledTime}
${foodInstruction}

क्या आपने दवाई ले ली है?

जवाब दें:
"ले ली" - अगर ले ली है
"नहीं" - अगर अभी नहीं ली है`;
    } else {
      const foodInstruction = 
        data.beforeAfterFood === 'before' ? '☕ Before food' :
        data.beforeAfterFood === 'after' ? '🍽️ After food' :
        '⏰ Anytime';
      
      return `Hello ${data.patientName} 🙏

It's time for your medicine.

💊 Medicine: ${data.medicineName} ${data.dosage}
🕐 Time: ${data.scheduledTime}
${foodInstruction}

Have you taken your medicine?

Reply:
"TAKEN" - if you've taken it
"NOT YET" - if you haven't taken it yet`;
    }
  }

  /**
   * Mock reminder for development/demo mode
   */
  private sendMockReminder(
    phoneNumber: string,
    data: DoseReminderData,
    scheduleId: string
  ): WhatsAppResponse {
    const mockMessageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message = this.formatReminderMessage(data);
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║       📱 MOCK WHATSAPP MESSAGE 📱          ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║ Mode: DEMO (No real message sent)         ║`);
    console.log(`║ To: ${phoneNumber.padEnd(35)}║`);
    console.log(`║ Schedule ID: ${scheduleId.substring(0, 24).padEnd(24)}║`);
    console.log('╠════════════════════════════════════════════╣');
    console.log('║ Message Content:                           ║');
    message.split('\n').forEach(line => {
      console.log(`║ ${line.padEnd(42)}║`);
    });
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║ Message ID: ${mockMessageId.padEnd(29)}║`);
    console.log('╚════════════════════════════════════════════╝\n');

    return {
      success: true,
      messageId: mockMessageId,
    };
  }

  /**
   * Verify webhook signature from Meta
   */
  verifyWebhookSignature(signature: string, rawBody: string): boolean {
    if (this.mode === 'mock') {
      console.log('Mock mode: Skipping signature verification');
      return true;
    }

    if (!this.appSecret) {
      console.error('WHATSAPP_APP_SECRET not configured');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(rawBody, 'utf8')
        .digest('hex');
      
      const signatureHash = signature.replace('sha256=', '');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signatureHash)
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId: string): Promise<any> {
    if (this.mode === 'mock') {
      return {
        status: 'delivered',
        timestamp: new Date().toISOString(),
      };
    }

    // Meta doesn't provide a direct API to query message status
    // Status updates come via webhooks
    return null;
  }

  /**
   * Check if service is configured for production
   */
  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId && this.appSecret);
  }

  /**
   * Get current mode
   */
  getMode(): 'mock' | 'production' {
    return this.mode;
  }
}

export default new WhatsAppService();
