import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const NAV = [
  { to: '/admin', label: 'Início', icon: '🏠', end: true },
  { to: '/admin/agenda', label: 'Agenda', icon: '📅' },
  { to: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { to: '/admin/equipe', label: 'Equipe', icon: '💅', adminOnly: true },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">✦</span>
          <div>
            <h2>Studio Belle</h2>
            <span>Painel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.filter(n => !n.adminOnly || isAdmin).map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: user?.avatarColor || '#F48FB1' }}>
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role === 'ADMIN' ? 'Administradora' : 'Profissional'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sair">⇒</button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
