import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { experiments } from '../lib/api';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export default function ExperimentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkInData, setCheckInData] = useState({
    adherenceStatus: 'completed' as 'completed' | 'partial' | 'missed',
    notes: '',
    glucose: '',
  });

  const { data: experimentData, isLoading } = useQuery({
    queryKey: ['experiment', id],
    queryFn: async () => {
      const response = await experiments.getExperiment(id!);
      return response.data.data;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (data: any) => {
      return experiments.checkIn(id!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', id] });
      setCheckInData({ adherenceStatus: 'completed', notes: '', glucose: '' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      return experiments.complete(id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', id] });
    },
  });

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const dayNumber = (experimentData?.experiment?.currentDay || 0) + 1;
    checkInMutation.mutate({
      dayNumber,
      adherenceStatus: checkInData.adherenceStatus,
      notes: checkInData.notes,
      measurements: {
        glucose: checkInData.glucose ? parseFloat(checkInData.glucose) : undefined,
      },
    });
  };

  const handleComplete = () => {
    if (window.confirm('Are you sure you want to complete this experiment?')) {
      completeMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading experiment...</div>
      </div>
    );
  }

  const { experiment, events } = experimentData;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/experiments')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Experiments</span>
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{experiment.title}</h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                experiment.status === 'active'
                  ? 'bg-warning-100 text-warning-800'
                  : 'bg-success-100 text-success-800'
              }`}
            >
              {experiment.status}
            </span>
          </div>
          {experiment.status === 'active' && experiment.currentDay >= experiment.durationDays && (
            <button onClick={handleComplete} className="btn btn-primary">
              Complete Experiment
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Hypothesis</h3>
            <p className="text-gray-700">{experiment.hypothesis}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Intervention</h3>
            <p className="text-gray-700">{experiment.intervention.description}</p>
            <p className="text-sm text-gray-600 mt-1">{experiment.intervention.specificAction}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold text-gray-900">{experiment.durationDays} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Day</p>
              <p className="font-semibold text-gray-900">{experiment.currentDay}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-ins</p>
              <p className="font-semibold text-gray-900">{events.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Target Metric</p>
              <p className="font-semibold text-gray-900">
                {experiment.primaryOutcome.metric.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results (if completed) */}
      {experiment.status === 'completed' && experiment.results && (
        <div className="card bg-success-50 border-2 border-success-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Experiment Results</h2>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Baseline Average</p>
              <p className="text-3xl font-bold text-gray-900">{experiment.results.baselineAverage}</p>
              <p className="text-xs text-gray-500">mg/dL</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">After Intervention</p>
              <p className="text-3xl font-bold text-gray-900">
                {experiment.results.interventionAverage}
              </p>
              <p className="text-xs text-gray-500">mg/dL</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Change</p>
              <p
                className={`text-3xl font-bold ${
                  experiment.results.improvement ? 'text-success-600' : 'text-gray-600'
                }`}
              >
                {experiment.results.percentageChange > 0 ? '+' : ''}
                {experiment.results.percentageChange}%
              </p>
              <p className="text-xs text-gray-500">
                {experiment.results.improvement ? 'Improved' : 'No significant change'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Conclusion</h3>
            <p className="text-gray-700">{experiment.results.conclusion}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Completion Rate:</span>{' '}
                <span className="font-semibold">{experiment.results.completionRate}%</span>
              </div>
              <div>
                <span className="text-gray-500">Evidence Strength:</span>{' '}
                <span className="font-semibold capitalize">{experiment.results.evidenceStrength}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Form (if active) */}
      {experiment.status === 'active' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Check-In</h2>
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Did you follow the intervention today?
              </label>
              <select
                value={checkInData.adherenceStatus}
                onChange={(e) =>
                  setCheckInData({
                    ...checkInData,
                    adherenceStatus: e.target.value as any,
                  })
                }
                className="input"
              >
                <option value="completed">Yes, completed</option>
                <option value="partial">Partially</option>
                <option value="missed">Missed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Glucose Reading (optional)
              </label>
              <input
                type="number"
                value={checkInData.glucose}
                onChange={(e) =>
                  setCheckInData({ ...checkInData, glucose: e.target.value })
                }
                placeholder="Enter glucose reading"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={checkInData.notes}
                onChange={(e) =>
                  setCheckInData({ ...checkInData, notes: e.target.value })
                }
                placeholder="Any observations or notes..."
                className="input h-24"
              />
            </div>

            <button
              type="submit"
              disabled={checkInMutation.isPending}
              className="btn btn-primary disabled:opacity-50"
            >
              {checkInMutation.isPending ? 'Submitting...' : 'Submit Check-In'}
            </button>
          </form>
        </div>
      )}

      {/* Check-in History */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Check-In History</h2>
        {events.length === 0 ? (
          <p className="text-gray-500">No check-ins yet</p>
        ) : (
          <div className="space-y-3">
            {events.map((event: any) => (
              <div key={event._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">Day {event.dayNumber}</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{event.adherenceStatus}</p>
                  {event.notes && <p className="text-sm text-gray-700 mt-1">{event.notes}</p>}
                  {event.measurements?.glucose && (
                    <p className="text-sm text-gray-600 mt-1">
                      Glucose: {event.measurements.glucose} mg/dL
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
