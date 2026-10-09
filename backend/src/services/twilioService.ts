import twilio from 'twilio';

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

const fromNumber = () => process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+17372508034';

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
  const client = getClient();

  if (mode === 'mock' || !client) {
    const mockId = `mock_twilio_${Date.now()}`;
    console.log(`\n📱 [MOCK TWILIO] WhatsApp to ${toPhone}`);
    console.log(`   ${data.medicineName} ${data.dosage} at ${data.scheduledTime}`);
    console.log(`   Schedule ID: ${scheduleId}`);
    return { success: true, messageId: mockId };
  }

  try {
    const body = formatMessage(data, scheduleId);
    // Use Twilio's approved hello_world template for trial accounts
    const msg = await client.messages.create({
      from: fromNumber(),
      to: `whatsapp:${toPhone}`,
      contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e', // Twilio hello_world template
      contentVariables: JSON.stringify({ '1': data.patientName }),
    } as any);
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
