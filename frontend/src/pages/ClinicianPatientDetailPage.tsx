import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function ClinicianPatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await axios.get(`/api/clinician/patients/${patientId}`);
      return response.data.data;
    },
  });

  const { data: patterns } = useQuery({
    queryKey: ['patient-patterns', patientId],
    queryFn: async () => {
      const response = await axios.get(`/api/clinician/patients/${patientId}/patterns`);
      return response.data.data;
    },
  });

  const approvePatternMutation = useMutation({
    mutationFn: async ({ patternId, notes }: { patternId: string; notes: string }) => {
      return axios.put(`/api/clinician/patterns/${patternId}/approve`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-patterns', patientId] });
    },
  });

  const rejectPatternMutation = useMutation({
    mutationFn: async ({ patternId, reason }: { patternId: string; reason: string }) => {
      return axios.put(`/api/clinician/patterns/${patternId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-patterns', patientId] });
    },
  });

  const handleApprovePattern = (patternId: string) => {
    const notes = prompt('Add notes (optional):');
    approvePatternMutation.mutate({ patternId, notes: notes || '' });
  };

  const handleRejectPattern = (patternId: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      rejectPatternMutation.mutate({ patternId, reason });
    }
  };

  const glucoseData = patient?.glucoseReadings?.map((reading: any) => ({
    date: format(new Date(reading.timestamp), 'MMM dd'),
    value: reading.value,
  })) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/clinician')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {patient?.firstName} {patient?.lastName}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">{patient?.email}</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card">
          <p className="text-xs sm:text-sm text-gray-500">Latest Glucose</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            {patient?.latestGlucose || '--'} <span className="text-sm font-normal text-gray-500">mg/dL</span>
          </p>
        </div>
        <div className="card">
          <p className="text-xs sm:text-sm text-gray-500">HbA1c</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            {patient?.lastHbA1c || '--'}<span className="text-sm font-normal text-gray-500">%</span>
          </p>
        </div>
        <div className="card">
          <p className="text-xs sm:text-sm text-gray-500">Adherence</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            {Math.round((patient?.adherenceRate || 0) * 100)}%
          </p>
        </div>
        <div className="card">
          <p className="text-xs sm:text-sm text-gray-500">Active Experiments</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            {patient?.activeExperiments || 0}
          </p>
        </div>
      </div>

      {/* Glucose Trend */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Glucose Trend</h2>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={glucoseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patterns to Review */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Patterns Detected</h2>
        
        {patterns && patterns.length > 0 ? (
          <div className="space-y-4">
            {patterns.map((pattern: any) => (
              <div key={pattern._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary-600" />
                      <h3 className="font-bold text-gray-900">{pattern.title}</h3>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                        {Math.round(pattern.confidenceScore * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{pattern.description}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Baseline</p>
                        <p className="font-semibold">{pattern.baselineAverage} mg/dL</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pattern</p>
                        <p className="font-semibold">{pattern.patternAverage} mg/dL</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Difference</p>
                        <p className="font-semibold text-danger-600">+{pattern.effectSize} mg/dL</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Observations</p>
                        <p className="font-semibold">{pattern.occurrences}/{pattern.totalObservations}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => handleApprovePattern(pattern._id)}
                    disabled={approvePatternMutation.isPending}
                    className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectPattern(pattern._id)}
                    disabled={rejectPatternMutation.isPending}
                    className="flex items-center space-x-2 px-4 py-2 bg-danger-600 text-white text-sm font-medium rounded-lg hover:bg-danger-700 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No patterns detected yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
