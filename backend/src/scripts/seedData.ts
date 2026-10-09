import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Medicine from '../models/Medicine';
import MedicineSchedule from '../models/MedicineSchedule';
import DoseEvent from '../models/DoseEvent';
import CaregiverConsent from '../models/CaregiverConsent';
import WhatsAppConsent from '../models/WhatsAppConsent';
import WhatsAppMessage from '../models/WhatsAppMessage';
import AdherenceRisk from '../models/AdherenceRisk';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pulseloop');
  console.log('Connected to MongoDB');

  // Clean up existing demo data
  const existingPatient = await User.findOne({ email: 'suresh@demo.pulsesathi.in' });
  if (existingPatient) {
    await Medicine.deleteMany({ patientId: existingPatient._id });
    await MedicineSchedule.deleteMany({ patientId: existingPatient._id });
    await DoseEvent.deleteMany({ patientId: existingPatient._id });
    await WhatsAppConsent.deleteMany({ patientId: existingPatient._id });
    await WhatsAppMessage.deleteMany({ patientId: existingPatient._id });
    await AdherenceRisk.deleteMany({ patientId: existingPatient._id });
    await User.deleteOne({ _id: existingPatient._id });
    console.log('Cleaned up existing Suresh demo data');
  }
  const existingCaregiver = await User.findOne({ email: 'rahul@demo.pulsesathi.in' });
  if (existingCaregiver) {
    await CaregiverConsent.deleteMany({ caregiverId: existingCaregiver._id });
    await User.deleteOne({ _id: existingCaregiver._id });
    console.log('Cleaned up existing Rahul demo data');
  }
  const existingClinician = await User.findOne({ email: 'doctor@demo.pulsesathi.in' });
  if (existingClinician) {
    await User.deleteOne({ _id: existingClinician._id });
  }

  // ── 1. CREATE DEMO PATIENT ─────────────────────────────────────────────────
  const patient = await User.create({
    email: 'suresh@demo.pulsesathi.in',
    password: 'Demo@1234',
    role: 'patient',
    firstName: 'Suresh',
    lastName: 'Kumar',
    phone: '+919117328809',
    whatsappPhone: '+919117328809',
    whatsappVerified: true,
    preferredLanguage: 'hi',
    timezone: 'Asia/Kolkata',
    isActive: true,
  });
  console.log(`✅ Created patient: Suresh Kumar (${patient.email})`);

  // ── 2. CREATE CAREGIVER (SON) ──────────────────────────────────────────────
  const caregiver = await User.create({
    email: 'rahul@demo.pulsesathi.in',
    password: 'Demo@1234',
    role: 'caregiver',
    firstName: 'Rahul',
    lastName: 'Kumar',
    phone: '+917654321098',
    whatsappPhone: '+917654321098',
    preferredLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isActive: true,
  });
  console.log(`✅ Created caregiver: Rahul Kumar (son in Pune)`);

  // ── 3. CLINICIAN ───────────────────────────────────────────────────────────
  const clinician = await User.create({
    email: 'doctor@demo.pulsesathi.in',
    password: 'Demo@1234',
    role: 'clinician',
    firstName: 'Dr. Priya',
    lastName: 'Sharma',
    isActive: true,
  });
  console.log(`✅ Created clinician: Dr. Priya Sharma`);

  // ── 4. CAREGIVER CONSENT ───────────────────────────────────────────────────
  await CaregiverConsent.create({
    patientId: patient._id,
    caregiverId: caregiver._id,
    relationship: 'son',
    permissions: {
      viewGlucoseData: false,
      viewMedications: true,
      viewExperiments: false,
      viewInsights: true,
      receiveAlerts: true,
    },
    consentDate: new Date(),
    consentVersion: '1.0',
    isActive: true,
  });

  // ── 5. WHATSAPP CONSENT ────────────────────────────────────────────────────
  await WhatsAppConsent.create({
    patientId: patient._id,
    whatsappPhone: '+919117328809',
    consentGiven: true,
    isActive: true,
    consentDate: new Date(),
    consentVersion: '1.0.0',
    phoneVerified: true,
    verifiedAt: new Date(),
    communicationPreferences: {
      doseReminders: true,
      adherenceAlerts: true,
      caregiverNotifications: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      reminderLeadTimeMinutes: 15,
    },
  });
  console.log(`✅ WhatsApp consent registered`);

  // ── 6. MEDICINES ───────────────────────────────────────────────────────────
  // Medicine A: Metformin - good adherence 96%
  const metformin = await Medicine.create({
    patientId: patient._id,
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'twice',
    timings: ['08:00', '20:00'],
    beforeAfterFood: 'after',
    instructions: 'Take with meals. Do not crush or chew.',
    adherenceScore: 96,
    isProblematic: false,
    consecutiveMisses: 0,
    totalDosesScheduled: 60,
    totalDosesTaken: 58,
    isActive: true,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });

  // Medicine B: Glimepiride - fair adherence 91%
  const glimepiride = await Medicine.create({
    patientId: patient._id,
    name: 'Glimepiride',
    dosage: '2mg',
    frequency: 'once',
    timings: ['08:00'],
    beforeAfterFood: 'before',
    instructions: 'Take 30 minutes before breakfast.',
    adherenceScore: 91,
    isProblematic: false,
    consecutiveMisses: 1,
    totalDosesScheduled: 30,
    totalDosesTaken: 27,
    isActive: true,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });

  // Medicine C: Glipizide - PROBLEMATIC 62% adherence
  const glipizide = await Medicine.create({
    patientId: patient._id,
    name: 'Glipizide',
    dosage: '5mg',
    frequency: 'once',
    timings: ['20:00'],
    beforeAfterFood: 'after',
    instructions: 'Take with dinner.',
    adherenceScore: 62,
    isProblematic: true,
    consecutiveMisses: 3,
    totalDosesScheduled: 30,
    totalDosesTaken: 19,
    isActive: true,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  });
  console.log(`✅ Created 3 medicines (Metformin 96%, Glimepiride 91%, Glipizide 62% ⚠️)`);

  // ── 7. GENERATE 30-DAY DOSE HISTORY ───────────────────────────────────────
  const now = new Date();
  const schedules: any[] = [];
  const events: any[] = [];

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isLate = dayOffset <= 7; // Last 7 days = problematic period for Glipizide

    // ---------- METFORMIN (twice daily) ----------
    for (const time of ['08:00', '20:00']) {
      const [h, m] = time.split(':').map(Number);
      const sched = new Date(date);
      sched.setHours(h, m, 0, 0);
      const isFuture = sched > now;

      // 96% adherence = miss ~1 in 25
      const missed = !isFuture && Math.random() > 0.96;
      const takenAt = missed ? null : new Date(sched.getTime() + Math.random() * 20 * 60000);
      const status = isFuture ? 'pending' : missed ? 'missed' : 'taken';

      const s = await MedicineSchedule.create({
        medicineId: metformin._id,
        patientId: patient._id,
        scheduledFor: sched,
        scheduledTime: time,
        status,
        takenAt: takenAt || undefined,
        delayMinutes: takenAt ? Math.round((takenAt.getTime() - sched.getTime()) / 60000) : undefined,
        beforeAfterFood: 'after',
        remindersSent: isFuture ? 0 : 1,
        whatsappReminderSent: !isFuture,
        responseType: missed ? 'auto-missed' : 'whatsapp-taken',
        responseSource: missed ? undefined : 'whatsapp',
      });
      schedules.push(s._id);

      if (!isFuture) {
        events.push({
          scheduleId: s._id, medicineId: metformin._id, patientId: patient._id,
          eventType: missed ? 'dose-missed' : 'dose-taken',
          timestamp: takenAt || sched,
          metadata: { source: 'whatsapp', isSimulated: true },
        });
      }
    }

    // ---------- GLIMEPIRIDE (once daily 08:00) ----------
    {
      const sched = new Date(date);
      sched.setHours(8, 0, 0, 0);
      const isFuture = sched > now;
      // 91% adherence; slightly worse on weekends
      const missThreshold = isWeekend ? 0.88 : 0.91;
      const missed = !isFuture && Math.random() > missThreshold;
      const delay = missed ? null : Math.random() * 30 * 60000;
      const takenAt = missed ? null : new Date(sched.getTime() + (delay || 0));
      const status = isFuture ? 'pending' : missed ? 'missed' : 'taken';

      const s = await MedicineSchedule.create({
        medicineId: glimepiride._id,
        patientId: patient._id,
        scheduledFor: sched,
        scheduledTime: '08:00',
        status,
        takenAt: takenAt || undefined,
        delayMinutes: takenAt ? Math.round((takenAt.getTime() - sched.getTime()) / 60000) : undefined,
        beforeAfterFood: 'before',
        remindersSent: isFuture ? 0 : 1,
        whatsappReminderSent: !isFuture,
        responseType: missed ? 'auto-missed' : 'whatsapp-taken',
        responseSource: missed ? undefined : 'whatsapp',
      });

      if (!isFuture) {
        events.push({
          scheduleId: s._id, medicineId: glimepiride._id, patientId: patient._id,
          eventType: missed ? 'dose-missed' : 'dose-taken',
          timestamp: takenAt || sched,
          metadata: { source: 'whatsapp', isSimulated: true },
        });
      }
    }

    // ---------- GLIPIZIDE (once daily 20:00) - PROBLEMATIC ----------
    {
      const sched = new Date(date);
      sched.setHours(20, 0, 0, 0);
      const isFuture = sched > now;

      // Adherence story: Days 1-7 good, days 8-14 declining, days 15-30 problematic
      let missProb = 0.05; // 95% in first week
      if (dayOffset <= 22 && dayOffset > 15) missProb = 0.25; // 75%
      if (dayOffset <= 15 && dayOffset > 7)  missProb = 0.40; // 60%
      if (dayOffset <= 7)                    missProb = 0.55; // 45% — most recent week worst

      const missed = !isFuture && Math.random() < missProb;
      const snoozed = !missed && !isFuture && Math.random() < 0.30; // Often snoozed
      const delay = snoozed ? 30 + Math.random() * 60 : Math.random() * 15;
      const takenAt = missed ? null : new Date(sched.getTime() + delay * 60000);

      let status: string;
      if (isFuture) status = 'pending';
      else if (missed) status = 'missed';
      else status = 'taken';

      const s = await MedicineSchedule.create({
        medicineId: glipizide._id,
        patientId: patient._id,
        scheduledFor: sched,
        scheduledTime: '20:00',
        status,
        takenAt: takenAt || undefined,
        delayMinutes: takenAt ? Math.round(delay) : undefined,
        beforeAfterFood: 'after',
        remindersSent: isFuture ? 0 : missed ? 2 : 1,
        whatsappReminderSent: !isFuture,
        responseType: missed ? 'auto-missed' : snoozed ? 'whatsapp-not-yet' : 'whatsapp-taken',
        responseSource: missed ? undefined : 'whatsapp',
        whatsappResponseType: missed ? undefined : snoozed ? 'NOT_TAKEN_YET' : 'TAKEN',
      });

      if (!isFuture) {
        events.push({
          scheduleId: s._id, medicineId: glipizide._id, patientId: patient._id,
          eventType: missed ? 'dose-missed' : snoozed ? 'dose-snoozed' : 'dose-taken',
          timestamp: takenAt || sched,
          metadata: {
            source: 'whatsapp',
            snoozed,
            delayMinutes: takenAt ? Math.round(delay) : undefined,
            isSimulated: true,
          },
        });

        // If snoozed, also add a reminder-sent event
        if (snoozed) {
          events.push({
            scheduleId: s._id, medicineId: glipizide._id, patientId: patient._id,
            eventType: 'reminder-sent',
            timestamp: sched,
            metadata: { reminderChannel: 'whatsapp', reminderNumber: 1, isSimulated: true },
          });
        }
      }
    }
  }

  if (events.length > 0) {
    await DoseEvent.insertMany(events);
  }
  console.log(`✅ Generated 30-day dose history (${schedules.length} schedules, ${events.length} events)`);

  // ── 8. RECALCULATE ADHERENCE SCORES ───────────────────────────────────────
  // Metformin
  const metSchedules = await MedicineSchedule.countDocuments({ medicineId: metformin._id, scheduledFor: { $lt: now } });
  const metTaken = await MedicineSchedule.countDocuments({ medicineId: metformin._id, status: 'taken', scheduledFor: { $lt: now } });
  metformin.totalDosesScheduled = metSchedules;
  metformin.totalDosesTaken = metTaken;
  metformin.adherenceScore = metSchedules > 0 ? Math.round((metTaken / metSchedules) * 100) : 100;
  await metformin.save();

  const gliSchedules = await MedicineSchedule.countDocuments({ medicineId: glimepiride._id, scheduledFor: { $lt: now } });
  const gliTaken = await MedicineSchedule.countDocuments({ medicineId: glimepiride._id, status: 'taken', scheduledFor: { $lt: now } });
  glimepiride.totalDosesScheduled = gliSchedules;
  glimepiride.totalDosesTaken = gliTaken;
  glimepiride.adherenceScore = gliSchedules > 0 ? Math.round((gliTaken / gliSchedules) * 100) : 100;
  await glimepiride.save();

  const glpSchedules = await MedicineSchedule.countDocuments({ medicineId: glipizide._id, scheduledFor: { $lt: now } });
  const glpTaken = await MedicineSchedule.countDocuments({ medicineId: glipizide._id, status: 'taken', scheduledFor: { $lt: now } });
  glipizide.totalDosesScheduled = glpSchedules;
  glipizide.totalDosesTaken = glpTaken;
  glipizide.adherenceScore = glpSchedules > 0 ? Math.round((glpTaken / glpSchedules) * 100) : 100;
  glipizide.isProblematic = glipizide.adherenceScore < 70;
  glipizide.consecutiveMisses = 3;
  await glipizide.save();

  console.log(`✅ Adherence: Metformin ${metformin.adherenceScore}%, Glimepiride ${glimepiride.adherenceScore}%, Glipizide ${glipizide.adherenceScore}%`);

  // ── 9. HIGH-RISK ASSESSMENT FOR GLIPIZIDE ─────────────────────────────────
  await AdherenceRisk.create({
    patientId: patient._id,
    medicineId: glipizide._id,
    riskScore: 72,
    riskLevel: 'high',
    predictionHorizon: '24h',
    factors: [
      { factor: 'consecutive_misses', contribution: 40, description: 'Glipizide missed 3 times in a row' },
      { factor: 'declining_adherence', contribution: 25, description: 'Adherence dropped from 95% to 45% in last 7 days' },
      { factor: 'frequent_snoozing', contribution: 7, description: 'Dose reminders snoozed multiple times' },
    ],
    recommendedIntervention: {
      type: 'caregiver-alert',
      priority: 'high',
      message: 'Glipizide (evening) adherence needs attention - 3 consecutive misses',
    },
    modelType: 'rule-based',
    modelVersion: '1.0.0-rule-based',
    calculatedAt: new Date(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  console.log(`✅ Created high-risk assessment for Glipizide`);

  // ── 10. SAMPLE WHATSAPP MESSAGE HISTORY ───────────────────────────────────
  const yesterday8pm = new Date();
  yesterday8pm.setDate(yesterday8pm.getDate() - 1);
  yesterday8pm.setHours(20, 0, 0, 0);

  const glpYesterdaySchedule = await MedicineSchedule.findOne({
    medicineId: glipizide._id,
    patientId: patient._id,
    status: 'missed',
  }).sort({ scheduledFor: -1 });

  if (glpYesterdaySchedule) {
    // Outgoing reminder
    await WhatsAppMessage.create({
      patientId: patient._id,
      scheduleId: glpYesterdaySchedule._id,
      medicineId: glipizide._id,
      direction: 'outgoing',
      whatsappMessageId: `demo_out_${Date.now()}`,
      phoneNumber: '+919876543210',
      messageType: 'dose-reminder',
      content: 'नमस्ते Suresh जी 🙏\nआपकी दवाई का समय हो गया है।\n💊 Glipizide 5mg\n🕐 8:00 PM\n🍽️ खाने के बाद',
      status: 'delivered',
      responseReceived: false,
      sentAt: yesterday8pm,
      deliveredAt: new Date(yesterday8pm.getTime() + 2000),
      metadata: { reminderNumber: 1, language: 'hi', isSimulated: true },
    });

    // No response came (missed)
    console.log(`✅ Created sample WhatsApp message history`);
  }

  // ── SUMMARY ────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('          PULSESATHI DEMO DATA READY                  ');
  console.log('═══════════════════════════════════════════════════════');
  console.log('PATIENT LOGIN:');
  console.log('  Email:    suresh@demo.pulsesathi.in');
  console.log('  Password: Demo@1234');
  console.log('  Role:     patient');
  console.log('───────────────────────────────────────────────────────');
  console.log('CAREGIVER LOGIN (Rahul - Son in Pune):');
  console.log('  Email:    rahul@demo.pulsesathi.in');
  console.log('  Password: Demo@1234');
  console.log('  Role:     caregiver');
  console.log('───────────────────────────────────────────────────────');
  console.log('CLINICIAN LOGIN:');
  console.log('  Email:    doctor@demo.pulsesathi.in');
  console.log('  Password: Demo@1234');
  console.log('  Role:     clinician');
  console.log('───────────────────────────────────────────────────────');
  console.log('MEDICINE ADHERENCE (30-day):');
  console.log(`  Metformin 500mg (2x/day):  ${metformin.adherenceScore}%  ✅`);
  console.log(`  Glimepiride 2mg (morning): ${glimepiride.adherenceScore}%  ✅`);
  console.log(`  Glipizide 5mg (evening):   ${glipizide.adherenceScore}%  ⚠️ PROBLEMATIC`);
  console.log('───────────────────────────────────────────────────────');
  console.log('WHATSAPP: Mock mode - use Simulator on Today dashboard');
  console.log('═══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
