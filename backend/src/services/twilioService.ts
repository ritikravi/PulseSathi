import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio sandbox number

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

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
  const mode = process.env.WHATSAPP_MODE || 'mock';

  if (mode === 'mock' || !client) {
    const mockId = `mock_twilio_${Date.now()}`;
    console.log(`\n📱 [MOCK TWILIO] WhatsApp to ${toPhone}`);
    console.log(`   ${data.medicineName} ${data.dosage} at ${data.scheduledTime}`);
    console.log(`   Schedule ID: ${scheduleId}`);
    return { success: true, messageId: mockId };
  }

  try {
    const body = formatMessage(data, scheduleId);
    const msg = await client.messages.create({
      from: fromNumber,
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

export async function processIncomingTwilio(
  from: string,
  body: string,
  scheduleRef?: string
): Promise<'TAKEN' | 'NOT_TAKEN_YET' | null> {
  const text = body.trim().toLowerCase();
  if (text === '1' || text.includes('ले ली') || text.includes('taken') || text.includes('haan') || text.includes('हाँ')) {
    return 'TAKEN';
  }
  if (text === '2' || text.includes('नहीं') || text.includes('abhi') || text.includes('not yet')) {
    return 'NOT_TAKEN_YET';
  }
  return null;
}
