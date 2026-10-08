import { useQuery } from '@tanstack/react-query';
import { patterns, experiments } from '../lib/api';
import { TrendingUp, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PatternsPage() {
  const navigate = useNavigate();
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const { data: patternsData, refetch } = useQuery({
    queryKey: ['patterns'],
    queryFn: async () => {
      const response = await patterns.getPatterns();
      return response.data.data;
    },
  });

  const handleDismiss = async (patternId: string) => {
    try {
      await patterns.dismissPattern(patternId, 'User dismissed');
      refetch();
      setSelectedPattern(null);
    } catch (error) {
      console.error('Failed to dismiss pattern:', error);
    }
  };

  const handleCreateExperiment = async (pattern: any) => {
    setCreating(true);
    try {
      const now = new Date();
      const baselineStart = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const baselineEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      const interventionStart = new Date();
      const interventionEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const experimentData = {
        patternId: pattern._id,
        title: `Test: ${pattern.feature1.value.replace(/_/g, ' ')}`,
        hypothesis: `If I ${pattern.suggestedIntervention?.replace(/_/g, ' ') || 'make this change'}, my ${pattern.outcome.metric.replace(/_/g, ' ')} will improve`,
        intervention: {
          type: pattern.feature1.type,
          description: pattern.suggestedIntervention || 'Behavior change',
          specificAction: pattern.aiExplanation || 'Follow the recommended change',
          fromApprovedLibrary: true,
        },
        baselineStartDate: baselineStart.toISOString(),
        baselineEndDate: baselineEnd.toISOString(),
        interventionStartDate: interventionStart.toISOString(),
        interventionEndDate: interventionEnd.toISOString(),
        durationDays: 5,
        primaryOutcome: {
          metric: pattern.outcome.metric,
          targetImprovement: `Reduce by ${Math.abs(pattern.percentageDifference)}%`,
        },
        secondaryOutcomes: [],
      };

      const response = await experiments.createExperiment(experimentData);
      navigate(`/experiments/${response.data.data._id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create experiment');
    } finally {
      setCreating(false);
    }
  };

  if (!patternsData || patternsData.length === 0) {
    return (
      <div className="card text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Patterns Yet</h2>
        <p className="text-gray-600 mb-6">
          We need more data to detect patterns. Keep tracking your glucose, meals, and activities.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Discovered Patterns</h1>
        <p className="text-gray-600 mt-1">Patterns specific to your health data</p>
      </div>

      <div className="space-y-4">
        {patternsData.map((pattern: any) => (
          <div key={pattern._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{pattern.title}</h3>
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                      {Math.round(pattern.confidenceScore * 100)}% confidence
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{pattern.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Baseline Average</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pattern.baselineAverage} mg/dL
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pattern Average</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pattern.patternAverage} mg/dL
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Difference</p>
                    <p className="text-lg font-semibold text-danger-600">
                      +{pattern.effectSize} mg/dL
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Observations</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pattern.occurrences}/{pattern.totalObservations}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">{pattern.aiExplanation}</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleCreateExperiment(pattern)}
                    disabled={creating}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <span>{creating ? 'Creating...' : 'Test This Pattern'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDismiss(pattern._id)}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
