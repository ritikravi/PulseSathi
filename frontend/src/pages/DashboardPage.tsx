import { useQuery } from '@tanstack/react-query';
import { adherence, whatsapp } from '../lib/api';
import { Link } from 'react-router-dom';
import { MessageCircle, AlertTriangle, CheckCircle, TrendingDown, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { data: overview } = useQuery({
    queryKey: ['adherence-overview'],
    queryFn: async () => {
      const r = await adherence.getOverview();
      return r.data.data;
    },
  });

  const { data: risks } = useQuery({
    queryKey: ['adherence-risks'],
    queryFn: async () => {
      const r = await adherence.getRisks();
      return r.data.data;
    },
  });

  const { data: waStatus } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const r = await whatsapp.getStatus();
      return r.data.data;
    },
  });

  const overallPDC = overview?.overallAdherence || 0;
  const meds = overview?.medicineDetails || [];
  const highRisk = risks?.filter((r: any) => r.riskLevel === 'high' || r.riskLevel === 'critical') || [];

  return (
    <div className="space-y-4 pb-6">

      {/* ── Demo banner ──────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="text-amber-600 text-lg">🎭</span>
        <div>
          <p className="text-sm font-bold text-amber-900">CaseBlitz 2026 — Demo Mode</p>
          <p className="text-xs text-amber-700">
            Showing synthetic data for Suresh Kumar, 56, Kanpur · Type 2 Diabetes, 8 years
          </p>
        </div>
      </div>

      {/* ── Overall PDC ──────────────────────────────────────────────── */}
      <div className="border-2 border-[#2e7d32] rounded-lg overflow-hidden">
        <div className="bg-[#2e7d32] px-5 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold">📊 Overall Medication Adherence (30-day PDC)</h2>
          <span className="text-green-200 text-xs">Proportion of Days Covered</span>
        </div>
        <div className="p-5 bg-white">
          <div className="flex items-center gap-6">
            {/* Big PDC number */}
            <div className="text-center">
              <p className={`text-6xl font-extrabold ${overallPDC >= 80 ? 'text-[#2e7d32]' : overallPDC >= 60 ? 'text-amber-500' : 'text-red-600'}`}>
                {overallPDC}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Overall PDC</p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${overallPDC >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {overallPDC >= 80 ? '✅ Good' : '⚠️ Needs Attention'}
              </span>
            </div>

            {/* Medicine bars */}
            <div className="flex-1 space-y-3">
              {meds.map((med: any) => (
                <div key={med.medicineId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {med.isProblematic ? '⚠️ ' : '✅ '}{med.name} {med.dosage}
                    </span>
                    <span className={`text-sm font-bold ${med.adherenceScore >= 80 ? 'text-[#2e7d32]' : med.adherenceScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {med.adherenceScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${med.adherenceScore >= 80 ? 'bg-[#2e7d32]' : med.adherenceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${med.adherenceScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Risk Alert + WhatsApp side by side ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Risk alert */}
        <div className="border-2 border-red-500 rounded-lg overflow-hidden">
          <div className="bg-red-600 px-5 py-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold">🚨 High Risk Alerts</h2>
          </div>
          <div className="bg-white divide-y">
            {highRisk.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-sm">No high-risk alerts</p>
              </div>
            ) : highRisk.map((r: any) => (
              <div key={r._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-red-700">{r.medicineId?.name || 'Medicine'}</p>
                    <p className="text-sm text-gray-600 mt-0.5">Risk Score: <strong>{r.riskScore}/100</strong></p>
                  </div>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full uppercase">
                    {r.riskLevel}
                  </span>
                </div>
                {r.factors?.slice(0, 2).map((f: any, i: number) => (
                  <p key={i} className="text-xs text-gray-500 mt-1">• {f.description}</p>
                ))}
                {r.recommendedIntervention && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded px-3 py-1.5 text-xs text-red-800">
                    💡 <strong>Action:</strong> {r.recommendedIntervention.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp status */}
        <div className="border-2 border-[#25D366] rounded-lg overflow-hidden">
          <div className="bg-[#075E54] px-5 py-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-white" />
            <h2 className="text-white font-bold">📱 WhatsApp Integration Status</h2>
          </div>
          <div className="bg-white p-4 space-y-3">
            {/* Flow diagram */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {[
                { label: 'Dose Due', color: 'bg-blue-100 text-blue-700' },
                { label: '→' , color: 'bg-transparent text-gray-400' },
                { label: 'WA Reminder', color: 'bg-green-100 text-[#075E54]' },
                { label: '→', color: 'bg-transparent text-gray-400' },
                { label: 'Patient Reply', color: 'bg-[#dcf8c6] text-gray-700' },
                { label: '→', color: 'bg-transparent text-gray-400' },
                { label: 'Dashboard ✓', color: 'bg-[#2e7d32] text-white' },
              ].map((s, i) => (
                <span key={i} className={`px-2 py-1 rounded font-semibold ${s.color}`}>{s.label}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-bold text-amber-600">⚠️ {waStatus?.mode === 'mock' ? 'Demo Mode' : 'Production'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Messages</p>
                <p className="font-bold text-[#2e7d32]">98 free left</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Reminder sent</p>
                <p className="font-bold text-gray-700">Every 60s check</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Max reminders</p>
                <p className="font-bold text-gray-700">2 per dose</p>
              </div>
            </div>

            <div className="bg-[#e5ddd5] rounded-lg p-3 text-sm">
              <p className="text-xs font-bold text-gray-600 mb-2">Sample WhatsApp message:</p>
              <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-2 text-xs ml-4">
                नमस्ते Suresh जी 🙏<br/>
                💊 Glipizide 5mg · 8:00 PM<br/>
                🍽️ खाने के बाद<br/>
                <strong>Reply: 1=ले ली, 2=अभी नहीं</strong>
              </div>
            </div>

            <Link to="/whatsapp" className="flex items-center justify-between bg-[#2e7d32] text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-[#1b5e20] transition-colors">
              <span>View WhatsApp Message History</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Patient story ────────────────────────────────────────────── */}
      <div className="border-2 border-[#2e7d32] rounded-lg overflow-hidden">
        <div className="bg-[#2e7d32] px-5 py-3">
          <h2 className="text-white font-bold">👤 Patient Persona — Suresh Kumar</h2>
        </div>
        <div className="p-5 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">👴</span>
              <div>
                <p className="font-bold text-gray-900">Suresh Kumar, 56</p>
                <p className="text-xs text-gray-600">Retired railway clerk, Kanpur</p>
                <p className="text-xs text-gray-600">T2 Diabetes for 8 years</p>
                <p className="text-xs text-[#2e7d32] font-medium mt-1">WhatsApp + YouTube user</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-700">The Problem</p>
                <p className="text-xs text-gray-600">Frequently forgets <strong>Glipizide (evening)</strong></p>
                <p className="text-xs text-gray-600">3 consecutive misses</p>
                <p className="text-xs text-red-600 font-medium mt-1">PDC dropped to 62%</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-2xl">👨‍💻</span>
              <div>
                <p className="font-bold text-[#2e7d32]">Caregiver: Rahul (Son)</p>
                <p className="text-xs text-gray-600">Lives in Pune</p>
                <p className="text-xs text-gray-600">Books appointments & orders medicines</p>
                <p className="text-xs text-[#2e7d32] font-medium mt-1">Gets alerts with consent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick links ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Today's Medicines", href: '/today', icon: '💊', desc: 'Mark doses taken' },
          { label: 'WhatsApp Demo', href: '/today', icon: '📱', desc: 'Simulate reminders' },
          { label: 'Caregiver View', href: '/caregiver', icon: '👨‍👩‍👦', desc: 'Rahul\'s dashboard' },
          { label: 'Clinician View', href: '/clinician', icon: '🩺', desc: 'Dr. Priya\'s view' },
        ].map((link) => (
          <Link key={link.href + link.label} to={link.href}
            className="border-2 border-[#2e7d32] rounded-lg p-4 hover:bg-green-50 transition-colors text-center group">
            <p className="text-2xl mb-1">{link.icon}</p>
            <p className="font-bold text-[#2e7d32] text-sm">{link.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
