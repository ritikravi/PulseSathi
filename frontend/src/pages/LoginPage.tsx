import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const DEMO_USERS = [
  { label: 'रोगी (Patient) - Suresh Kumar', email: 'suresh@demo.pulsesathi.in', password: 'Demo@1234', role: 'patient' },
  { label: 'परिवार (Caregiver) - Rahul Kumar', email: 'rahul@demo.pulsesathi.in', password: 'Demo@1234', role: 'caregiver' },
  { label: 'चिकित्सक (Clinician) - Dr. Priya Sharma', email: 'doctor@demo.pulsesathi.in', password: 'Demo@1234', role: 'clinician' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await auth.login(email, password);
      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (u: typeof DEMO_USERS[0]) => {
    setEmail(u.email);
    setPassword(u.password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top utility bar ───────────────────────────────────────────── */}
      <div className="bg-[#1a3a1a] text-white text-xs py-1.5 px-4 flex justify-between items-center">
        <span>🇮🇳 भारत सरकार की पहल | Government of India Initiative</span>
        <div className="flex gap-3">
          <button className="hover:underline">English</button>
          <span>|</span>
          <button className="hover:underline">हिंदी</button>
        </div>
      </div>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="bg-white border-b-4 border-[#2e7d32] shadow-sm">
        <div className="px-6 py-4 flex items-center gap-6">
          {/* Logo */}
          <div className="w-16 h-16 bg-[#2e7d32] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-3xl">💊</span>
          </div>

          {/* Unified brand block */}
          <div className="flex-1 hidden sm:flex flex-col justify-center">
            {/* Top row: PulseSathi — Medication Adherence Management System */}
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-extrabold text-[#2e7d32] tracking-wide whitespace-nowrap">
                PulseSathi
              </h1>
              <span className="text-2xl font-bold text-gray-400">—</span>
              <p className="text-3xl font-extrabold text-[#2e7d32] leading-tight">
                Medication Adherence Management System
              </p>
            </div>
            {/* Bottom row: Hindi + tagline */}
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">पल्ससाथी</span> — दवाई अनुपालन प्रबंधन प्रणाली &nbsp;·&nbsp; AI-Powered WhatsApp Reminders for Type 2 Diabetes
            </p>
          </div>

          {/* Mobile: stacked */}
          <div className="flex-1 sm:hidden">
            <h1 className="text-2xl font-extrabold text-[#2e7d32]">PulseSathi</h1>
            <p className="text-xs text-gray-600">पल्ससाथी — दवाई अनुपालन प्रबंधन प्रणाली</p>
          </div>

          <div className="ml-auto text-right hidden sm:block flex-shrink-0">
            <div className="text-xs text-gray-500">Powered by</div>
            <div className="font-bold text-[#2e7d32] text-sm">CaseBlitz 2026</div>
          </div>
        </div>
      </header>

      {/* ── Green nav bar ────────────────────────────────────────────── */}
      <nav className="bg-[#2e7d32] text-white text-sm">
        <div className="px-0 flex gap-0 overflow-x-auto">
          {['🏠 Home', '📋 About', '💊 Medicines', '📊 Adherence', '👨‍👩‍👦 Caregiver', '🩺 Clinician', '📞 Contact'].map((item) => (
            <button
              key={item}
              className="px-5 py-3 hover:bg-[#1b5e20] whitespace-nowrap border-r border-[#388e3c] last:border-0 text-xs sm:text-sm"
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-[#1b5e20] via-[#2e7d32] to-[#388e3c] text-white py-16 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="relative px-4">
          <p className="text-green-200 text-sm mb-2 tracking-widest uppercase">
            📱 WhatsApp-Based Medication Reminder System
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold mb-3 leading-tight">
            नमस्ते! स्वस्थ रहिए 🙏
          </h2>
          <p className="text-xl sm:text-2xl font-light mb-2">Welcome to PulseSathi</p>
          <p className="text-green-200 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            टाइप 2 मधुमेह रोगियों के लिए व्हाट्सएप-आधारित दवाई अनुस्मारक प्रणाली
          </p>
          <button
            onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-[#2e7d32] font-bold px-8 py-3 rounded hover:bg-green-50 transition-colors text-sm uppercase tracking-wide shadow-lg"
          >
            लॉगिन करें / Login
          </button>
        </div>
      </div>

      {/* ── Alert marquee ────────────────────────────────────────────── */}
      <div className="bg-[#fff3e0] border-y border-orange-300 flex items-center overflow-hidden">
        <span className="bg-[#e65100] text-white text-xs font-bold px-3 py-2 flex-shrink-0">
          ⚠ Alert
        </span>
        <div className="overflow-hidden flex-1 py-2">
          <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap text-sm text-[#b71c1c] font-medium inline-block">
            📱 &nbsp; PulseSathi WhatsApp Demo Mode Active — Simulated reminders being sent &nbsp;&nbsp;&nbsp;
            💊 &nbsp; Suresh Kumar (Kanpur) — Glipizide (5mg) adherence at 62% — High Risk Alert &nbsp;&nbsp;&nbsp;
            🩺 &nbsp; New pattern: Evening dose consistently missed on weekdays
          </div>
        </div>
      </div>

      {/* ── Feature cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-b border-gray-200">
        {[
          {
            icon: '📱', title: 'WhatsApp Reminders', hindi: 'व्हाट्सएप अनुस्मारक',
            desc: 'Receive medicine reminders on WhatsApp. Reply हाँ/नहीं to confirm.',
            color: 'border-[#2e7d32]', bg: 'bg-green-50',
          },
          {
            icon: '📊', title: 'Adherence Tracking', hindi: 'अनुपालन ट्रैकिंग',
            desc: 'Track per-medicine PDC scores. Identify which medicine is missed.',
            color: 'border-blue-600', bg: 'bg-blue-50',
          },
          {
            icon: '👨‍👩‍👦', title: 'Family Support', hindi: 'परिवार का सहयोग',
            desc: 'Son in Pune gets alerts when patient misses medicines. Consent-based.',
            color: 'border-orange-500', bg: 'bg-orange-50',
          },
        ].map((card, i) => (
          <div key={card.title} className={`bg-white border-t-4 ${card.color} p-6 hover:bg-gray-50 transition-colors ${i < 2 ? 'border-r border-gray-200' : ''}`}>
            <div className="text-4xl mb-3">{card.icon}</div>
            <h3 className="font-bold text-gray-900 text-lg">{card.title}</h3>
            <p className="text-[#2e7d32] text-sm font-medium mb-2">{card.hindi}</p>
            <p className="text-gray-600 text-sm">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column: demo info + login ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" id="login-section">

        {/* Left: Patient profile + WhatsApp preview */}
        <div className="border-r border-gray-200">
          {/* Patient profile block */}
          <div className="border-b border-gray-200">
            <div className="bg-[#2e7d32] text-white px-6 py-3 font-bold flex items-center gap-2 text-sm">
              <span>👤</span> Demo Patient Profile
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">👴</div>
                <div>
                  <p className="font-bold text-gray-900">Suresh Kumar</p>
                  <p className="text-sm text-gray-600">Age 56 · Kanpur, UP · Type 2 Diabetes (8 years)</p>
                  <p className="text-xs text-gray-500 mt-0.5">📱 WhatsApp active · Hindi preferred</p>
                </div>
              </div>
              {[
                { name: 'Metformin 500mg', time: '8 AM & 8 PM', pdc: 95, color: 'bg-green-500', ok: true },
                { name: 'Glimepiride 2mg', time: '8 AM (before food)', pdc: 90, color: 'bg-green-400', ok: true },
                { name: 'Glipizide 5mg ⚠️', time: '8 PM (after food)', pdc: 62, color: 'bg-red-500', ok: false },
              ].map((med) => (
                <div key={med.name} className={`p-3 rounded ${!med.ok ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-900">{med.ok ? '✅ ' : '❌ '}{med.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${!med.ok ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {med.pdc}% PDC
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div className={`${med.color} h-1.5 rounded-full`} style={{ width: `${med.pdc}%` }} />
                  </div>
                  <p className="text-xs text-gray-500">{med.time}</p>
                </div>
              ))}
              <div className="pt-2 flex items-center gap-2 text-xs text-gray-600 border-t">
                <span>👨‍💻</span>
                <span><strong>Rahul Kumar</strong> (son, Pune) — Caregiver with consent</span>
              </div>
            </div>
          </div>

          {/* WhatsApp preview */}
          <div>
            <div className="bg-[#075E54] text-white px-6 py-3 font-bold flex items-center gap-2 text-sm">
              <span>💬</span> WhatsApp Flow Preview
            </div>
            <div className="p-6 bg-[#e5ddd5] space-y-3">
              <div className="flex justify-end">
                <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none px-4 py-2 max-w-sm shadow-sm text-sm">
                  <p className="font-semibold text-gray-800 text-xs mb-1">PulseSathi 💊</p>
                  <p className="text-gray-800">नमस्ते Suresh जी 🙏<br />आपकी दवाई का समय हो गया है।<br /><br />💊 <strong>Glipizide 5mg</strong><br />🕐 8:00 PM · 🍽️ खाने के बाद<br /><br />क्या आपने दवाई ले ली है?</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-[#2e7d32] text-white text-xs px-3 py-1 rounded-full">✅ हाँ, ले ली</span>
                    <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full">⏰ नहीं, अभी नहीं</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-tl-none px-4 py-2 max-w-xs shadow-sm text-sm">
                  <p className="text-xs text-gray-500 mb-1">Suresh Kumar</p>
                  <p>✅ हाँ, ले ली</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none px-4 py-2 max-w-xs shadow-sm text-sm">
                  <p className="text-gray-800">धन्यवाद Suresh जी 🙏<br />आपका जवाब दर्ज हो गया है।</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login form */}
        <div>
          <div className="bg-[#2e7d32] text-white px-6 py-3 font-bold flex items-center gap-2 text-sm">
            <span>🔐</span> लॉगिन करें / User Login
          </div>
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email / ईमेल</label>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password / पासवर्ड</label>
                <input
                  type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-sm"
                  required
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold py-3 rounded transition-colors disabled:opacity-50 text-sm uppercase tracking-wide"
              >
                {loading ? 'Logging in...' : '🔐 Login / प्रवेश करें'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Demo Quick Login</p>
              <div className="space-y-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email} onClick={() => quickLogin(u)}
                    className={`w-full text-left px-3 py-2.5 rounded border text-xs transition-colors ${
                      email === u.email ? 'border-[#2e7d32] bg-green-50 text-[#2e7d32] font-semibold' : 'border-gray-200 hover:border-[#2e7d32] hover:bg-green-50'
                    }`}
                  >
                    <span className="font-medium">{u.label}</span>
                    <span className="block text-gray-400 mt-0.5">{u.email}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Password: <code className="bg-gray-100 px-1 rounded">Demo@1234</code>
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {[
                { value: '3', label: 'Medicines', sub: 'दवाइयाँ' },
                { value: '30', label: 'Days Data', sub: 'दिन' },
                { value: '62%', label: 'Glipizide', sub: '⚠️ High Risk' },
                { value: 'Mock', label: 'WhatsApp', sub: 'Demo' },
              ].map((s, i) => (
                <div key={s.label} className={`p-4 text-center ${i < 3 ? 'border-r border-gray-200' : ''}`}>
                  <p className="text-2xl font-bold text-[#2e7d32]">{s.value}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-[#1a3a1a] text-green-200 py-6 px-6 text-center text-xs">
        <p className="text-white font-semibold mb-1">PulseSathi — पल्ससाथी</p>
        <p>Medication Adherence Management System for Type 2 Diabetes | CaseBlitz 2026</p>
        <p className="mt-2 text-green-500">⚠️ Demo system. Not for clinical use without medical supervision.</p>
      </footer>
    </div>
  );
}
