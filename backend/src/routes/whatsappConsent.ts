import express from 'express';
import { protect } from '../middleware/auth';
import WhatsAppConsent from '../models/WhatsAppConsent';
import User from '../models/User';

const router = express.Router();

/**
 * @route   POST /api/whatsapp/consent
 * @desc    Register WhatsApp consent and phone number
 * @access  Private (Patient only)
 */
router.post('/', protect, async (req: any, res) => {
  try {
    const {
      whatsappPhone,
      consentGiven,
      communicationPreferences,
    } = req.body;

    // Validate phone format
    if (!/^\+[1-9]\d{1,14}$/.test(whatsappPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use international format (e.g., +919876543210)',
      });
    }

    // Check if phone already registered to another user
    const existingConsent = await WhatsAppConsent.findOne({
      whatsappPhone,
      patientId: { $ne: req.user._id },
      isActive: true,
    });

    if (existingConsent) {
      return res.status(400).json({
        success: false,
        error: 'This phone number is already registered to another patient',
      });
    }

    // Update or create consent
    let consent = await WhatsAppConsent.findOne({ patientId: req.user._id });

    if (consent) {
      // Update existing
      consent.whatsappPhone = whatsappPhone;
      consent.consentGiven = consentGiven;
      consent.isActive = consentGiven;
      
      if (communicationPreferences) {
        consent.communicationPreferences = {
          ...consent.communicationPreferences,
          ...communicationPreferences,
        };
      }
      
      if (!consentGiven) {
        consent.revokedAt = new Date();
        consent.revokedReason = 'User revoked consent';
      } else {
        consent.revokedAt = undefined;
        consent.revokedReason = undefined;
        consent.consentDate = new Date();
      }

      await consent.save();
    } else {
      // Create new
      consent = await WhatsAppConsent.create({
        patientId: req.user._id,
        whatsappPhone,
        consentGiven,
        isActive: consentGiven,
        consentDate: new Date(),
        consentVersion: '1.0.0',
        communicationPreferences: communicationPreferences || {},
      });
    }

    // Update user's whatsappPhone field
    await User.findByIdAndUpdate(req.user._id, {
      whatsappPhone,
    });

    res.status(201).json({
      success: true,
      data: consent,
      message: consentGiven 
        ? 'WhatsApp reminders enabled successfully' 
        : 'WhatsApp reminders disabled',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/whatsapp/consent
 * @desc    Get current WhatsApp consent status
 * @access  Private
 */
router.get('/', protect, async (req: any, res) => {
  try {
    const consent = await WhatsAppConsent.findOne({
      patientId: req.user._id,
    });

    if (!consent) {
      return res.json({
        success: true,
        data: {
          hasConsent: false,
          consentGiven: false,
          isActive: false,
        },
      });
    }

    res.json({
      success: true,
      data: {
        hasConsent: true,
        consentGiven: consent.consentGiven,
        isActive: consent.isActive,
        whatsappPhone: consent.whatsappPhone,
        phoneVerified: consent.phoneVerified,
        communicationPreferences: consent.communicationPreferences,
        consentDate: consent.consentDate,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/whatsapp/consent/preferences
 * @desc    Update communication preferences
 * @access  Private
 */
router.put('/preferences', protect, async (req: any, res) => {
  try {
    const consent = await WhatsAppConsent.findOne({
      patientId: req.user._id,
    });

    if (!consent) {
      return res.status(404).json({
        success: false,
        error: 'WhatsApp consent not found. Please register first.',
      });
    }

    const { communicationPreferences } = req.body;

    consent.communicationPreferences = {
      ...consent.communicationPreferences,
      ...communicationPreferences,
    };

    await consent.save();

    res.json({
      success: true,
      data: consent,
      message: 'Preferences updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/whatsapp/consent
 * @desc    Revoke WhatsApp consent
 * @access  Private
 */
router.delete('/', protect, async (req: any, res) => {
  try {
    const { reason } = req.body;

    const consent = await WhatsAppConsent.findOne({
      patientId: req.user._id,
    });

    if (!consent) {
      return res.status(404).json({
        success: false,
        error: 'Consent not found',
      });
    }

    consent.isActive = false;
    consent.consentGiven = false;
    consent.revokedAt = new Date();
    consent.revokedReason = reason || 'User requested';
    await consent.save();

    res.json({
      success: true,
      message: 'WhatsApp reminders disabled successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/whatsapp/status
 * @desc    Get WhatsApp integration status (for display)
 * @access  Private
 */
router.get('/status', protect, async (req: any, res) => {
  try {
    const consent = await WhatsAppConsent.findOne({
      patientId: req.user._id,
      isActive: true,
    });

    const mode = process.env.WHATSAPP_MODE || 'mock';
    const isConfigured = mode === 'production' && !!process.env.WHATSAPP_ACCESS_TOKEN;

    res.json({
      success: true,
      data: {
        mode,
        isConfigured,
        isDemo: mode === 'mock',
        hasConsent: !!consent,
        phone: consent?.whatsappPhone,
        preferences: consent?.communicationPreferences,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
