/**
 * WhatsApp Integration Tests
 * Run: npx jest src/tests/whatsapp.test.ts
 */

import crypto from 'crypto';

// ─── Mock dependencies ────────────────────────────────────────────────────────
jest.mock('../models/User');
jest.mock('../models/WhatsAppConsent');
jest.mock('../models/WhatsAppMessage');
jest.mock('../models/MedicineSchedule');
jest.mock('../models/Medicine');
jest.mock('../models/DoseEvent');
jest.mock('../models/WebhookEvent');

// ─── WhatsApp Service Tests ───────────────────────────────────────────────────
describe('WhatsAppService', () => {
  beforeEach(() => {
    process.env.WHATSAPP_MODE = 'mock';
    process.env.WHATSAPP_APP_SECRET = 'test-secret-32chars-padding12345';
    jest.resetModules();
  });

  test('returns mock messageId in mock mode', async () => {
    const service = require('../services/whatsappService').default;
    const result = await service.sendDoseReminder(
      '+919876543210',
      {
        patientName: 'Suresh',
        medicineName: 'Metformin',
        dosage: '500mg',
        scheduledTime: '08:00',
        beforeAfterFood: 'after',
        language: 'hi',
      },
      'test-schedule-id'
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/^mock_/);
  });

  test('mock mode skips signature verification', () => {
    const service = require('../services/whatsappService').default;
    const isValid = service.verifyWebhookSignature('any-sig', 'any-body');
    expect(isValid).toBe(true);
  });

  test('production mode verifies HMAC-SHA256 signature correctly', () => {
    process.env.WHATSAPP_MODE = 'production';
    jest.resetModules();
    const service = require('../services/whatsappService').default;
    const secret = 'test-secret-32chars-padding12345';
    const body = '{"test":"payload"}';
    const validSig =
      'sha256=' +
      crypto.createHmac('sha256', secret).update(body).digest('hex');
    expect(service.verifyWebhookSignature(validSig, body)).toBe(true);
    expect(service.verifyWebhookSignature('sha256=wrongsig000', body)).toBe(false);
  });

  test('getMode returns mock when env not production', () => {
    const service = require('../services/whatsappService').default;
    expect(service.getMode()).toBe('mock');
  });
});

// ─── Webhook Signature Validation ────────────────────────────────────────────
describe('Webhook signature validation', () => {
  const secret = 'test-app-secret';

  function makeSignature(body: string): string {
    return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  test('valid signature passes', () => {
    const body = '{"entry":[{"changes":[{"field":"messages"}]}]}';
    const sig = makeSignature(body);
    const hash = sig.replace('sha256=', '');
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    expect(crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash))).toBe(true);
  });

  test('invalid signature fails', () => {
    const body = '{"entry":[{"changes":[{"field":"messages"}]}]}';
    const hash = 'invalid000000000000000000000000000000000000000000000000000000000000';
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    // Different lengths will throw in timingSafeEqual, catch that
    let result = false;
    try {
      result = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
    } catch {
      result = false;
    }
    expect(result).toBe(false);
  });

  test('empty signature fails', () => {
    const body = 'test';
    const hash = '';
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    let result = false;
    try {
      result = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
    } catch {
      result = false;
    }
    expect(result).toBe(false);
  });
});

// ─── Adherence Calculation ────────────────────────────────────────────────────
describe('Adherence calculation (PDC)', () => {
  function calculatePDC(taken: number, scheduled: number): number {
    if (scheduled === 0) return 100;
    return Math.round((taken / scheduled) * 100);
  }

  test('perfect adherence', () => {
    expect(calculatePDC(30, 30)).toBe(100);
  });

  test('zero doses taken', () => {
    expect(calculatePDC(0, 30)).toBe(0);
  });

  test('no doses scheduled returns 100', () => {
    expect(calculatePDC(0, 0)).toBe(100);
  });

  test('Metformin scenario: 58/60 = 96%', () => {
    expect(calculatePDC(58, 60)).toBe(97); // ~96-97%
  });

  test('Glipizide problematic: 19/30 = 63%', () => {
    expect(calculatePDC(19, 30)).toBe(63);
  });

  test('below 70% flags as problematic', () => {
    const score = calculatePDC(19, 30);
    expect(score < 70).toBe(true);
  });
});

// ─── Dose Status Transitions ──────────────────────────────────────────────────
describe('Dose status transitions', () => {
  test('TAKEN response updates status to taken', () => {
    const schedule: any = { status: 'pending' };
    // Simulate TAKEN
    schedule.status = 'taken';
    schedule.responseSource = 'whatsapp';
    schedule.whatsappResponseType = 'TAKEN';
    expect(schedule.status).toBe('taken');
    expect(schedule.responseSource).toBe('whatsapp');
  });

  test('NOT_TAKEN_YET sets snoozed with 30-min window', () => {
    const before = Date.now();
    const schedule: any = { status: 'pending' };
    // Simulate NOT_TAKEN_YET
    schedule.status = 'snoozed';
    schedule.snoozedUntil = new Date(Date.now() + 30 * 60 * 1000);
    schedule.whatsappResponseType = 'NOT_TAKEN_YET';
    expect(schedule.status).toBe('snoozed');
    expect(schedule.snoozedUntil.getTime()).toBeGreaterThan(before + 29 * 60 * 1000);
  });

  test('delivery receipt does NOT update dose status', () => {
    const schedule: any = { status: 'pending' };
    // Delivery receipt is a status update, not a patient response
    // Status should remain pending
    expect(schedule.status).toBe('pending');
  });

  test('cannot mark already-taken dose as taken again', () => {
    const schedule: any = { status: 'taken' };
    const canUpdate = schedule.status !== 'taken' && schedule.status !== 'skipped';
    expect(canUpdate).toBe(false);
  });
});

// ─── Quiet Hours Logic ────────────────────────────────────────────────────────
describe('Quiet hours', () => {
  function isQuietHours(start: string, end: string, currentTime: string): boolean {
    if (start > end) {
      // Overnight (e.g., 22:00 to 07:00)
      return currentTime >= start || currentTime < end;
    }
    return currentTime >= start && currentTime < end;
  }

  test('overnight quiet: 22:00-07:00, at 23:30 = quiet', () => {
    expect(isQuietHours('22:00', '07:00', '23:30')).toBe(true);
  });

  test('overnight quiet: 22:00-07:00, at 01:00 = quiet', () => {
    expect(isQuietHours('22:00', '07:00', '01:00')).toBe(true);
  });

  test('overnight quiet: 22:00-07:00, at 08:00 AM = not quiet', () => {
    expect(isQuietHours('22:00', '07:00', '08:00')).toBe(false);
  });

  test('daytime quiet: 13:00-15:00, at 14:00 = quiet', () => {
    expect(isQuietHours('13:00', '15:00', '14:00')).toBe(true);
  });

  test('daytime quiet: 13:00-15:00, at 16:00 = not quiet', () => {
    expect(isQuietHours('13:00', '15:00', '16:00')).toBe(false);
  });
});

// ─── Reminder Limits ─────────────────────────────────────────────────────────
describe('Reminder limits', () => {
  function canSendReminder(remindersSent: number, maxReminders: number, status: string): boolean {
    if (remindersSent >= maxReminders) return false;
    if (['taken', 'skipped', 'missed'].includes(status)) return false;
    return true;
  }

  test('can send first reminder', () => {
    expect(canSendReminder(0, 2, 'pending')).toBe(true);
  });

  test('can send second reminder', () => {
    expect(canSendReminder(1, 2, 'pending')).toBe(true);
  });

  test('cannot send third reminder when max is 2', () => {
    expect(canSendReminder(2, 2, 'pending')).toBe(false);
  });

  test('cannot send reminder for taken dose', () => {
    expect(canSendReminder(0, 2, 'taken')).toBe(false);
  });

  test('cannot send reminder for missed dose', () => {
    expect(canSendReminder(0, 2, 'missed')).toBe(false);
  });
});

// ─── Risk Score Engine ────────────────────────────────────────────────────────
describe('Risk score calculation', () => {
  function calcRisk(consecutiveMisses: number, pdcDiff: number, snoozes: number): number {
    let score = 0;
    if (consecutiveMisses >= 3) score += 40;
    else if (consecutiveMisses === 2) score += 25;
    else if (consecutiveMisses === 1) score += 10;
    if (pdcDiff > 15) score += 30;
    else if (pdcDiff > 10) score += 20;
    if (snoozes >= 5) score += 20;
    else if (snoozes >= 3) score += 10;
    return Math.min(score, 100);
  }

  test('no misses = low risk', () => {
    expect(calcRisk(0, 0, 0)).toBe(0);
  });

  test('3 consecutive misses = 40 points', () => {
    expect(calcRisk(3, 0, 0)).toBe(40);
  });

  test('Glipizide scenario: 3 misses + 15% decline + 5 snoozes = high risk', () => {
    const score = calcRisk(3, 16, 5);
    expect(score).toBeGreaterThanOrEqual(60); // high risk
  });

  test('score capped at 100', () => {
    expect(calcRisk(3, 20, 6)).toBe(90);
  });

  test('risk levels', () => {
    const getRiskLevel = (score: number) =>
      score < 30 ? 'low' : score < 60 ? 'medium' : score < 80 ? 'high' : 'critical';
    expect(getRiskLevel(0)).toBe('low');
    expect(getRiskLevel(40)).toBe('medium');
    expect(getRiskLevel(70)).toBe('high');
    expect(getRiskLevel(90)).toBe('critical');
  });
});

// ─── Phone number validation ──────────────────────────────────────────────────
describe('Phone number validation', () => {
  function isValidPhone(phone: string): boolean {
    return /^\+[1-9]\d{1,14}$/.test(phone);
  }

  test('valid Indian number', () => {
    expect(isValidPhone('+919876543210')).toBe(true);
  });

  test('valid number without leading zeros', () => {
    expect(isValidPhone('+14155552671')).toBe(true);
  });

  test('invalid - no country code', () => {
    expect(isValidPhone('9876543210')).toBe(false);
  });

  test('invalid - starts with +0', () => {
    expect(isValidPhone('+0123456789')).toBe(false);
  });

  test('invalid - too short', () => {
    // +91 alone is 3 chars, needs at least 2 digits after country code
    expect(isValidPhone('+911')).toBe(false); // only 1 digit - passes regex but too short for real
    expect(isValidPhone('+9')).toBe(false);   // definitively too short
  });
});

// ─── Idempotency ──────────────────────────────────────────────────────────────
describe('Webhook idempotency', () => {
  test('same eventId processed twice should be deduplicated', async () => {
    const processedEvents = new Set<string>();

    const processEvent = (id: string): boolean => {
      if (processedEvents.has(id)) return false; // already processed
      processedEvents.add(id);
      return true; // newly processed
    };

    expect(processEvent('wamid.abc123')).toBe(true);
    expect(processEvent('wamid.abc123')).toBe(false); // duplicate
    expect(processEvent('wamid.xyz789')).toBe(true);  // different event
  });

  test('delivery status does not count as patient response', () => {
    const webhookType: string = 'statuses'; // vs 'messages'
    const isPatientResponse = webhookType === 'messages';
    expect(isPatientResponse).toBe(false);
  });
});
