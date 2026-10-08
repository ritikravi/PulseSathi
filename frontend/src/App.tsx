import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatternsPage from './pages/PatternsPage';
import ExperimentsPage from './pages/ExperimentsPage';
import ExperimentDetailPage from './pages/ExperimentDetailPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import ClinicianDashboardPage from './pages/ClinicianDashboardPage';
import ClinicianPatientDetailPage from './pages/ClinicianPatientDetailPage';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { user } = useAuthStore();
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Patient Routes */}
        <Route index element={user?.role === 'clinician' ? <Navigate to="/clinician" /> : <DashboardPage />} />
        <Route path="patterns" element={<PatternsPage />} />
        <Route path="experiments" element={<ExperimentsPage />} />
        <Route path="experiments/:id" element={<ExperimentDetailPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        
        {/* Clinician Routes */}
        <Route path="clinician" element={<ClinicianDashboardPage />} />
        <Route path="clinician/patients/:patientId" element={<ClinicianPatientDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
