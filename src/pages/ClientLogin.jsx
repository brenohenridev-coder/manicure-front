import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import './ClientLogin.css';

export default function ClientLogin() {
  const { loginClient } = useClientAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginClient(form.username, form.password);
      navigate('/agendar');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-page">
      <div className="cl-card animate-fade">
        <div className="cl-logo">✦</div>
        <h1>Bem-vinda de volta</h1>
        <p className="cl-sub">Entre na sua conta para agendar</p>

        {error && <div className="cl-error">{error}</div>}

        <form onSubmit={submit} className="cl-form">
          <div className="cl-field">
            <label>Usuário</label>
            <input name="username" value={form.username} onChange={handle} placeholder="seu_usuario" required />
          </div>
          <div className="cl-field">
            <label>Senha</label>
            <input type="password" name="password" value={form.password} onChange={handle} placeholder="••••••" required />
          </div>
          <button type="submit" disabled={loading} className="cl-btn">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="cl-link">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>

        <div className="cl-divider" />

        <p className="cl-pro-link">
          É profissional? <Link to="/admin/login">Acesse a área profissional</Link>
        </p>
      </div>
    </div>
  );
}