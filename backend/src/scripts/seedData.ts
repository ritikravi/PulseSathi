import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import PatientBehaviourProfile from '../models/PatientBehaviourProfile';
import GlucoseReading from '../models/GlucoseReading';
import MedicationLog from '../models/MedicationLog';
import ActivityLog from '../models/ActivityLog';
import MealLog from '../models/MealLog';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pulseloop');
    console.log('Connected to MongoDB');
    
    // Clear existing demo data
    await User.deleteMany({ email: 'ramesh@demo.com' });
    
    // Create demo patient: Ramesh
    const ramesh = await User.create({
      email: 'ramesh@demo.com',
      password: 'password123',
      firstName: 'Ramesh',
      lastName: 'Kumar',
      role: 'patient',
      phone: '+919876543210',
    });
    
    console.log('Created user: Ramesh');
    
    // Create patient profile
    await PatientProfile.create({
      userId: ramesh._id,
      dateOfBirth: new Date('1966-03-15'), // Age 58
      gender: 'male',
      language: 'en',
      diagnosisDate: new Date('2020-06-01'),
      diabetesType: 'type2',
      lastHbA1c: 7.8,
      lastHbA1cDate: new Date('2024-09-15'),
      currentMedications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          timing: ['08:00', '20:00'],
        },
        {
          name: 'Glimepiride',
          dosage: '2mg',
          frequency: 'once daily',
          timing: ['08:00'],
        },
      ],
      targetGlucoseFasting: { min: 70, max: 100 },
      targetGlucosePostMeal: { min: 70, max: 140 },
      dietPreference: 'vegetarian',
      activityLevel: 'sedentary',
      smokingStatus: 'never',
      alcoholConsumption: 'occasional',
    });
    
    console.log('Created patient profile');
    
    // Create behaviour profile
    await PatientBehaviourProfile.create({
      patientId: ramesh._id,
      medicationAdherenceRate: 0.85,
      checkInConsistency: 0.75,
    });
    
    console.log('Created behaviour profile');
    
    // Generate 30 days of synthetic data with detectable pattern:
    // PATTERN: Late dinner (after 9 PM) → Higher fasting glucose next morning
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);
      
      // Determine if this is a "late dinner" day (40% of days)
      const isLateDinner = Math.random() < 0.4;
      
      // Dinner time
      const dinnerHour = isLateDinner ? 21 + Math.floor(Math.random() * 2) : 19 + Math.floor(Math.random() * 2);
      const dinnerTime = new Date(currentDate);
      dinnerTime.setHours(dinnerHour, Math.floor(Math.random() * 60), 0);
      
      await MealLog.create({
        patientId: ramesh._id,
        mealType: 'dinner',
        timestamp: dinnerTime,
        foods: isLateDinner ? ['rice', 'curry', 'roti', 'dessert'] : ['rice', 'curry', 'vegetables'],
        portionSize: isLateDinner ? 'large' : 'medium',
        carbohydrateEstimate: isLateDinner ? 'high' : 'medium',
      });
      
      // Post-dinner activity
      if (!isLateDinner && Math.random() < 0.6) {
        const activityTime = new Date(dinnerTime.getTime() + 30 * 60 * 1000);
        await ActivityLog.create({
          patientId: ramesh._id,
          activityType: 'walking',
          duration: 15 + Math.floor(Math.random() * 15),
          intensity: 'light',
          timestamp: activityTime,
        });
      }
      
      // Morning medication (next day)
      const nextMorning = new Date(currentDate);
      nextMorning.setDate(nextMorning.getDate() + 1);
      nextMorning.setHours(8, Math.floor(Math.random() * 30), 0);
      
      const medicationTaken = Math.random() < 0.9;
      await MedicationLog.create({
        patientId: ramesh._id,
        medicationName: 'Metformin',
        dosage: '500mg',
        scheduledTime: nextMorning,
        takenTime: medicationTaken ? nextMorning : undefined,
        status: medicationTaken ? 'taken' : 'missed',
      });
      
      // Fasting glucose reading (next morning)
      // PATTERN: Late dinner → Higher glucose
      const baselineGlucose = 115 + Math.random() * 20; // 115-135
      const latePatternEffect = isLateDinner ? 15 + Math.random() * 15 : 0; // +15-30 if late dinner
      const fastingGlucose = Math.round(baselineGlucose + latePatternEffect);
      
      const fastingTime = new Date(nextMorning);
      fastingTime.setHours(7, Math.floor(Math.random() * 30), 0);
      
      await GlucoseReading.create({
        patientId: ramesh._id,
        value: fastingGlucose,
        unit: 'mg/dL',
        readingType: 'fasting',
        timestamp: fastingTime,
        source: 'manual',
      });
      
      // Lunch
      const lunchTime = new Date(nextMorning);
      lunchTime.setHours(13, Math.floor(Math.random() * 60), 0);
      
      await MealLog.create({
        patientId: ramesh._id,
        mealType: 'lunch',
        timestamp: lunchTime,
        foods: ['rice', 'dal', 'vegetables', 'roti'],
        portionSize: 'medium',
        carbohydrateEstimate: 'medium',
      });
      
      // Post-lunch glucose (occasional)
      if (Math.random() < 0.3) {
        const postLunchTime = new Date(lunchTime.getTime() + 2 * 60 * 60 * 1000);
        await GlucoseReading.create({
          patientId: ramesh._id,
          value: Math.round(140 + Math.random() * 40),
          unit: 'mg/dL',
          readingType: 'post-meal',
          timestamp: postLunchTime,
          source: 'manual',
          mealContext: {
            mealType: 'lunch',
            timeAfterMeal: 120,
          },
        });
      }
    }
    
    console.log('Generated 30 days of synthetic data with detectable pattern');
    console.log('PATTERN: Late dinner (after 9 PM) → Higher fasting glucose');
    console.log('\nDemo credentials:');
    console.log('Email: ramesh@demo.com');
    console.log('Password: password123');
    
    await mongoose.disconnect();
    console.log('\nDatabase seeded successfully!');
    
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
