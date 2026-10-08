import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { patient, patterns } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [detecting, setDetecting] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await patient.getDashboard();
      return response.data.data;
    },
  });

  const handleDetectPatterns = async () => {
    setDetecting(true);
    try {
      await patterns.detectPatterns();
      navigate('/patterns');
    } catch (error) {
      console.error('Pattern detection failed:', error);
    } finally {
      setDetecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const glucoseData = dashboardData?.latestGlucose?.map((reading: any) => ({
    date: format(new Date(reading.timestamp), 'MMM dd'),
    value: reading.value,
  })) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Here's your health summary</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card">
          <p className="text-xs text-gray-500">Latest Glucose</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {dashboardData?.latestGlucose?.[0]?.value || '--'}
            <span className="text-sm font-normal text-gray-500"> mg/dL</span>
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Patterns Found</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData?.patternCount || 0}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Active Experiments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData?.experimentCount || 0}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Days Tracked</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData?.daysTracked || 0}</p>
        </div>
      </div>

      {/* Glucose Trend Chart */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Glucose Readings</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={glucoseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pattern Detection CTA */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Discover Your Patterns</h3>
            <p className="text-sm text-gray-600 mt-1">
              Let AI analyze your data to find personalized behavior patterns
            </p>
          </div>
          <button
            onClick={handleDetectPatterns}
            disabled={detecting}
            className="btn btn-primary whitespace-nowrap w-full sm:w-auto"
          >
            {detecting ? 'Analyzing...' : 'Detect Patterns'}
          </button>
        </div>
      </div>
    </div>
  );
}
