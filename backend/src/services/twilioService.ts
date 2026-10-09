import twilio from 'twilio';

// Twilio WhatsApp sandbox sender; override with your approved sender in production
const SANDBOX_FROM = 'whatsapp:+14155238886';

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

export const fromNumber = () => process.env.TWILIO_WHATSAPP_FROM || SANDBOX_FROM;

export const isTwilioLive = () =>
  process.env.WHATSAPP_MODE !== 'mock' && getClient() !== null;

interface ReminderData {
  patientName: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  beforeAfterFood: string;
  language: 'en' | 'hi';
}

export async function sendWhatsAppReminder(
  toPhone: string,
  data: ReminderData,
  scheduleId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getClient();

  if (process.env.WHATSAPP_MODE === 'mock' || !client) {
    const mockId = `mock_twilio_${Date.now()}`;
    console.log(`\n📱 [MOCK TWILIO] WhatsApp to ${toPhone}`);
    console.log(`   ${data.medicineName} ${data.dosage} at ${data.scheduledTime}`);
    console.log(`   Schedule ID: ${scheduleId}`);
    return { success: true, messageId: mockId };
  }

  try {
    // Outside the 24h session window WhatsApp only delivers approved templates.
    // If a Content Template is configured, use it; otherwise send free-form text
    // (works in the sandbox and within 24h of the patient's last message).
    const contentSid = process.env.TWILIO_REMINDER_CONTENT_SID;
    const payload: any = contentSid
      ? {
          contentSid,
          contentVariables: JSON.stringify({
            '1': data.patientName,
            '2': `${data.medicineName} ${data.dosage}`,
            '3': data.scheduledTime,
          }),
        }
      : { body: formatMessage(data, scheduleId) };

    const msg = await client.messages.create({
      from: fromNumber(),
      to: `whatsapp:${toPhone}`,
      ...payload,
    });
    return { success: true, messageId: msg.sid };
  } catch (err: any) {
    console.error('Twilio error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendWhatsAppText(
  toPhone: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getClient();
  if (process.env.WHATSAPP_MODE === 'mock' || !client) {
    console.log(`\n📱 [MOCK TWILIO] WhatsApp to ${toPhone}: ${body}`);
    return { success: true, messageId: `mock_twilio_${Date.now()}` };
  }

  try {
    const msg = await client.messages.create({
      from: fromNumber(),
      to: `whatsapp:${toPhone}`,
      body,
    });
    return { success: true, messageId: msg.sid };
  } catch (err: any) {
    console.error('Twilio error:', err.message);
    return { success: false, error: err.message };
  }
}

function formatMessage(data: ReminderData, scheduleId: string): string {
  if (data.language === 'en') {
    const food =
      data.beforeAfterFood === 'before' ? '☕ Before food' :
      data.beforeAfterFood === 'after' ? '🍽️ After food' : '⏰ Anytime';

    return `Hello ${data.patientName} 🙏

It's time for your medicine.

💊 ${data.medicineName} ${data.dosage}
🕐 ${data.scheduledTime}
${food}

Have you taken it?
✅ Reply *1* - Yes, taken
⏰ Reply *2* - Not yet

Ref: ${scheduleId.slice(-8)}`;
  }

  const foodEmoji =
    data.beforeAfterFood === 'before' ? '☕ खाने से पहले' :
    data.beforeAfterFood === 'after' ? '🍽️ खाने के बाद' : '⏰ कभी भी';

  return `नमस्ते ${data.patientName} जी 🙏

आपकी दवाई का समय हो गया है।

💊 ${data.medicineName} ${data.dosage}
🕐 ${data.scheduledTime}
${foodEmoji}

क्या आपने दवाई ले ली है?
✅ *1* भेजें - हाँ, ले ली
⏰ *2* भेजें - नहीं, अभी नहीं

Ref: ${scheduleId.slice(-8)}`;
}

/**
 * Verify the X-Twilio-Signature header. Render sits behind a proxy, so the
 * public URL Twilio signed is rebuilt from PUBLIC_BASE_URL (or forwarded headers).
 */
export function verifyTwilioSignature(req: any): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers['x-twilio-signature'];
  if (!authToken || !signature) return false;

  const base =
    process.env.PUBLIC_BASE_URL ||
    `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.get('host')}`;
  const url = `${base.replace(/\/$/, '')}${req.originalUrl}`;

  return twilio.validateRequest(authToken, signature, url, req.body || {});
}

export function parseIncomingResponse(body: string): 'TAKEN' | 'NOT_TAKEN_YET' | null {
  const text = body.trim().toLowerCase();
  if (text === '1' || text.includes('ले ली') || text.includes('taken') || text.includes('haan') || text.includes('हाँ')) {
    return 'TAKEN';
  }
  if (text === '2' || text.includes('नहीं') || text.includes('abhi') || text.includes('not yet')) {
    return 'NOT_TAKEN_YET';
  }
  return null;
}
