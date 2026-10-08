import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Check, X, Clock, Bell, Shield, ChevronRight } from 'lucide-react';
import { whatsapp } from '../lib/api';

export default function WhatsAppSettingsPage() {
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [prefs, setPrefs] = useState({
    doseReminders: true,
    adherenceAlerts: true,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    reminderLeadTimeMinutes: 15,
  });

  const { data: consentData, isLoading } = useQuery({
    queryKey: ['whatsapp-consent'],
    queryFn: async () => {
      const r = await whatsapp.getConsent();
      return r.data.data;
    },
    onSuccess: (data: any) => {
      if (data?.hasConsent) {
        setPhone(data.whatsappPhone || '');
        if (data.communicationPreferences) {
          setPrefs(p => ({ ...p, ...data.communicationPreferences }));
        }
      }
    },
  } as any);

  const { data: statusData } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const r = await whatsapp.getStatus();
      return r.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => whatsapp.saveConsent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-consent'] });
      setShowForm(false);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () => whatsapp.revokeConsent('User disabled reminders'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-consent'] });
    },
  });

  const prefMutation = useMutation({
    mutationFn: (data: any) => whatsapp.updatePreferences({ communicationPreferences: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-consent'] });
    },
  });

  const isDemo = statusData?.isDemo !== false;
  const hasActiveConsent = consentData?.hasConsent && consentData?.isActive;

  const handleSave = () => {
    if (!phone.trim()) return;
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    saveMutation.mutate({
      whatsappPhone: formatted,
      consentGiven: true,
      communicationPreferences: prefs,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl">
      {/* Demo mode banner */}
      {isDemo && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4">
          <span className="text-amber-500 text-xl mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold text-amber-900 text-sm">DEMO MODE</p>
            <p className="text-amber-800 text-xs mt-0.5">
              No real WhatsApp messages are sent. All reminders are simulated. Set{' '}
              <code className="bg-amber-100 px-1 rounded">WHATSAPP_MODE=production</code> and
              configure Meta credentials to enable real messaging.
            </p>
          </div>
        </div>
      )}

      {/* Status card */}
      <div className={`rounded-2xl p-5 ${hasActiveConsent ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${hasActiveConsent ? 'bg-green-100' : 'bg-gray-100'}`}>
              <MessageCircle className={`w-6 h-6 ${hasActiveConsent ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-bold text-gray-900">WhatsApp Reminders</p>
              <p className="text-sm text-gray-600">
                {hasActiveConsent
                  ? `Connected: ${consentData.whatsappPhone}`
                  : 'Not connected yet'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            hasActiveConsent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {hasActiveConsent ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Enable / setup form */}
      {!hasActiveConsent ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Enable WhatsApp Reminders</h2>
            <p className="text-sm text-gray-600 mt-1">
              Receive medicine reminders on WhatsApp. Reply with one tap to confirm.
            </p>
          </div>

          <div className="p-5 space-y-4">
            {/* How it works */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">How it works</p>
              {[
                { icon: '💊', text: 'Medicine is due → WhatsApp message arrives' },
                { icon: '✅', text: 'Tap "हाँ, ले ली" to confirm taken' },
                { icon: '⏰', text: 'Tap "नहीं, अभी नहीं" for 30-min followup' },
                { icon: '📊', text: 'Dashboard updates automatically' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                WhatsApp Phone Number
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone.startsWith('+91') ? phone.slice(3) : phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">The WhatsApp number where reminders will be sent</p>
            </div>

            {/* Quiet hours */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 text-sm">Quiet Hours</p>
                <p className="text-xs text-gray-500">No messages during sleep time</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.quietHoursEnabled}
                  onChange={(e) => setPrefs(p => ({ ...p, quietHoursEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
            {prefs.quietHoursEnabled && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                  <input
                    type="time"
                    value={prefs.quietHoursStart}
                    onChange={(e) => setPrefs(p => ({ ...p, quietHoursStart: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                  <input
                    type="time"
                    value={prefs.quietHoursEnd}
                    onChange={(e) => setPrefs(p => ({ ...p, quietHoursEnd: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}

            {/* Consent checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 rounded" />
              <p className="text-sm text-gray-600">
                I consent to receive WhatsApp reminders for my medicines. I can disable this anytime.
              </p>
            </label>

            <button
              onClick={handleSave}
              disabled={!phone.trim() || saveMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl text-base disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {saveMutation.isPending ? 'Enabling...' : 'Enable WhatsApp Reminders'}
            </button>
          </div>
        </div>
      ) : (
        /* Settings for existing consent */
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Reminder Preferences</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Dose reminders toggle */}
            <PrefRow
              label="Dose Reminders"
              desc="Get reminded when medicine is due"
              icon={<Bell className="w-5 h-5 text-primary-600" />}
              checked={prefs.doseReminders}
              onChange={(v) => {
                const updated = { ...prefs, doseReminders: v };
                setPrefs(updated);
                prefMutation.mutate(updated);
              }}
            />

            {/* Adherence alerts */}
            <PrefRow
              label="Adherence Alerts"
              desc="Get alerted when adherence drops"
              icon={<Shield className="w-5 h-5 text-warning-600" />}
              checked={prefs.adherenceAlerts}
              onChange={(v) => {
                const updated = { ...prefs, adherenceAlerts: v };
                setPrefs(updated);
                prefMutation.mutate(updated);
              }}
            />

            {/* Quiet hours */}
            <PrefRow
              label="Quiet Hours"
              desc={`No messages ${prefs.quietHoursStart}–${prefs.quietHoursEnd}`}
              icon={<Clock className="w-5 h-5 text-gray-500" />}
              checked={prefs.quietHoursEnabled}
              onChange={(v) => {
                const updated = { ...prefs, quietHoursEnabled: v };
                setPrefs(updated);
                prefMutation.mutate(updated);
              }}
            />
          </div>

          {/* Lead time */}
          <div className="p-5 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remind me before scheduled time
            </label>
            <select
              value={prefs.reminderLeadTimeMinutes}
              onChange={(e) => {
                const updated = { ...prefs, reminderLeadTimeMinutes: parseInt(e.target.value) };
                setPrefs(updated);
                prefMutation.mutate(updated);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value={0}>At scheduled time</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
            </select>
          </div>

          {/* Revoke */}
          <div className="p-5 border-t border-gray-100">
            <button
              onClick={() => revokeMutation.mutate()}
              disabled={revokeMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              {revokeMutation.isPending ? 'Disabling...' : 'Disable WhatsApp Reminders'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PrefRow({ label, desc, icon, checked, onChange }: {
  label: string; desc: string; icon: React.ReactNode;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-medium text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
      </label>
    </div>
  );
}
