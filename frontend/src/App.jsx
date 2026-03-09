import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JobsProvider } from './contexts/JobsContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import JobsPage from './pages/JobsPage';
import JobDetail from './pages/JobDetail';
import StatsPage from './pages/StatsPage';
import LeetCodePage from './pages/LeetCodePage';
import RemindersPage from './pages/RemindersPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div style={loadingStyle}>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return (
    <JobsProvider>
      <div style={layoutStyle}>
        <Sidebar />
        <main style={mainStyle}>
          <Outlet />
        </main>
      </div>
    </JobsProvider>
  );
}

function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div style={loadingStyle}>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <AuthPage />;
}

const layoutStyle = {
  display: 'flex',
  minHeight: '100vh',
};

const mainStyle = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
};

const loadingStyle = {
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-3)',
  fontFamily: 'var(--font-mono)',
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicRoute />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/leetcode" element={<LeetCodePage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
