import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import './ClientLogin.css';
import './ClientRegister.css';

export default function ClientRegister() {
  const { registerClient } = useClientAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', cpf: '', phone: '', birthDate: '', username: '', password: '', confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const formatCpf = v => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const formatPhone = v => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('As senhas não coincidem');
    setLoading(true);
    setError('');
    try {
      await registerClient({
        fullName: form.fullName,
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone,
        birthDate: form.birthDate,
        username: form.username,
        password: form.password
      });
      navigate('/agendar');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-page">
      <div className="cl-card cr-wide animate-fade">
        <div className="cl-logo">✦</div>
        <h1>Criar conta</h1>
        <p className="cl-sub">Cadastre-se para agendar seu horário</p>

        {error && <div className="cl-error">{error}</div>}

        <form onSubmit={submit} className="cl-form">
          <div className="cr-grid">
            <div className="cl-field">
              <label>Nome completo</label>
              <input name="fullName" value={form.fullName} onChange={handle} placeholder="Seu nome" required />
            </div>
            <div className="cl-field">
              <label>CPF</label>
              <input name="cpf" value={form.cpf}
                onChange={e => setForm(p => ({ ...p, cpf: formatCpf(e.target.value) }))}
                placeholder="000.000.000-00" required />
            </div>
            <div className="cl-field">
              <label>Telefone</label>
              <input name="phone" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: formatPhone(e.target.value) }))}
                placeholder="(00) 00000-0000" required />
            </div>
            <div className="cl-field">
              <label>Data de nascimento</label>
              <input type="date" name="birthDate" value={form.birthDate} onChange={handle} required />
            </div>
          </div>

          <div className="cr-divider">Dados de acesso</div>

          <div className="cr-grid">
            <div className="cl-field">
              <label>Usuário</label>
              <input name="username" value={form.username} onChange={handle} placeholder="seu_usuario" required />
            </div>
            <div className="cl-field">
              <label>Senha</label>
              <input type="password" name="password" value={form.password} onChange={handle} placeholder="Mín. 6 caracteres" required />
            </div>
            <div className="cl-field">
              <label>Confirmar senha</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handle} placeholder="Repita a senha" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="cl-btn">
            {loading ? 'Cadastrando...' : 'Criar conta e agendar'}
          </button>
        </form>

        <p className="cl-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
