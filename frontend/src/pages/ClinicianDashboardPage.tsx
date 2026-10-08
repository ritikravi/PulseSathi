import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, FlaskConical, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ClinicianDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['clinician-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/clinician/stats');
      return response.data.data;
    },
  });

  const { data: patients } = useQuery({
    queryKey: ['clinician-patients'],
    queryFn: async () => {
      const response = await axios.get('/api/clinician/patients');
      return response.data.data;
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clinician Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor your patients' progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Total Patients</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalPatients || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Patterns to Review</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {stats?.pendingPatterns || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Active Experiments</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {stats?.activeExperiments || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Alerts</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {stats?.alerts || 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-danger-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Your Patients</h2>
        
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-6 sm:px-0">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Latest Glucose
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Patterns
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients?.map((patient: any) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">{patient.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-900">
                        {patient.latestGlucose || '--'} mg/dL
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {patient.patternCount || 0} patterns
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'active' 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status || 'active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/clinician/patients/${patient._id}`}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {(!patients || patients.length === 0) && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No patients assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
