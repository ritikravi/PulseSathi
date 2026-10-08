import express from 'express';
import { protect } from '../middleware/auth';
import Medicine from '../models/Medicine';
import MedicineSchedule from '../models/MedicineSchedule';
import DoseEvent from '../models/DoseEvent';

const router = express.Router();

// @route   GET /api/medicines
// @desc    Get patient's medicines
// @access  Private
router.get('/', protect, async (req: any, res) => {
  try {
    const medicines = await Medicine.find({
      patientId: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: medicines,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/medicines
// @desc    Add new medicine
// @access  Private
router.post('/', protect, async (req: any, res) => {
  try {
    const medicine = await Medicine.create({
      patientId: req.user._id,
      ...req.body,
    });

    // Auto-generate schedules for the next 7 days
    await generateSchedules(medicine);

    res.status(201).json({
      success: true,
      data: medicine,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   PUT /api/medicines/:id
// @desc    Update medicine
// @access  Private
router.put('/:id', protect, async (req: any, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found',
      });
    }

    Object.assign(medicine, req.body);
    await medicine.save();

    res.json({
      success: true,
      data: medicine,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Deactivate medicine
// @access  Private
router.delete('/:id', protect, async (req: any, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found',
      });
    }

    medicine.isActive = false;
    medicine.endDate = new Date();
    await medicine.save();

    res.json({
      success: true,
      data: medicine,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/medicines/:id/adherence
// @desc    Get medicine-specific adherence data
// @access  Private
router.get('/:id/adherence', protect, async (req: any, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        error: 'Medicine not found',
      });
    }

    // Get recent schedules for detail
    const recentSchedules = await MedicineSchedule.find({
      medicineId: medicine._id,
      scheduledFor: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    })
      .sort({ scheduledFor: -1 })
      .limit(30);

    const adherenceData = {
      medicine: {
        name: medicine.name,
        dosage: medicine.dosage,
      },
      adherenceScore: medicine.adherenceScore,
      isProblematic: medicine.isProblematic,
      consecutiveMisses: medicine.consecutiveMisses,
      totalScheduled: medicine.totalDosesScheduled,
      totalTaken: medicine.totalDosesTaken,
      recentDoses: recentSchedules.map((schedule) => ({
        date: schedule.scheduledFor,
        status: schedule.status,
        takenAt: schedule.takenAt,
        delayMinutes: schedule.delayMinutes,
      })),
    };

    res.json({
      success: true,
      data: adherenceData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   GET /api/medicines/today
// @desc    Get today's medicine schedule
// @access  Private
router.get('/today', protect, async (req: any, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySchedules = await MedicineSchedule.find({
      patientId: req.user._id,
      scheduledFor: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate('medicineId')
      .sort({ scheduledFor: 1 });

    // Categorize by status
    const overdue = [];
    const dueNow = [];
    const upcoming = [];
    const completed = [];

    const now = new Date();

    for (const schedule of todaySchedules) {
      if (schedule.status === 'taken') {
        completed.push(schedule);
      } else if (schedule.isOverdue()) {
        overdue.push(schedule);
      } else if (
        now.getTime() >= schedule.scheduledFor.getTime() - 15 * 60 * 1000
      ) {
        dueNow.push(schedule);
      } else {
        upcoming.push(schedule);
      }
    }

    res.json({
      success: true,
      data: {
        overdue,
        dueNow,
        upcoming,
        completed,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/medicines/:id/dose/taken
// @desc    Mark dose as taken
// @access  Private
router.post('/:scheduleId/dose/taken', protect, async (req: any, res) => {
  try {
    const schedule = await MedicineSchedule.findOne({
      _id: req.params.scheduleId,
      patientId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }

    const takenAt = new Date();
    const delayMinutes = Math.floor(
      (takenAt.getTime() - schedule.scheduledFor.getTime()) / (1000 * 60)
    );

    schedule.status = 'taken';
    schedule.takenAt = takenAt;
    schedule.delayMinutes = delayMinutes;
    schedule.responseType = 'tap-taken';
    schedule.responseSource = 'web';
    await schedule.save();

    // Update medicine adherence
    const medicine = await Medicine.findById(schedule.medicineId);
    if (medicine) {
      medicine.totalDosesTaken += 1;
      medicine.lastTaken = takenAt;
      medicine.consecutiveMisses = 0;
      medicine.updateAdherenceScore();
      await medicine.save();
    }

    // Log event
    await DoseEvent.create({
      scheduleId: schedule._id,
      medicineId: schedule.medicineId,
      patientId: req.user._id,
      eventType: 'dose-taken',
      timestamp: takenAt,
      metadata: {
        delayMinutes,
        responseType: 'tap-taken',
      },
    });

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// @route   POST /api/medicines/:scheduleId/dose/snooze
// @desc    Snooze dose reminder
// @access  Private
router.post('/:scheduleId/dose/snooze', protect, async (req: any, res) => {
  try {
    const { snoozeMinutes = 30 } = req.body;

    const schedule = await MedicineSchedule.findOne({
      _id: req.params.scheduleId,
      patientId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found',
      });
    }

    const snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);

    schedule.status = 'snoozed';
    schedule.snoozedUntil = snoozedUntil;
    schedule.responseType = 'tap-snooze';
    schedule.responseSource = 'web';
    await schedule.save();

    // Log event
    await DoseEvent.create({
      scheduleId: schedule._id,
      medicineId: schedule.medicineId,
      patientId: req.user._id,
      eventType: 'dose-snoozed',
      timestamp: new Date(),
      metadata: {
        snoozeMinutes,
      },
    });

    res.json({
      success: true,
      data: {
        schedule,
        message: `Reminder snoozed for ${snoozeMinutes} minutes`,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Helper function to generate schedules
async function generateSchedules(medicine: any) {
  const schedules = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  // Generate for next 7 days
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day);

    for (const timing of medicine.timings) {
      const [hours, minutes] = timing.split(':').map(Number);
      const scheduledFor = new Date(currentDate);
      scheduledFor.setHours(hours, minutes, 0, 0);

      // Only create if in future
      if (scheduledFor > new Date()) {
        schedules.push({
          medicineId: medicine._id,
          patientId: medicine.patientId,
          scheduledFor,
          scheduledTime: timing,
          beforeAfterFood: medicine.beforeAfterFood,
        });
      }
    }
  }

  if (schedules.length > 0) {
    await MedicineSchedule.insertMany(schedules);
    
    // Update medicine scheduled count
    medicine.totalDosesScheduled += schedules.length;
    await medicine.save();
  }
}

export default router;
