import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const NAV = [
  { to: '/admin', label: 'Início', icon: 'home', end: true },
  { to: '/admin/agenda', label: 'Agenda', icon: 'calendar' },
  { to: '/admin/clientes', label: 'Clientes', icon: 'users' },
  { to: '/admin/equipe', label: 'Equipe', icon: 'star', adminOnly: true },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (user?.id) {
      import('../services/api').then(({ default: api }) => {
        api.get('/api/professionals/all').then(res => {
          const me = res.data.find(p => p.id === user.id);
          if (me?.photo) setProfilePhoto(me.photo);
        }).catch(() => {});
      });
    }
  }, [user?.id]);
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
              <span className="nav-icon">
                {n.icon === 'home' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                {n.icon === 'calendar' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                {n.icon === 'users' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                {n.icon === 'star' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
              </span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: profilePhoto ? 'transparent' : (user?.avatarColor || '#F48FB1'), overflow: 'hidden' }}>
            {profilePhoto
              ? <img src={profilePhoto} alt="Perfil" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
              : (user?.name?.charAt(0) || '?')
            }
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