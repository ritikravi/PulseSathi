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
    type: reading.readingType,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-gray-600 mt-1">Here's your health summary</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Adherence Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Medication Adherence</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData?.adherenceRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>

        {/* Active Patterns */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Patterns Detected</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData?.activePatterns?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Personalized insights</p>
        </div>

        {/* Active Experiment */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Experiment</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardData?.activeExperiment ? '1' : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {dashboardData?.activeExperiment ? 'In progress' : 'No active experiments'}
          </p>
        </div>
      </div>

      {/* Glucose Trend Chart */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Glucose Readings</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={glucoseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'mg/dL', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pattern Detection CTA */}
      {(!dashboardData?.activePatterns || dashboardData.activePatterns.length === 0) && (
        <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Discover Your Personal Patterns
              </h3>
              <p className="text-gray-700 mb-4">
                We analyze your health data to find patterns specific to you. Unlike generic reminders,
                we discover what actually affects YOUR glucose levels.
              </p>
              <button
                onClick={handleDetectPatterns}
                disabled={detecting}
                className="btn btn-primary disabled:opacity-50"
              >
                {detecting ? 'Analyzing...' : 'Discover Patterns'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Patterns */}
      {dashboardData?.activePatterns && dashboardData.activePatterns.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detected Patterns</h2>
          <div className="space-y-3">
            {dashboardData.activePatterns.map((pattern: any) => (
              <div
                key={pattern._id}
                className="p-4 bg-primary-50 border border-primary-200 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors"
                onClick={() => navigate('/patterns')}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{pattern.title}</h3>
                <p className="text-sm text-gray-600">{pattern.description}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/patterns')}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All Patterns →
          </button>
        </div>
      )}

      {/* Active Experiment */}
      {dashboardData?.activeExperiment && (
        <div className="card bg-warning-50 border-2 border-warning-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Active Experiment: {dashboardData.activeExperiment.title}
              </h3>
              <p className="text-gray-700 mb-4">{dashboardData.activeExperiment.hypothesis}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  Day {dashboardData.activeExperiment.currentDay} of{' '}
                  {dashboardData.activeExperiment.durationDays}
                </span>
                <span className="px-3 py-1 bg-warning-200 text-warning-800 rounded-full text-xs font-medium">
                  {dashboardData.activeExperiment.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/experiments/${dashboardData.activeExperiment._id}`)}
              className="btn btn-primary"
            >
              Check In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
