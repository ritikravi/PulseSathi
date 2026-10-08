# WhatsApp Integration - Codebase Audit & Gap Analysis

## EXISTING FUNCTIONALITY ✅

### 1. Medicine Management System (COMPLETE)
**Models:**
- ✅ `Medicine` - Tracks name, dosage, frequency, timings, adherence score, PDC
- ✅ `MedicineSchedule` - Individual dose events with status tracking
- ✅ `DoseEvent` - Audit log of all dose-related events
- ✅ `AdherenceRisk` - Risk assessment storage

**Features:**
- ✅ Medicine CRUD operations
- ✅ Auto-scheduling (7-day generation)
- ✅ Dose status tracking (pending, taken, snoozed, missed, skipped)
- ✅ PDC calculation
- ✅ Consecutive miss tracking
- ✅ Web-based "TAKEN" and "+30 min snooze" actions

**API Routes:**
- ✅ `/api/medicines` - Full medicine management
- ✅ `/api/adherence` - Adherence analytics and risk calculation

### 2. Patient & User Management (COMPLETE)
**Models:**
- ✅ `User` - Basic authentication (email, password, role, phone)
- ✅ `PatientProfile` - Demographics, diagnosis, preferences

**Current Limitations:**
- ❌ No WhatsApp phone number field (only basic phone)
- ❌ No WhatsApp consent tracking
- ❌ No preferred language field in User model
- ❌ No communication preferences
- ❌ No timezone tracking

### 3. Caregiver System (COMPLETE)
**Models:**
- ✅ `CaregiverConsent` - Relationship, permissions, consent tracking

**Features:**
- ✅ Consent-based access control
- ✅ Alert permissions

### 4. Notification System (IN-APP ONLY)
**Models:**
- ✅ `Notification` - In-app notification storage

**Current Limitations:**
- ✅ Only in-app notifications (web dashboard bell icon)
- ❌ No WhatsApp integration
- ❌ No SMS integration
- ❌ No external messaging service

### 5. Frontend Dashboard (COMPLETE)
- ✅ TodayView - Simple medicine interface
- ✅ CaregiverDashboard - Family monitoring
- ✅ ClinicianDashboard - Professional review
- ✅ Real-time updates (React Query with polling)

---

## MISSING FUNCTIONALITY ❌

### 1. WhatsApp Business API Integration
- ❌ No Meta WhatsApp Business API integration
- ❌ No WhatsApp service module
- ❌ No message templates
- ❌ No webhook handling
- ❌ No interactive button support
- ❌ No delivery status tracking

### 2. Patient WhatsApp Registration
- ❌ No WhatsApp phone number capture (separate from basic phone)
- ❌ No WhatsApp-specific consent flow
- ❌ No phone number verification
- ❌ No opt-in/opt-out management

### 3. WhatsApp Reminder Scheduler
- ❌ No background job scheduler
- ❌ No WhatsApp reminder dispatch system
- ❌ No reminder-due dose detection
- ❌ No quiet hours enforcement
- ❌ No reminder frequency limits

### 4. Webhook Processing
- ❌ No webhook verification endpoint
- ❌ No incoming message handler
- ❌ No button-reply processor
- ❌ No patient identity resolution from WhatsApp number
- ❌ No dose event recording from WhatsApp responses

### 5. Enhanced Models
- ❌ No `WhatsAppConsent` model
- ❌ No `WhatsAppMessage` model for audit trail
- ❌ No idempotency tracking for webhook events
- ❌ MedicineSchedule lacks WhatsApp-specific fields

### 6. Real-time Dashboard Updates
- ❌ Current implementation uses polling (React Query 30s interval)
- ❌ No Socket.IO or SSE for instant updates
- ❌ No push notifications on WhatsApp response

---

## MODIFICATIONS REQUIRED 🔧

### 1. Database Models

#### A. Update `User` Model
```typescript
// Add fields:
whatsappPhone?: string;  // With country code
whatsappVerified: boolean;
preferredLanguage: 'en' | 'hi';  // English, Hindi
timezone: string;  // e.g., 'Asia/Kolkata'
```

#### B. Create `WhatsAppConsent` Model
```typescript
{
  patientId: ObjectId;
  whatsappPhone: string;
  consentGiven: boolean;
  consentDate: Date;
  consentVersion: string;
  communicationPreferences: {
    doseReminders: boolean;
    adherenceAlerts: boolean;
    quietHoursStart: string;  // "22:00"
    quietHoursEnd: string;    // "07:00"
  };
  revokedAt?: Date;
}
```

#### C. Create `WhatsAppMessage` Model
```typescript
{
  patientId: ObjectId;
  scheduleId?: ObjectId;
  direction: 'outgoing' | 'incoming';
  whatsappMessageId: string;  // Meta's message ID
  phoneNumber: string;
  messageType: 'reminder' | 'response' | 'followup';
  templateName?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  responseReceived?: boolean;
  responseType?: 'TAKEN' | 'NOT_TAKEN_YET';
  responseTimestamp?: Date;
  metadata: Mixed;
  sentAt: Date;
}
```

#### D. Extend `MedicineSchedule` Model
```typescript
// Add fields:
whatsappReminderSent: boolean;
whatsappMessageId?: string;
whatsappResponseType?: 'TAKEN' | 'NOT_TAKEN_YET';
whatsappResponseTimestamp?: Date;
```

#### E. Create `WebhookEvent` Model (Idempotency)
```typescript
{
  eventId: string;  // unique, indexed
  eventType: string;
  processed: boolean;
  processedAt?: Date;
  patientId?: ObjectId;
  scheduleId?: ObjectId;
  rawPayload: Mixed;
  createdAt: Date;
}
```

### 2. Backend Services

#### A. Create `WhatsAppService` (`/src/services/whatsapp.ts`)
```typescript
class WhatsAppService {
  // Send template message
  async sendDoseReminder(schedule, patient, medicine): Promise<messageId>;
  
  // Send text message (fallback)
  async sendTextMessage(phone, message): Promise<messageId>;
  
  // Verify webhook signature
  verifyWebhookSignature(signature, body): boolean;
  
  // Get message status
  async getMessageStatus(messageId): Promise<status>;
  
  // Mock mode for development
  sendMockReminder(schedule, patient, medicine): void;
}
```

#### B. Create `ReminderScheduler` (`/src/services/reminderScheduler.ts`)
```typescript
class ReminderScheduler {
  // Find doses due for reminder
  async findDueDoses(): Promise<schedules[]>;
  
  // Send reminders via WhatsApp
  async sendDueReminders(): Promise<void>;
  
  // Check quiet hours
  isQuietHours(patient): boolean;
  
  // Check reminder limits
  canSendReminder(schedule): boolean;
}
```

#### C. Create `WhatsAppWebhookHandler` (`/src/services/whatsappWebhookHandler.ts`)
```typescript
class WhatsAppWebhookHandler {
  // Process incoming message
  async processIncomingMessage(webhookPayload): Promise<void>;
  
  // Resolve patient from phone
  async resolvePatient(whatsappPhone): Promise<patient>;
  
  // Resolve schedule from message context
  async resolveSchedule(patient, messageId): Promise<schedule>;
  
  // Record TAKEN response
  async recordTakenResponse(schedule, patient, timestamp): Promise<void>;
  
  // Record NOT_TAKEN_YET response
  async recordNotTakenYetResponse(schedule, patient, timestamp): Promise<void>;
  
  // Update adherence metrics
  async updateAdherence(medicine, patient): Promise<void>;
  
  // Check idempotency
  async isProcessed(eventId): Promise<boolean>;
}
```

### 3. API Routes

#### A. Create `/api/whatsapp/webhook` Route
```typescript
GET  /api/whatsapp/webhook       // Verification handshake
POST /api/whatsapp/webhook       // Incoming messages
```

#### B. Create `/api/whatsapp/consent` Route
```typescript
POST /api/whatsapp/consent       // Register WhatsApp consent
GET  /api/whatsapp/consent       // Get consent status
PUT  /api/whatsapp/consent       // Update preferences
DELETE /api/whatsapp/consent     // Revoke consent
```

#### C. Extend `/api/medicines/:scheduleId/dose` Routes
```typescript
// Keep existing web endpoints, add metadata tracking:
POST /api/medicines/:scheduleId/dose/taken
  -> Add source: 'web' | 'whatsapp'
```

### 4. Environment Variables

#### Add to `.env`:
```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_API_VERSION=v18.0
WHATSAPP_MODE=mock  # 'mock' or 'production'

# Reminder Scheduler
REMINDER_CHECK_INTERVAL_MS=60000  # 1 minute
REMINDER_MAX_PER_DOSE=2
REMINDER_LEAD_TIME_MINUTES=15
```

### 5. Scheduler Implementation

**Option 1:** Simple setInterval (current deployment-compatible)
```typescript
// In server.ts
setInterval(async () => {
  const scheduler = new ReminderScheduler();
  await scheduler.sendDueReminders();
}, 60000);
```

**Option 2:** Cron job (if supported by hosting)
```typescript
import cron from 'node-cron';
cron.schedule('* * * * *', async () => {
  const scheduler = new ReminderScheduler();
  await scheduler.sendDueReminders();
});
```

### 6. Frontend Updates

#### A. WhatsApp Onboarding Component
```typescript
// Add to medicine onboarding or profile:
<WhatsAppConsentForm />
  - Capture WhatsApp phone with country code
  - Explain reminder functionality
  - Get explicit consent
  - Set communication preferences
```

#### B. Dashboard Status Indicator
```typescript
// Show WhatsApp integration status:
<WhatsAppStatusBadge />
  - Connected / Not Connected
  - Last reminder sent
  - Response rate
```

#### C. Dose Card Enhancement
```typescript
// In TodayViewPage, show response source:
- "Taken (via WhatsApp)" vs "Taken (via Web)"
- "Reminder sent at 8:00 AM"
```

---

## IMPLEMENTATION PLAN 📋

### Phase 1: Core Infrastructure (Day 1)
1. ✅ Create WhatsAppConsent model
2. ✅ Create WhatsAppMessage model
3. ✅ Create WebhookEvent model
4. ✅ Update User model (whatsappPhone, preferredLanguage, timezone)
5. ✅ Extend MedicineSchedule model
6. ✅ Create WhatsAppService with mock mode
7. ✅ Add environment variables

### Phase 2: Webhook & Response Processing (Day 1-2)
1. ✅ Create webhook route (GET verification, POST events)
2. ✅ Implement webhook signature verification
3. ✅ Create WhatsAppWebhookHandler service
4. ✅ Implement patient resolution from phone
5. ✅ Implement schedule resolution from message context
6. ✅ Implement TAKEN response recording
7. ✅ Implement NOT_TAKEN_YET response recording
8. ✅ Add idempotency checks

### Phase 3: Reminder Scheduler (Day 2)
1. ✅ Create ReminderScheduler service
2. ✅ Implement findDueDoses logic
3. ✅ Implement quiet hours checking
4. ✅ Implement reminder limits
5. ✅ Integrate WhatsAppService
6. ✅ Add scheduler to server.ts
7. ✅ Create mock reminder flow

### Phase 4: Frontend Integration (Day 2-3)
1. ✅ Create WhatsApp consent capture form
2. ✅ Add consent API calls
3. ✅ Update profile page with WhatsApp section
4. ✅ Add WhatsApp status indicators
5. ✅ Update dose cards to show response source
6. ✅ Add test/demo mode UI

### Phase 5: Testing & Documentation (Day 3)
1. ✅ Test complete mock flow
2. ✅ Test webhook signature verification
3. ✅ Test idempotency
4. ✅ Test adherence calculation
5. ✅ Test caregiver notifications
6. ✅ Document Meta setup process
7. ✅ Write deployment guide

---

## EXISTING FEATURES TO REUSE ✅

1. **Medicine Management** - Complete, just add WhatsApp fields
2. **Dose Status Tracking** - Keep all existing statuses
3. **Adherence Calculation** - Already works, just capture source
4. **Caregiver Alerts** - Existing notification helper, extend for WhatsApp events
5. **Risk Assessment** - Already implemented, trigger on WhatsApp non-response
6. **Web Dashboard** - Keep all existing views, add WhatsApp indicators
7. **Authentication** - Keep existing JWT, just add WhatsApp consent check

---

## CRITICAL DECISIONS 🎯

### 1. Scheduler Approach
**Decision:** Use setInterval initially (deployment-compatible)
**Reason:** Render free tier doesn't support cron jobs, setInterval works everywhere

### 2. Real-time Updates
**Decision:** Keep React Query polling for MVP, add Socket.IO later
**Reason:** Polling already works, Socket.IO adds complexity

### 3. Mock vs Production Mode
**Decision:** Implement complete mock mode that works without Meta credentials
**Reason:** Development and demo without Meta approval process

### 4. Message Template Strategy
**Decision:** Use approved template + button payload for MVP
**Reason:** Interactive buttons require template approval, fallback to text+reply

### 5. Phone Number Verification
**Decision:** Trust phone number initially, add OTP verification in Phase 2
**Reason:** Faster MVP, add security incrementally

---

## SECURITY CONSIDERATIONS 🔒

1. **Webhook Signature:** Verify X-Hub-Signature-256 on all incoming webhooks
2. **Idempotency:** Store and check eventId to prevent duplicate processing
3. **Patient Resolution:** Only process messages from registered WhatsApp numbers
4. **Consent Enforcement:** Never send reminders without explicit consent
5. **Data Minimization:** Don't log full message content, only metadata
6. **Secret Management:** Never expose tokens in frontend or logs

---

## DEPLOYMENT REQUIREMENTS 📦

### Meta WhatsApp Business Setup:
1. Create Meta Business Account
2. Create WhatsApp Business Account
3. Create WhatsApp App
4. Get Phone Number ID and Access Token
5. Configure Webhook URL: `https://your-domain.com/api/whatsapp/webhook`
6. Submit and get approval for message template
7. Add test numbers during development

### Production Checklist:
- [ ] WhatsApp Business Account verified
- [ ] Message template approved
- [ ] Webhook URL configured
- [ ] Environment variables set
- [ ] Test with real phone number
- [ ] Patient consent flow tested
- [ ] Mock mode disabled in production

---

**STATUS:** Ready to implement. All gaps identified. Implementation starting immediately.

