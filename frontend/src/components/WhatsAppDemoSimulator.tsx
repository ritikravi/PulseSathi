import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Play, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { whatsapp, medicines } from '../lib/api';

export default function WhatsAppDemoSimulator() {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const { data: todayData } = useQuery({
    queryKey: ['medicines-today'],
    queryFn: async () => {
      const r = await medicines.getTodaySchedule();
      return r.data.data;
    },
  });

  const simulateMutation = useMutation({
    mutationFn: ({ scheduleId, response }: { scheduleId: string; response: 'TAKEN' | 'NOT_TAKEN_YET' }) =>
      whatsapp.simulateResponse(scheduleId, response),
    onSuccess: () => {
      // Refresh dashboard after simulated response
      queryClient.invalidateQueries({ queryKey: ['medicines-today'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const pendingSchedules = [
    ...(todayData?.overdue || []),
    ...(todayData?.dueNow || []),
    ...(todayData?.upcoming || []).slice(0, 2),
  ];

  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-amber-900 text-sm">WhatsApp Demo Simulator</p>
            <p className="text-xs text-amber-700">Simulate patient WhatsApp replies</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">DEMO</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-amber-700" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-amber-200 p-4 space-y-3">
          <p className="text-xs text-amber-800">
            In production, the patient would receive a WhatsApp message and reply on their phone.
            Click below to simulate that reply:
          </p>

          {pendingSchedules.length === 0 ? (
            <p className="text-sm text-amber-700 text-center py-2">No pending doses to simulate</p>
          ) : (
            pendingSchedules.map((schedule: any) => (
              <SimulatorRow
                key={schedule._id}
                schedule={schedule}
                onSimulate={(response) =>
                  simulateMutation.mutate({ scheduleId: schedule._id, response })
                }
                isLoading={simulateMutation.isPending}
              />
            ))
          )}

          <div className="pt-2 border-t border-amber-200">
            <p className="text-xs text-amber-600 text-center">
              ⚠️ These are simulated responses only. No real WhatsApp messages are sent.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SimulatorRow({ schedule, onSimulate, isLoading }: {
  schedule: any;
  onSimulate: (r: 'TAKEN' | 'NOT_TAKEN_YET') => void;
  isLoading: boolean;
}) {
  const medicine = schedule.medicineId;
  const isCompleted = schedule.status === 'taken';

  if (isCompleted) return null;

  return (
    <div className="bg-white rounded-xl p-3 border border-amber-200">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold text-sm text-gray-900">{medicine?.name || 'Medicine'}</p>
          <p className="text-xs text-gray-500">{medicine?.dosage} · {schedule.scheduledTime}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          schedule.status === 'snoozed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
        }`}>
          {schedule.status}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSimulate('TAKEN')}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          हाँ, ले ली
        </button>
        <button
          onClick={() => onSimulate('NOT_TAKEN_YET')}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Clock className="w-3.5 h-3.5" />
          नहीं, अभी नहीं
        </button>
      </div>
    </div>
  );
}
