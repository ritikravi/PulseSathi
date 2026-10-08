import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ success: false, error: 'User no longer exists or is inactive' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

export const checkPatientAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const patientId = req.params.patientId || req.body.patientId;
    
    // Admin and clinician have access to all patients
    if (req.user.role === 'admin' || req.user.role === 'clinician') {
      return next();
    }
    
    // Patient can only access their own data
    if (req.user.role === 'patient' && req.user._id.toString() === patientId) {
      return next();
    }
    
    // Caregiver needs explicit consent
    if (req.user.role === 'caregiver') {
      const CaregiverConsent = (await import('../models/CaregiverConsent')).default;
      const consent = await CaregiverConsent.findOne({
        patientId,
        caregiverId: req.user._id,
        isActive: true,
      });
      
      if (consent) {
        req.user.caregiverPermissions = consent.permissions;
        return next();
      }
    }
    
    return res.status(403).json({ success: false, error: 'Access denied' });
  } catch (error) {
    next(error);
  }
};
