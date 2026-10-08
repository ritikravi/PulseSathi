import { useQuery } from '@tanstack/react-query';
import { AlertCircle, TrendingUp, TrendingDown, Clock, CheckCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function CaregiverDashboardPage() {
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['caregiver-patients'],
    queryFn: async () => {
      const response = await api.get('/api/caregiver/patients');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading patients...</div>
      </div>
    );
  }

  const patients = patientsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Family Care Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor medication adherence for your loved ones
        </p>
      </div>

      {/* Patients List */}
      {patients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Yet</h3>
          <p className="text-gray-600">
            You haven't been granted access to monitor any patients yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {patients.map((consent: any) => (
            <PatientCard key={consent._id} patient={consent.patientId} consent={consent} />
          ))}
        </div>
      )}
    </div>
  );
}

function PatientCard({ patient, consent }: any) {
  const { data: adherenceData } = useQuery({
    queryKey: ['patient-adherence', patient._id],
    queryFn: async () => {
      const response = await api.get(`/api/caregiver/patients/${patient._id}/adherence`);
      return response.data.data;
    },
    enabled: !!patient._id,
  });

  const overallAdherence = adherenceData?.overallAdherence || 0;
  const problematicMedicines = adherenceData?.problematicMedicines || 0;
  const highRiskCount = adherenceData?.highRiskCount || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Patient Info */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {patient.firstName} {patient.lastName}
          </h3>
          <p className="text-sm text-gray-600 capitalize">
            {consent.relationship}
          </p>
        </div>
        <Link
          to={`/caregiver/patients/${patient._id}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View Details →
        </Link>
      </div>

      {/* Overall Adherence */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Adherence</span>
          {overallAdherence >= 80 ? (
            <TrendingUp className="w-5 h-5 text-success-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-danger-600" />
          )}
        </div>
        <div className="flex items-end space-x-2">
          <span className={`text-3xl font-bold ${
            overallAdherence >= 80 ? 'text-success-600' :
            overallAdherence >= 60 ? 'text-warning-600' :
            'text-danger-600'
          }`}>
            {overallAdherence}%
          </span>
          <span className="text-gray-600 mb-1">
            {overallAdherence >= 80 ? 'Good' :
             overallAdherence >= 60 ? 'Fair' :
             'Needs Attention'}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {(problematicMedicines > 0 || highRiskCount > 0) && (
        <div className="space-y-2">
          {problematicMedicines > 0 && (
            <div className="flex items-center p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-warning-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-warning-900">
                {problematicMedicines} {problematicMedicines === 1 ? 'medicine' : 'medicines'} frequently missed
              </span>
            </div>
          )}
          {highRiskCount > 0 && (
            <div className="flex items-center p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-danger-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-danger-900">
                {highRiskCount} high-risk {highRiskCount === 1 ? 'alert' : 'alerts'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="flex items-center justify-center text-gray-600 mb-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">Taken Today</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {adherenceData?.takenToday || 0}/{adherenceData?.scheduledToday || 0}
          </span>
        </div>
        <div>
          <div className="flex items-center justify-center text-gray-600 mb-1">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-xs">Pending</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {adherenceData?.pendingToday || 0}
          </span>
        </div>
      </div>

      {/* Contact Option */}
      {consent.contactAllowed && (
        <div className="mt-4 pt-4 border-t">
          <a
            href={`tel:${patient.phoneNumber}`}
            className="flex items-center justify-center w-full py-2 px-4 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call {patient.firstName}
          </a>
        </div>
      )}
    </div>
  );
}
