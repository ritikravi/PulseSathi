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

      {/* ── Top utility bar (full width) ─────────────────────────────── */}
      <div className="bg-[#1a3a1a] text-white text-xs py-1 flex justify-between items-center px-4">
        <span>🇮🇳 PulseSathi — पल्ससाथी | Medication Adherence System</span>
        <span className="hidden sm:block text-green-300 capitalize">
          {user?.role}
        </span>
      </div>

      {/* ── Header (full width, no max-w) ────────────────────────────── */}
      <header className="bg-white border-b-4 border-[#2e7d32] shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#2e7d32] hover:bg-green-50 rounded flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="w-10 h-10 bg-[#2e7d32] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl">💊</span>
          </div>

          {/* Brand */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[#2e7d32] leading-tight">PulseSathi</h1>
            <p className="text-xs text-gray-500 leading-tight hidden sm:block">दवाई अनुपालन प्रबंधन</p>
          </div>

          {/* User info + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <NotificationBell />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize leading-tight">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Green nav bar (full width, desktop) ──────────────────────── */}
      <nav className="bg-[#2e7d32] text-white text-xs hidden lg:flex sticky top-[65px] z-30">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-1.5 px-5 py-3 border-r border-[#388e3c] last:border-0 whitespace-nowrap transition-colors ${
                isActive ? 'bg-[#1b5e20] font-bold' : 'hover:bg-[#1b5e20]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile nav overlay ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav className="absolute left-0 top-0 w-64 bg-white shadow-xl h-full overflow-y-auto">
            <div className="bg-[#2e7d32] px-4 py-4 text-white">
              <p className="font-bold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-green-200 capitalize">{user?.role}</p>
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
                    isActive ? 'bg-green-50 text-[#2e7d32] font-bold' : 'text-gray-700 hover:bg-green-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-4 text-sm text-red-600 hover:bg-red-50 w-full border-t border-gray-200"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </nav>
        </div>
      )}

      {/* ── Main content (full width, small padding) ─────────────────── */}
      <main className="flex-1 w-full p-4">
        <Outlet />
      </main>

      {/* ── Footer (full width) ──────────────────────────────────────── */}
      <footer className="bg-[#1a3a1a] text-green-300 text-xs py-3 px-4 text-center">
        PulseSathi — पल्ससाथी &nbsp;|&nbsp; Medication Adherence Management &nbsp;|&nbsp; CaseBlitz 2026 &nbsp;|&nbsp;
        <span className="text-green-400">Demo Mode Active</span>
      </footer>
    </div>
  );
}
