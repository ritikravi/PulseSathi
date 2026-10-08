import { useState } from 'react';
import { User, MessageCircle, Pill, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import WhatsAppSettingsPage from './WhatsAppSettingsPage';

type Tab = 'profile' | 'whatsapp' | 'medicines';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'medicines', label: 'Medicines', icon: <Pill className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="Language" value="हिन्दी (Hindi)" />
              <InfoRow label="Timezone" value="Asia/Kolkata (IST)" />
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <QuickLink
              icon={<MessageCircle className="w-5 h-5 text-green-600" />}
              label="WhatsApp Reminders"
              desc="Setup medicine reminders"
              onClick={() => setTab('whatsapp')}
            />
            <QuickLink
              icon={<Pill className="w-5 h-5 text-primary-600" />}
              label="My Medicines"
              desc="View and manage medicines"
              onClick={() => setTab('medicines')}
              noBorder
            />
          </div>
        </div>
      )}

      {/* WhatsApp tab */}
      {tab === 'whatsapp' && <WhatsAppSettingsPage />}

      {/* Medicines tab */}
      {tab === 'medicines' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">Manage Medicines</p>
          <p className="text-sm text-gray-600 mt-1">Use the Today view to manage your doses</p>
          <a
            href="/setup-medicines"
            className="mt-4 inline-block bg-primary-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
          >
            Add / Edit Medicines
          </a>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
    </div>
  );
}

function QuickLink({ icon, label, desc, onClick, noBorder = false }: {
  icon: React.ReactNode; label: string; desc: string;
  onClick: () => void; noBorder?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${!noBorder ? 'border-b border-gray-100' : ''}`}
    >
      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}
