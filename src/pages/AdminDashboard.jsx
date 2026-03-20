import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const STATUS_LABELS = { SCHEDULED: 'Agendado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado', NO_SHOW: 'Não compareceu' };
const STATUS_COLORS = { SCHEDULED: '#F48FB1', COMPLETED: '#81C784', CANCELLED: '#EF9A9A', NO_SHOW: '#FFB74D' };

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const fetchToday = async () => {
    try {
      const res = await api.get('/api/appointments/today');
      setAppointments(res.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchToday(); }, []);

  const togglePayment = async (id, currentPaid) => {
    try {
      await api.patch(`/api/appointments/${id}/payment`, { paid: !currentPaid });
      setAppointments(prev => prev.map(a => a.id === id ? {...a, paid: !currentPaid} : a));
    } catch(e) { console.error(e); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a.id === id ? {...a, status} : a));
    } catch(e) { console.error(e); }
  };

  const paid = appointments.filter(a => a.paid).length;
  const totalRevenue = appointments.filter(a => a.paid).reduce((s, a) => s + a.totalPrice, 0);
  const emptySlots = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30'].filter(
    slot => !appointments.some(a => new Date(a.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) === slot && a.status !== 'CANCELLED')
  );

  return (
    <div className="dashboard animate-fade">
      <div className="dash-header">
        <div>
          <h1>Olá, {user?.name?.split(' ')[0]}</h1>
          <p className="dash-date">{today}</p>
        </div>
        <button className="refresh-btn" onClick={fetchToday}>Atualizar</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <p className="stat-num">{appointments.length}</p>
            <p className="stat-label">Agendamentos hoje</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p className="stat-num">{paid}</p>
            <p className="stat-label">Pagamentos recebidos</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon-box pink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <p className="stat-num">R$ {totalRevenue.toFixed(2)}</p>
            <p className="stat-label">Faturamento do dia</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p className="stat-num">{emptySlots.length}</p>
            <p className="stat-label">Horários disponíveis</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>Agenda de Hoje</h2>
        {appointments.length > 0 && <span className="badge">{appointments.length}</span>}
      </div>

      {loading ? (
        <div className="loading-list">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:90,marginBottom:10}} />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum agendamento para hoje</p>
        </div>
      ) : (
        <div className="appt-list">
          {appointments.map((a, i) => (
            <div key={a.id} className="appt-card animate-fade" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="appt-time-col">
                <span className="appt-time">
                  {new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="appt-end">
                  {new Date(a.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="appt-body">
                <div className="appt-client">{a.client.fullName}</div>
                <div className="appt-services">
                  {a.services.map(s => <span key={s.serviceId}>{s.service.name}</span>)}
                </div>
                {isAdmin && (
                  <div className="appt-pro">
                    <div className="mini-avatar" style={{ background: a.professional.avatarColor }}>
                      {a.professional.name.charAt(0)}
                    </div>
                    {a.professional.name}
                  </div>
                )}
              </div>

              <div className="appt-actions">
                <span className="status-badge" style={{ background: STATUS_COLORS[a.status] + '22', color: STATUS_COLORS[a.status], borderColor: STATUS_COLORS[a.status] + '44' }}>
                  {STATUS_LABELS[a.status]}
                </span>
                <button className={`pay-btn ${a.paid ? 'paid' : ''}`} onClick={() => togglePayment(a.id, a.paid)}>
                  {a.paid ? 'Pago' : 'Marcar pago'}
                </button>
                <select className="status-select" value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
                  <option value="SCHEDULED">Agendado</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="NO_SHOW">Não compareceu</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {emptySlots.length > 0 && (
        <>
          <div className="section-header" style={{marginTop: 32}}>
            <h2>Horários Livres</h2>
          </div>
          <div className="empty-slots-grid">
            {emptySlots.slice(0, 12).map(slot => (
              <div key={slot} className="empty-slot">{slot}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}