import express from 'express';
import { protect, authorize } from '../middleware/auth';
import Experiment from '../models/Experiment';
import ExperimentEvent from '../models/ExperimentEvent';
import DetectedPattern from '../models/DetectedPattern';
import GlucoseReading from '../models/GlucoseReading';
import PatientBehaviourProfile from '../models/PatientBehaviourProfile';

const router = express.Router();

// @route   POST /api/experiments
// @desc    Create new experiment from pattern
// @access  Private (Patient)
router.post('/', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const { patternId, ...experimentData } = req.body;
    
    // Check for active experiments
    const activeExperiment = await Experiment.findOne({
      patientId: req.user._id,
      status: 'active',
    });
    
    if (activeExperiment) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active experiment. Please complete it first.',
      });
    }
    
    // Create experiment
    const experiment = await Experiment.create({
      patientId: req.user._id,
      patternId,
      ...experimentData,
      status: 'active',
    });
    
    // Update pattern status
    if (patternId) {
      await DetectedPattern.findByIdAndUpdate(patternId, {
        status: 'experiment-created',
      });
    }
    
    res.status(201).json({
      success: true,
      data: experiment,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/experiments
// @desc    Get experiments for patient
// @access  Private (Patient)
router.get('/', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const experiments = await Experiment.find({
      patientId: req.user._id,
    }).sort({ interventionStartDate: -1 });
    
    res.json({
      success: true,
      data: experiments,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/experiments/:experimentId
// @desc    Get experiment details
// @access  Private (Patient)
router.get('/:experimentId', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const experiment = await Experiment.findOne({
      _id: req.params.experimentId,
      patientId: req.user._id,
    });
    
    if (!experiment) {
      return res.status(404).json({ success: false, error: 'Experiment not found' });
    }
    
    const events = await ExperimentEvent.find({
      experimentId: experiment._id,
    }).sort({ dayNumber: 1 });
    
    res.json({
      success: true,
      data: {
        experiment,
        events,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/experiments/:experimentId/checkin
// @desc    Log experiment check-in
// @access  Private (Patient)
router.post('/:experimentId/checkin', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const experiment = await Experiment.findOne({
      _id: req.params.experimentId,
      patientId: req.user._id,
    });
    
    if (!experiment) {
      return res.status(404).json({ success: false, error: 'Experiment not found' });
    }
    
    const { dayNumber, adherenceStatus, notes, measurements } = req.body;
    
    const event = await ExperimentEvent.create({
      experimentId: experiment._id,
      patientId: req.user._id,
      eventType: 'check-in',
      dayNumber,
      adherenceStatus,
      notes,
      measurements,
    });
    
    // Update experiment current day
    experiment.currentDay = dayNumber;
    await experiment.save();
    
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/experiments/:experimentId/complete
// @desc    Complete experiment and calculate results
// @access  Private (Patient)
router.post('/:experimentId/complete', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const experiment = await Experiment.findOne({
      _id: req.params.experimentId,
      patientId: req.user._id,
    });
    
    if (!experiment) {
      return res.status(404).json({ success: false, error: 'Experiment not found' });
    }
    
    // Calculate results based on baseline vs intervention period
    const baselineReadings = await GlucoseReading.find({
      patientId: req.user._id,
      timestamp: {
        $gte: experiment.baselineStartDate,
        $lte: experiment.baselineEndDate,
      },
      readingType: experiment.primaryOutcome.metric === 'fasting_glucose' ? 'fasting' : 'random',
    });
    
    const interventionReadings = await GlucoseReading.find({
      patientId: req.user._id,
      timestamp: {
        $gte: experiment.interventionStartDate,
        $lte: experiment.interventionEndDate,
      },
      readingType: experiment.primaryOutcome.metric === 'fasting_glucose' ? 'fasting' : 'random',
    });
    
    const baselineAvg = baselineReadings.reduce((sum, r) => sum + r.value, 0) / baselineReadings.length || 0;
    const interventionAvg = interventionReadings.reduce((sum, r) => sum + r.value, 0) / interventionReadings.length || 0;
    
    const difference = baselineAvg - interventionAvg;
    const percentageChange = baselineAvg > 0 ? ((difference / baselineAvg) * 100) : 0;
    
    const events = await ExperimentEvent.find({ experimentId: experiment._id });
    const completionRate = (events.filter(e => e.adherenceStatus === 'completed').length / experiment.durationDays) || 0;
    
    let evidenceStrength: 'weak' | 'moderate' | 'strong' = 'weak';
    if (completionRate >= 0.8 && interventionReadings.length >= 3) {
      evidenceStrength = 'strong';
    } else if (completionRate >= 0.6 && interventionReadings.length >= 2) {
      evidenceStrength = 'moderate';
    }
    
    const improvement = difference > 0;
    
    experiment.status = 'completed';
    experiment.results = {
      baselineAverage: Math.round(baselineAvg),
      interventionAverage: Math.round(interventionAvg),
      difference: Math.round(difference),
      percentageChange: Math.round(percentageChange * 10) / 10,
      improvement,
      completionRate: Math.round(completionRate * 100),
      sampleSize: interventionReadings.length,
      evidenceStrength,
      conclusion: improvement
        ? `The intervention was associated with a ${Math.abs(Math.round(percentageChange))}% improvement in ${experiment.primaryOutcome.metric.replace('_', ' ')}.`
        : `No significant improvement was observed. Your baseline average was ${Math.round(baselineAvg)} and intervention average was ${Math.round(interventionAvg)}.`,
    };
    
    await experiment.save();
    
    // Update behaviour profile
    if (improvement && evidenceStrength !== 'weak') {
      const profile = await PatientBehaviourProfile.findOne({ patientId: req.user._id });
      if (profile) {
        profile.successfulInterventions.push({
          interventionType: experiment.intervention.type,
          description: experiment.intervention.description,
          effectSize: difference,
          successRate: completionRate,
          lastUsed: new Date(),
        });
        await profile.save();
      }
    }
    
    res.json({
      success: true,
      data: experiment,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
