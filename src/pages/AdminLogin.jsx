import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) navigate('/admin');
  }, [user]);

  const handleSubmit = async () => {
    setError('');
    if (!username || !password) { setError('Preencha todos os campos'); return; }
    const result = await login(username, password);
    if (result.success) navigate('/admin');
    else setError(result.error);
  };

  return (
    <div className="login-page">
      <div className="login-deco" />
      <div className="login-card animate-fade">
        <div className="login-header">
          <span className="login-icon">✦</span>
          <h1>Studio Belle</h1>
          <p>Área Profissional</p>
        </div>

        <div className="login-form">
          <div className="login-field">
            <label>Usuário</label>
            <input
              type="text"
              placeholder="seu usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="login-field">
            <label>Senha</label>
            <div className="pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button className="show-pass" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && <div className="login-error">⚠ {error}</div>}

          <button className="login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Entrar'}
          </button>
        </div>

        <a href="/" className="back-to-booking">← Página de agendamento</a>
      </div>
    </div>
  );
}
