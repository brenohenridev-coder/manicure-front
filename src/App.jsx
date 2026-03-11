import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BookingPage from './pages/BookingPage';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminSchedule from './pages/AdminSchedule';
import AdminClients from './pages/AdminClients';
import AdminTeam from './pages/AdminTeam';
import BookingSuccess from './pages/BookingSuccess';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public - Client booking */}
          <Route path="/" element={<BookingPage />} />
          <Route path="/agendamento/sucesso" element={<BookingSuccess />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="agenda" element={<AdminSchedule />} />
            <Route path="clientes" element={<AdminClients />} />
            <Route path="equipe" element={<AdminTeam />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
