import Notification from '../models/Notification';

interface CreateNotificationParams {
  userId: string;
  type: 'dose-reminder' | 'dose-overdue' | 'high-risk-alert' | 'caregiver-alert' | 'pattern-detected' | 'experiment-checkin';
  title: string;
  message: string;
  actionUrl?: string;
  relatedEntityType?: 'medicine' | 'schedule' | 'pattern' | 'experiment';
  relatedEntityId?: string;
  priority?: 'low' | 'medium' | 'high';
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
      priority: params.priority || 'medium',
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function notifyDoseReminder(userId: string, medicineName: string, time: string, scheduleId: string) {
  return createNotification({
    userId,
    type: 'dose-reminder',
    title: `Time for ${medicineName}`,
    message: `It's time to take your ${medicineName} (${time})`,
    actionUrl: '/today',
    relatedEntityType: 'schedule',
    relatedEntityId: scheduleId,
    priority: 'medium',
  });
}

export async function notifyDoseOverdue(userId: string, medicineName: string, minutesLate: number, scheduleId: string) {
  return createNotification({
    userId,
    type: 'dose-overdue',
    title: `${medicineName} is overdue`,
    message: `You missed your ${medicineName} by ${minutesLate} minutes. Please take it now.`,
    actionUrl: '/today',
    relatedEntityType: 'schedule',
    relatedEntityId: scheduleId,
    priority: 'high',
  });
}

export async function notifyHighRisk(userId: string, medicineName: string, riskLevel: string) {
  return createNotification({
    userId,
    type: 'high-risk-alert',
    title: 'Adherence Risk Alert',
    message: `Your ${medicineName} adherence is at ${riskLevel} risk. Please maintain your medication schedule.`,
    actionUrl: '/today',
    priority: 'high',
  });
}

export async function notifyCaregiverAlert(caregiverId: string, patientName: string, medicineName: string) {
  return createNotification({
    userId: caregiverId,
    type: 'caregiver-alert',
    title: `${patientName} needs attention`,
    message: `${patientName} has missed ${medicineName} multiple times. Consider reaching out.`,
    actionUrl: '/caregiver',
    priority: 'high',
  });
}

export async function notifyPatternDetected(userId: string, patternType: string, patternId: string) {
  return createNotification({
    userId,
    type: 'pattern-detected',
    title: 'New Pattern Detected',
    message: `We detected a ${patternType} pattern in your medication adherence.`,
    actionUrl: '/patterns',
    relatedEntityType: 'pattern',
    relatedEntityId: patternId,
    priority: 'medium',
  });
}
