import { useQuery } from '@tanstack/react-query';
import { experiments } from '../lib/api';
import { FlaskConical, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function ExperimentsPage() {
  const navigate = useNavigate();

  const { data: experimentsData } = useQuery({
    queryKey: ['experiments'],
    queryFn: async () => {
      const response = await experiments.getExperiments();
      return response.data.data;
    },
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-warning-100 text-warning-800',
      completed: 'bg-success-100 text-success-800',
      pending: 'bg-gray-100 text-gray-800',
      abandoned: 'bg-danger-100 text-danger-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'abandoned':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FlaskConical className="w-4 h-4" />;
    }
  };

  if (!experimentsData || experimentsData.length === 0) {
    return (
      <div className="card text-center py-12">
        <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Experiments Yet</h2>
        <p className="text-gray-600 mb-6">
          Start by discovering patterns on your dashboard, then create an experiment to test if a
          behavior change helps.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Experiments</h1>
        <p className="text-gray-600 mt-1">Test and measure behavior changes</p>
      </div>

      <div className="space-y-4">
        {experimentsData.map((experiment: any) => (
          <div
            key={experiment._id}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/experiments/${experiment._id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{experiment.title}</h3>
                  <p className="text-sm text-gray-500">
                    Started {format(new Date(experiment.interventionStartDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                  experiment.status
                )}`}
              >
                {getStatusIcon(experiment.status)}
                <span className="capitalize">{experiment.status}</span>
              </span>
            </div>

            <p className="text-gray-700 mb-4">{experiment.hypothesis}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-semibold text-gray-900">{experiment.durationDays} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-semibold text-gray-900">
                  Day {experiment.currentDay} / {experiment.durationDays}
                </p>
              </div>
              {experiment.status === 'completed' && experiment.results && (
                <div>
                  <p className="text-sm text-gray-500">Result</p>
                  <p
                    className={`font-semibold ${
                      experiment.results.improvement ? 'text-success-600' : 'text-gray-600'
                    }`}
                  >
                    {experiment.results.improvement ? 'Improved' : 'No Change'}
                  </p>
                </div>
              )}
            </div>

            {experiment.status === 'completed' && experiment.results && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Baseline</p>
                    <p className="text-lg font-bold text-gray-900">
                      {experiment.results.baselineAverage}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">After Intervention</p>
                    <p className="text-lg font-bold text-gray-900">
                      {experiment.results.interventionAverage}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Change</p>
                    <p
                      className={`text-lg font-bold ${
                        experiment.results.improvement ? 'text-success-600' : 'text-gray-600'
                      }`}
                    >
                      {experiment.results.percentageChange > 0 ? '+' : ''}
                      {experiment.results.percentageChange}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
