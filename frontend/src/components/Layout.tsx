import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, History, User, LogOut, Menu, X, Pill, MessageCircle, Users, Stethoscope } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientNav = [
    { name: 'Today / आज', href: '/today', icon: Pill },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Patterns', href: '/patterns', icon: BarChart3 },
    { name: 'History', href: '/history', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ];
  const clinicianNav = [
    { name: 'Patients', href: '/clinician', icon: Stethoscope },
    { name: 'Profile', href: '/profile', icon: User },
  ];
  const caregiverNav = [
    { name: 'Care Dashboard', href: '/caregiver', icon: Users },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const navigation =
    user?.role === 'clinician' ? clinicianNav :
    user?.role === 'caregiver' ? caregiverNav :
    patientNav;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top utility bar ──────────────────────────────────────────── */}
      <div className="bg-[#1a3a1a] text-white text-xs py-1 px-4 flex justify-between items-center">
        <span>🇮🇳 PulseSathi — पल्ससाथी | Medication Adherence System</span>
        <span className="hidden sm:block text-green-300">
          {user?.firstName} {user?.lastName} · <span className="capitalize">{user?.role}</span>
        </span>
      </div>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="bg-white border-b-4 border-[#2e7d32] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#2e7d32] hover:bg-green-50 rounded"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="w-10 h-10 bg-[#2e7d32] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl">💊</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#2e7d32]">PulseSathi</h1>
            <p className="text-xs text-gray-500 hidden sm:block">दवाई अनुपालन प्रबंधन</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-[#2e7d32] hover:bg-green-50 rounded transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Green nav bar (desktop) ───────────────────────────────────── */}
      <nav className="bg-[#2e7d32] text-white text-xs hidden lg:block sticky top-[69px] z-30">
        <div className="max-w-7xl mx-auto px-4 flex">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-1.5 px-4 py-3 border-r border-[#388e3c] last:border-0 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1b5e20] font-bold border-b-2 border-white'
                    : 'hover:bg-[#1b5e20]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile nav overlay ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <nav className="absolute left-0 top-[116px] w-64 bg-white shadow-xl overflow-y-auto max-h-[80vh]">
            <div className="bg-[#2e7d32] px-4 py-3 text-white text-sm font-semibold">
              {user?.firstName} {user?.lastName}
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-4 border-b border-gray-100 text-sm ${
                    isActive
                      ? 'bg-green-50 text-[#2e7d32] font-bold'
                      : 'text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-4 text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </nav>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-[#1a3a1a] text-green-300 text-xs py-3 px-4 text-center mt-auto">
        PulseSathi — पल्ससाथी | Medication Adherence Management | CaseBlitz 2026 |
        <span className="text-green-400"> Demo Mode Active</span>
      </footer>
    </div>
  );
}
