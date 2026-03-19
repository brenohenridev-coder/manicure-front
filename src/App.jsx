import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LicenseProvider, useLicense } from './context/LicenseContext';
import { ClientAuthProvider, useClientAuth } from './context/ClientAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import BookingPage from './pages/BookingPage';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminSchedule from './pages/AdminSchedule';
import AdminClients from './pages/AdminClients';
import AdminTeam from './pages/AdminTeam';
import BookingSuccess from './pages/BookingSuccess';
import LicenseBlocked from './pages/LicenseBlocked';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ClientPortal from './pages/ClientPortal';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

function ClientRoute({ children }) {
  const { client, loadingClient } = useClientAuth();
  if (loadingClient) return null;
  if (!client) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const { license, loading } = useLicense();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
          <p style={{ color: 'var(--text-light)', fontFamily: 'DM Sans, sans-serif' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!license?.active) return <LicenseBlocked />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<ClientLogin />} />
        <Route path="/cadastro" element={<ClientRegister />} />
        <Route path="/minha-conta" element={<ClientRoute><ClientPortal /></ClientRoute>} />
        <Route path="/agendar" element={<ClientRoute><BookingPage /></ClientRoute>} />
        <Route path="/agendamento/sucesso" element={<ClientRoute><BookingSuccess /></ClientRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="agenda" element={<AdminSchedule />} />
          <Route path="clientes" element={<AdminClients />} />
          <Route path="equipe" element={<AdminTeam />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LicenseProvider>
        <ClientAuthProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ClientAuthProvider>
      </LicenseProvider>
    </ThemeProvider>
  );
}
