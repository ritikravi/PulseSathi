import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, CheckCheck } from 'lucide-react';
import { whatsapp, medicines } from '../lib/api';
import { format } from 'date-fns';

export default function WhatsAppDemoSimulator() {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
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
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['medicines-today'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Add incoming reply to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'incoming',
          text: vars.response === 'TAKEN' ? '✅ हाँ, ले ली' : '⏰ नहीं, अभी नहीं',
          time: format(new Date(), 'h:mm a'),
        },
        {
          id: Date.now() + 1,
          type: 'outgoing',
          text: vars.response === 'TAKEN'
            ? 'धन्यवाद Suresh जी 🙏\nआपका जवाब दर्ज हो गया है।\nदवाई लेने के लिए शुक्रिया!'
            : 'ठीक है Suresh जी! 30 मिनट में दोबारा याद दिलाएंगे। 🔔',
          time: format(new Date(), 'h:mm a'),
          isAck: true,
        },
      ]);
    },
  });

  const pendingSchedules = [
    ...(todayData?.overdue || []),
    ...(todayData?.dueNow || []),
  ].filter((s: any) => s.status !== 'taken');

  const sendReminder = (schedule: any) => {
    const med = schedule.medicineId;
    const time = format(new Date(schedule.scheduledFor), 'h:mm a');
    const food = schedule.beforeAfterFood === 'before' ? '☕ खाने से पहले' :
                 schedule.beforeAfterFood === 'after' ? '🍽️ खाने के बाद' : '⏰ कभी भी';

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'outgoing',
        text: `नमस्ते Suresh जी 🙏\n\nआपकी दवाई का समय हो गया है।\n\n💊 ${med?.name} ${med?.dosage}\n🕐 ${time}\n${food}\n\nक्या आपने दवाई ले ली है?`,
        time: format(new Date(), 'h:mm a'),
        buttons: [
          { label: '✅ हाँ, ले ली', response: 'TAKEN', scheduleId: schedule._id },
          { label: '⏰ नहीं, अभी नहीं', response: 'NOT_TAKEN_YET', scheduleId: schedule._id },
        ],
      },
    ]);
  };

  return (
    <div className="border-2 border-amber-300 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-amber-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">W</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-900">WhatsApp Demo Simulator</p>
            <p className="text-xs text-amber-700">⚠️ DEMO MODE — No real messages sent</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {expanded && (
        <div className="flex flex-col">
          {/* WhatsApp chat UI */}
          <div className="bg-[#0b141a] px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">S</div>
            <div>
              <p className="text-white text-sm font-medium">PulseSathi 💊</p>
              <p className="text-green-400 text-xs">Medication Reminder</p>
            </div>
          </div>

          {/* Chat messages */}
          <div
            className="bg-[#e5ddd5] p-4 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c8bdb1\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-xs py-8">
                Click "Send Reminder" below to simulate a WhatsApp message
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-lg px-3 py-2 shadow-sm ${
                  msg.type === 'outgoing' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
                }`}>
                  {msg.type === 'outgoing' && msg.isAck && (
                    <p className="text-[10px] text-[#25D366] font-semibold mb-1">PulseSathi ✓</p>
                  )}
                  {msg.type === 'incoming' && (
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Suresh Kumar</p>
                  )}
                  <p className="text-sm text-gray-900 whitespace-pre-line">{msg.text}</p>

                  {/* Interactive buttons */}
                  {msg.buttons && (
                    <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
                      {msg.buttons.map((btn: any) => (
                        <button
                          key={btn.label}
                          onClick={() => simulateMutation.mutate({ scheduleId: btn.scheduleId, response: btn.response })}
                          disabled={simulateMutation.isPending}
                          className="w-full text-center text-sm text-[#00a884] font-semibold py-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                    {msg.type === 'outgoing' && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Send reminder buttons */}
          <div className="bg-white border-t border-gray-200 p-3">
            {pendingSchedules.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">No pending doses to simulate</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 mb-2">Send WhatsApp reminder for:</p>
                {pendingSchedules.map((s: any) => (
                  <button
                    key={s._id}
                    onClick={() => sendReminder(s)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-[#25D366] hover:bg-[#1da355] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <span>📱 Send reminder: {s.medicineId?.name}</span>
                    <span className="text-xs opacity-80">{format(new Date(s.scheduledFor), 'h:mm a')}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-[10px] text-amber-600 text-center mt-2">
              ⚠️ Simulated only. Real WhatsApp pending business verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
