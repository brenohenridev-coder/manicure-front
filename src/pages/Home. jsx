import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-card animate-fade">
        <div className="home-logo">✦</div>
        <h1>Studio Belle</h1>
        <p className="home-sub">Manicure & Nail Art</p>

        <div className="home-divider" />

        <p className="home-question">Como deseja acessar?</p>

        <div className="home-buttons">
          <button className="home-btn home-btn-client" onClick={() => navigate('/login')}>
            <span className="home-btn-icon">💅</span>
            <div>
              <strong>Sou cliente</strong>
              <small>Agendar horário</small>
            </div>
          </button>

          <button className="home-btn home-btn-admin" onClick={() => navigate('/admin/login')}>
            <span className="home-btn-icon">👑</span>
            <div>
              <strong>Sou profissional</strong>
              <small>Acessar painel</small>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}