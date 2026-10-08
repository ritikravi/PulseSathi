import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pill, Clock, AlertCircle, CheckCircle, Bell, MessageCircle } from 'lucide-react';
import { medicines, whatsapp } from '../lib/api';
import { format } from 'date-fns';
import WhatsAppDemoSimulator from '../components/WhatsAppDemoSimulator';

export default function TodayViewPage() {
  const queryClient = useQueryClient();

  const { data: todayData, isLoading } = useQuery({
    queryKey: ['medicines-today'],
    queryFn: async () => {
      const response = await medicines.getTodaySchedule();
      return response.data.data;
    },
    refetchInterval: 30000, // Poll every 30s to catch WhatsApp responses
  });

  const { data: whatsappStatus } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const r = await whatsapp.getStatus();
      return r.data.data;
    },
  });

  const takeDoseMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      return medicines.markTaken(scheduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines-today'] });
    },
  });

  const snoozeDoseMutation = useMutation({
    mutationFn: async ({ scheduleId, snoozeMinutes }: { scheduleId: string; snoozeMinutes: number }) => {
      return medicines.snoozeDose(scheduleId, snoozeMinutes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines-today'] });
    },
  });

  const handleTakeDose = (scheduleId: string) => {
    takeDoseMutation.mutate(scheduleId);
  };

  const handleSnooze = (scheduleId: string, minutes: number = 30) => {
    snoozeDoseMutation.mutate({ scheduleId, snoozeMinutes: minutes });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading today's medicines...</div>
      </div>
    );
  }

  const { overdue = [], dueNow = [], upcoming = [], completed = [] } = todayData || {};
  const totalPending = overdue.length + dueNow.length;

  return (
    <div className="space-y-4 pb-20">
      {/* Header - Simple greeting */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          🌅 {format(new Date(), 'EEEE')}
        </h1>
        <p className="text-primary-100 text-sm sm:text-base">
          {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Pending count */}
      {totalPending > 0 && (
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-lg">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-warning-600 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold text-warning-900">
                {totalPending} {totalPending === 1 ? 'Medicine' : 'Medicines'} Pending
              </p>
              <p className="text-sm text-warning-700">Please take your medicines on time</p>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Medicines - RED */}
      {overdue.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-danger-700 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            OVERDUE
          </h2>
          {overdue.map((schedule: any) => (
            <DoseCard
              key={schedule._id}
              schedule={schedule}
              variant="overdue"
              onTake={() => handleTakeDose(schedule._id)}
              onSnooze={() => handleSnooze(schedule._id)}
              isPending={takeDoseMutation.isPending || snoozeDoseMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Due Now - GREEN */}
      {dueNow.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-success-700 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            DUE NOW
          </h2>
          {dueNow.map((schedule: any) => (
            <DoseCard
              key={schedule._id}
              schedule={schedule}
              variant="due"
              onTake={() => handleTakeDose(schedule._id)}
              onSnooze={() => handleSnooze(schedule._id)}
              isPending={takeDoseMutation.isPending || snoozeDoseMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-700 flex items-center">
            <Pill className="w-5 h-5 mr-2" />
            UPCOMING
          </h2>
          {upcoming.map((schedule: any) => (
            <DoseCard
              key={schedule._id}
              schedule={schedule}
              variant="upcoming"
              isPending={false}
            />
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-500 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            COMPLETED
          </h2>
          {completed.map((schedule: any) => (
            <DoseCard
              key={schedule._id}
              schedule={schedule}
              variant="completed"
              isPending={false}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {totalPending === 0 && completed.length === 0 && (
        <div className="text-center py-12 bg-success-50 rounded-lg">
          <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-success-900">All caught up!</p>
          <p className="text-success-700 mt-1">No medicines scheduled for today</p>
        </div>
      )}

      {/* WhatsApp demo simulator - show in demo mode */}
      {whatsappStatus?.isDemo && (
        <WhatsAppDemoSimulator />
      )}

      {/* WhatsApp setup prompt if not connected */}
      {!whatsappStatus?.hasConsent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <MessageCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 text-sm">Enable WhatsApp Reminders</p>
            <p className="text-xs text-green-700 mt-0.5">
              Get medicine reminders on WhatsApp. Reply with one tap to confirm.
            </p>
            <a href="/profile" className="text-xs text-green-700 font-semibold underline mt-1 inline-block">
              Set up now →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

interface DoseCardProps {
  schedule: any;
  variant: 'overdue' | 'due' | 'upcoming' | 'completed';
  onTake?: () => void;
  onSnooze?: () => void;
  isPending?: boolean;
}

function DoseCard({ schedule, variant, onTake, onSnooze, isPending }: DoseCardProps) {
  const medicine = schedule.medicineId;
  const timeStr = format(new Date(schedule.scheduledFor), 'h:mm a');

  const variantStyles = {
    overdue: 'bg-danger-50 border-danger-200 border-2',
    due: 'bg-success-50 border-success-200 border-2',
    upcoming: 'bg-white border-gray-200 border',
    completed: 'bg-gray-50 border-gray-200 border opacity-60',
  };

  const iconColors = {
    overdue: 'text-danger-600 bg-danger-100',
    due: 'text-success-600 bg-success-100',
    upcoming: 'text-primary-600 bg-primary-100',
    completed: 'text-gray-600 bg-gray-200',
  };

  const minutesOverdue = schedule.isOverdue ? schedule.getMinutesOverdue() : 0;

  return (
    <div className={`rounded-xl p-4 sm:p-5 ${variantStyles[variant]} shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[variant]}`}>
            <Pill className="w-6 h-6" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="font-bold text-lg text-gray-900">{medicine?.name || 'Medicine'}</h3>
            <p className="text-sm text-gray-600">{medicine?.dosage}</p>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-gray-700 font-medium">{timeStr}</span>
              {minutesOverdue > 0 && (
                <span className="text-danger-600 font-medium">({minutesOverdue} min late)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Food instruction */}
      <div className="mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300">
          {schedule.beforeAfterFood === 'before' && '☕ Before food'}
          {schedule.beforeAfterFood === 'after' && '🍽️ After food'}
          {schedule.beforeAfterFood === 'anytime' && '⏰ Anytime'}
        </span>
      </div>

      {/* Action buttons */}
      {(variant === 'overdue' || variant === 'due') && (
        <div className="flex gap-2">
          <button
            onClick={onTake}
            disabled={isPending}
            className="flex-1 bg-success-600 hover:bg-success-700 text-white font-semibold py-3 px-4 rounded-lg text-base sm:text-lg disabled:opacity-50 transition-colors"
          >
            ✓ TAKEN
          </button>
          <button
            onClick={onSnooze}
            disabled={isPending}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border-2 border-gray-300 text-base sm:text-lg disabled:opacity-50 transition-colors"
          >
            ⏰ +30 min
          </button>
        </div>
      )}

      {variant === 'completed' && schedule.takenAt && (
        <div className="text-sm text-gray-600 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Taken at {format(new Date(schedule.takenAt), 'h:mm a')}
          {schedule.delayMinutes > 0 && ` (${schedule.delayMinutes} min late)`}
          {schedule.responseSource === 'whatsapp' && (
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">
              <MessageCircle className="w-3 h-3" />
              via WhatsApp
            </span>
          )}
        </div>
      )}

      {/* WhatsApp reminder sent indicator */}
      {(variant === 'overdue' || variant === 'due') && schedule.whatsappReminderSent && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <MessageCircle className="w-3.5 h-3.5 text-green-500" />
          WhatsApp reminder sent
        </div>
      )}
    </div>
  );
}
