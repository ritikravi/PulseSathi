import express from 'express';
import { protect, authorize } from '../middleware/auth';
import DetectedPattern from '../models/DetectedPattern';
import axios from 'axios';

const router = express.Router();

// @route   GET /api/patterns
// @desc    Get detected patterns for patient
// @access  Private (Patient)
router.get('/', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const patterns = await DetectedPattern.find({
      patientId: req.user._id,
      status: { $in: ['detected', 'experiment-created'] },
    }).sort({ detectionDate: -1 });
    
    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/patterns/detect
// @desc    Trigger pattern detection for patient
// @access  Private (Patient)
router.post('/detect', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const patientId = req.user._id;
    
    // Call ML service for pattern detection
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    try {
      const response = await axios.post(`${mlServiceUrl}/detect-patterns`, {
        patient_id: patientId.toString(),
      });
      
      const patterns = response.data.patterns || [];
      
      // Save detected patterns to database
      const savedPatterns = [];
      for (const pattern of patterns) {
        const existing = await DetectedPattern.findOne({
          patientId,
          title: pattern.title,
          status: 'detected',
        });
        
        if (!existing) {
          const newPattern = await DetectedPattern.create({
            patientId,
            ...pattern,
          });
          savedPatterns.push(newPattern);
        }
      }
      
      res.json({
        success: true,
        data: savedPatterns,
        message: `Detected ${savedPatterns.length} new pattern(s)`,
      });
    } catch (mlError) {
      console.error('ML service error:', mlError);
      return res.status(503).json({
        success: false,
        error: 'Pattern detection service temporarily unavailable',
      });
    }
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/patterns/:patternId/dismiss
// @desc    Dismiss a detected pattern
// @access  Private (Patient)
router.put('/:patternId/dismiss', protect, authorize('patient'), async (req: any, res, next) => {
  try {
    const pattern = await DetectedPattern.findOneAndUpdate(
      {
        _id: req.params.patternId,
        patientId: req.user._id,
      },
      {
        status: 'dismissed',
        dismissedReason: req.body.reason || 'User dismissed',
      },
      { new: true }
    );
    
    if (!pattern) {
      return res.status(404).json({ success: false, error: 'Pattern not found' });
    }
    
    res.json({
      success: true,
      data: pattern,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
