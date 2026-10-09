import twilio from 'twilio';

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  if (!sid || !token) return null;
  return twilio(sid, token);
}

const fromSMS = () => process.env.TWILIO_SMS_FROM || process.env.TWILIO_PHONE_NUMBER || '';

export async function sendSMSReminder(
  toPhone: string,
  patientName: string,
  medicineName: string,
  dosage: string,
  time: string,
  scheduleId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const mode = process.env.WHATSAPP_MODE || 'mock';
  const client = getClient();

  if (mode === 'mock' || !client || !fromSMS()) {
    console.log(`\n📱 [MOCK SMS] To: ${toPhone}`);
    console.log(`   ${medicineName} ${dosage} at ${time}`);
    return { success: true, messageId: `mock_sms_${Date.now()}` };
  }

  try {
    const msg = await client.messages.create({
      from: fromSMS(),
      to: toPhone,
      body: `PulseSathi: Suresh ji, ${medicineName} ${dosage} lene ka samay ho gaya hai (${time}).\n\nKya aapne le li? Reply:\nY = Haan, le li\nN = Nahi, abhi nahi\n\nRef:${scheduleId.slice(-6)}`,
    });
    console.log(`✅ SMS sent to ${toPhone}: ${msg.sid}`);
    return { success: true, messageId: msg.sid };
  } catch (err: any) {
    console.error('SMS error:', err.message);
    return { success: false, error: err.message };
  }
}

export function parseSMSResponse(body: string): 'TAKEN' | 'NOT_TAKEN_YET' | null {
  const t = body.trim().toUpperCase();
  if (t === 'Y' || t === 'YES' || t.includes('LE LI') || t.includes('TAKEN') || t === '1') return 'TAKEN';
  if (t === 'N' || t === 'NO' || t.includes('NAHI') || t.includes('NOT') || t === '2') return 'NOT_TAKEN_YET';
  return null;
}
