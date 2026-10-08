import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';
import glucoseRoutes from './routes/glucose';
import medicationRoutes from './routes/medication';
import activityRoutes from './routes/activity';
import mealRoutes from './routes/meal';
import patternRoutes from './routes/pattern';
import experimentRoutes from './routes/experiment';
import clinicianRoutes from './routes/clinician';
import caregiverRoutes from './routes/caregiver';
import medicineRoutes from './routes/medicine';
import adherenceRoutes from './routes/adherence';
import notificationRoutes from './routes/notification';
import whatsappWebhookRoutes from './routes/whatsappWebhook';
import whatsappConsentRoutes from './routes/whatsappConsent';
import whatsappSimulateRoutes from './routes/whatsappSimulate';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://pulse-sathi-rosy.vercel.app',
  'https://pulseloop.vercel.app',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/glucose', glucoseRoutes);
app.use('/api/medication', medicationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/meal', mealRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/clinician', clinicianRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/whatsapp/webhook', whatsappWebhookRoutes);
app.use('/api/whatsapp/consent', whatsappConsentRoutes);
app.use('/api/whatsapp', whatsappSimulateRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pulseloop');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    
    // Start reminder scheduler
    startReminderScheduler();
  });
});

// Reminder scheduler
function startReminderScheduler() {
  const reminderScheduler = require('./services/reminderScheduler').default;
  const intervalMs = parseInt(process.env.REMINDER_CHECK_INTERVAL_MS || '60000');
  
  console.log(`📅 Starting reminder scheduler (interval: ${intervalMs}ms)`);
  console.log(`📱 WhatsApp mode: ${process.env.WHATSAPP_MODE || 'mock'}`);
  
  // Run immediately on startup
  reminderScheduler.sendDueReminders().catch((err: any) => {
    console.error('Scheduler startup error:', err);
  });
  
  // Then run on interval
  setInterval(() => {
    reminderScheduler.sendDueReminders().catch((err: any) => {
      console.error('Scheduler error:', err);
    });
  }, intervalMs);
  
  // Followup reminders check (less frequent)
  setInterval(() => {
    reminderScheduler.sendFollowupReminders().catch((err: any) => {
      console.error('Followup scheduler error:', err);
    });
  }, intervalMs * 5); // Check every 5 minutes
}

export default app;
