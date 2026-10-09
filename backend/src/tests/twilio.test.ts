import twilio from 'twilio';
import { verifyTwilioSignature, parseIncomingResponse } from '../services/twilioService';

const AUTH_TOKEN = 'test_auth_token';
const BASE = 'https://pulseloop-backend-5il0.onrender.com';

function makeReq(body: Record<string, string>, signature?: string) {
  return {
    originalUrl: '/api/twilio/webhook',
    protocol: 'http',
    headers: signature ? { 'x-twilio-signature': signature } : {},
    get: () => 'internal-host:10000',
    body,
  };
}

describe('Twilio signature verification', () => {
  const body = { From: 'whatsapp:+919876543210', Body: '1', MessageSid: 'SM123' };

  beforeEach(() => {
    process.env.TWILIO_AUTH_TOKEN = AUTH_TOKEN;
    process.env.PUBLIC_BASE_URL = BASE;
  });

  test('accepts a correctly signed request', () => {
    const sig = twilio.getExpectedTwilioSignature(AUTH_TOKEN, `${BASE}/api/twilio/webhook`, body);
    expect(verifyTwilioSignature(makeReq(body, sig))).toBe(true);
  });

  test('rejects a missing signature', () => {
    expect(verifyTwilioSignature(makeReq(body))).toBe(false);
  });

  test('rejects a tampered body', () => {
    const sig = twilio.getExpectedTwilioSignature(AUTH_TOKEN, `${BASE}/api/twilio/webhook`, body);
    expect(verifyTwilioSignature(makeReq({ ...body, From: 'whatsapp:+910000000000' }, sig))).toBe(false);
  });

  test('rejects when no auth token is configured', () => {
    const sig = twilio.getExpectedTwilioSignature(AUTH_TOKEN, `${BASE}/api/twilio/webhook`, body);
    delete process.env.TWILIO_AUTH_TOKEN;
    expect(verifyTwilioSignature(makeReq(body, sig))).toBe(false);
  });
});

describe('Incoming reply parsing', () => {
  test.each([
    ['1', 'TAKEN'],
    [' Taken ', 'TAKEN'],
    ['haan', 'TAKEN'],
    ['ले ली', 'TAKEN'],
    ['2', 'NOT_TAKEN_YET'],
    ['not yet', 'NOT_TAKEN_YET'],
    ['नहीं', 'NOT_TAKEN_YET'],
    ['hello', null],
  ])('%s -> %s', (input, expected) => {
    expect(parseIncomingResponse(input)).toBe(expected);
  });
});
