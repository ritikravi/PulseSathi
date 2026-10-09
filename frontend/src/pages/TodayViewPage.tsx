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
    refetchInterval: 30000,
  });

  const { data: whatsappStatus } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const r = await whatsapp.getStatus();
      return r.data.data;
    },
  });

  const takeDoseMutation = useMutation({
    mutationFn: (scheduleId: string) => medicines.markTaken(scheduleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicines-today'] }),
  });

  const snoozeDoseMutation = useMutation({
    mutationFn: ({ scheduleId, snoozeMinutes }: { scheduleId: string; snoozeMinutes: number }) =>
      medicines.snoozeDose(scheduleId, snoozeMinutes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicines-today'] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#2e7d32] font-medium">Loading today's medicines...</div>
      </div>
    );
  }

  const { overdue = [], dueNow = [], upcoming = [], completed = [] } = todayData || {};
  const totalPending = overdue.length + dueNow.length;
  const isPending = takeDoseMutation.isPending || snoozeDoseMutation.isPending;

  return (
    <div className="space-y-4 pb-10">

      {/* ── Date header ──────────────────────────────────────────────── */}
      <div className="bg-[#2e7d32] text-white px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🌅 {format(new Date(), 'EEEE')}</h1>
          <p className="text-green-200 text-sm">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <Bell className="w-5 h-5" />
            <span className="font-bold text-sm">{totalPending} Pending</span>
          </div>
        )}
      </div>

      {/* ── Overdue ──────────────────────────────────────────────────── */}
      {overdue.length > 0 && (
        <Section
          title="⚠️ Overdue Medicines"
          titleClass="text-white"
          headerClass="bg-red-600"
          borderClass="border-red-600"
        >
          {overdue.map((schedule: any) => (
            <DoseCard key={schedule._id} schedule={schedule} variant="overdue"
              onTake={() => takeDoseMutation.mutate(schedule._id)}
              onSnooze={() => snoozeDoseMutation.mutate({ scheduleId: schedule._id, snoozeMinutes: 30 })}
              isPending={isPending} />
          ))}
        </Section>
      )}

      {/* ── Due Now ──────────────────────────────────────────────────── */}
      {dueNow.length > 0 && (
        <Section
          title="🕐 Due Now"
          titleClass="text-white"
          headerClass="bg-[#2e7d32]"
          borderClass="border-[#2e7d32]"
        >
          {dueNow.map((schedule: any) => (
            <DoseCard key={schedule._id} schedule={schedule} variant="due"
              onTake={() => takeDoseMutation.mutate(schedule._id)}
              onSnooze={() => snoozeDoseMutation.mutate({ scheduleId: schedule._id, snoozeMinutes: 30 })}
              isPending={isPending} />
          ))}
        </Section>
      )}

      {/* ── Upcoming ─────────────────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <Section
          title="⏰ Upcoming Medicines"
          titleClass="text-white"
          headerClass="bg-[#388e3c]"
          borderClass="border-[#388e3c]"
        >
          {upcoming.map((schedule: any) => (
            <DoseCard key={schedule._id} schedule={schedule} variant="upcoming" isPending={false} />
          ))}
        </Section>
      )}

      {/* ── Completed ────────────────────────────────────────────────── */}
      {completed.length > 0 && (
        <Section
          title="✅ Completed Today"
          titleClass="text-white"
          headerClass="bg-gray-600"
          borderClass="border-gray-400"
        >
          {completed.map((schedule: any) => (
            <DoseCard key={schedule._id} schedule={schedule} variant="completed" isPending={false} />
          ))}
        </Section>
      )}

      {/* ── Empty ────────────────────────────────────────────────────── */}
      {totalPending === 0 && completed.length === 0 && (
        <div className="border-2 border-[#2e7d32] rounded-lg overflow-hidden">
          <div className="bg-[#2e7d32] px-5 py-3">
            <h2 className="text-white font-bold">Today's Medicines</h2>
          </div>
          <div className="p-10 text-center bg-green-50">
            <CheckCircle className="w-14 h-14 text-[#2e7d32] mx-auto mb-3" />
            <p className="text-lg font-bold text-[#2e7d32]">All Done!</p>
            <p className="text-sm text-gray-600 mt-1">No medicines scheduled for today</p>
          </div>
        </div>
      )}

      {/* ── WhatsApp Simulator ───────────────────────────────────────── */}
      {whatsappStatus?.isDemo && <WhatsAppDemoSimulator />}

      {/* ── WhatsApp Setup Prompt ────────────────────────────────────── */}
      {!whatsappStatus?.hasConsent && (
        <div className="border-2 border-[#2e7d32] rounded-lg overflow-hidden">
          <div className="bg-[#2e7d32] px-5 py-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold">Enable WhatsApp Reminders</h2>
          </div>
          <div className="p-4 bg-green-50 flex items-start gap-3">
            <div>
              <p className="text-sm text-gray-700 mt-0.5">Get medicine reminders on WhatsApp. Reply with one tap to confirm.</p>
              <a href="/profile" className="text-sm text-[#2e7d32] font-bold underline mt-2 inline-block">Set up now →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, titleClass, headerClass, borderClass, children }: {
  title: string; titleClass: string; headerClass: string; borderClass: string; children: React.ReactNode;
}) {
  return (
    <div className={`border-2 ${borderClass} rounded-lg overflow-hidden shadow-sm`}>
      <div className={`${headerClass} px-5 py-3`}>
        <h2 className={`font-bold text-base ${titleClass}`}>{title}</h2>
      </div>
      <div className="divide-y divide-gray-100 bg-white">
        {children}
      </div>
    </div>
  );
}

// ── DoseCard ───────────────────────────────────────────────────────────────
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

  const iconBg = {
    overdue: 'bg-red-100 text-red-600',
    due: 'bg-green-100 text-[#2e7d32]',
    upcoming: 'bg-green-50 text-[#388e3c]',
    completed: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg[variant]}`}>
        <Pill className="w-5 h-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-base">{medicine?.name || 'Medicine'}</p>
        <p className="text-sm text-gray-500">{medicine?.dosage} &nbsp;·&nbsp; {timeStr}</p>
        <span className="inline-block mt-1 text-xs bg-green-50 text-[#2e7d32] border border-green-200 px-2 py-0.5 rounded-full">
          {schedule.beforeAfterFood === 'before' ? '☕ Before food' :
           schedule.beforeAfterFood === 'after' ? '🍽️ After food' : '⏰ Anytime'}
        </span>
        {schedule.responseSource === 'whatsapp' && schedule.takenAt && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            <MessageCircle className="w-3 h-3" /> via WhatsApp
          </span>
        )}
      </div>

      {/* Status / Actions */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        {(variant === 'overdue' || variant === 'due') && (
          <div className="flex gap-2">
            <button
              onClick={onTake} disabled={isPending}
              className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold px-5 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              ✓ TAKEN
            </button>
            <button
              onClick={onSnooze} disabled={isPending}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-lg border-2 border-gray-300 text-sm disabled:opacity-50 transition-colors"
            >
              ⏰ +30 min
            </button>
          </div>
        )}
        {variant === 'completed' && (
          <span className="text-sm text-[#2e7d32] font-semibold flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {schedule.takenAt ? `Taken ${format(new Date(schedule.takenAt), 'h:mm a')}` : 'Taken'}
          </span>
        )}
        {variant === 'upcoming' && (
          <span className="text-xs text-gray-400">Scheduled</span>
        )}
        {schedule.whatsappReminderSent && variant !== 'completed' && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> Reminder sent
          </span>
        )}
      </div>
    </div>
  );
}
