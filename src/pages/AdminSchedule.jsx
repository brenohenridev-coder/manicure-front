import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminSchedule.css';

export default function AdminSchedule() {
  const { isAdmin } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [professionals, setProfessionals] = useState([]);
  const [selectedPro, setSelectedPro] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) api.get('/api/professionals').then(r => setProfessionals(r.data));
  }, [isAdmin]);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = { date };
      if (selectedPro) params.professionalId = selectedPro;
      const res = await api.get('/api/appointments/by-date', { params });
      setAppointments(res.data);
    } catch(e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [date, selectedPro]);

  const togglePayment = async (id, paid) => {
    await api.patch(`/api/appointments/${id}/payment`, { paid: !paid });
    setAppointments(prev => prev.map(a => a.id === id ? {...a, paid: !paid} : a));
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/api/appointments/${id}/status`, { status });
    setAppointments(prev => prev.map(a => a.id === id ? {...a, status} : a));
  };

  const totalRevenue = appointments.filter(a => a.paid).reduce((s, a) => s + a.totalPrice, 0);

  return (
    <div className="schedule animate-fade">
      <div className="sched-header">
        <h1>Agenda</h1>
        <p>Visualize e gerencie os agendamentos por data</p>
      </div>

      <div className="sched-filters">
        <div className="filter-group">
          <label>Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        {isAdmin && (
          <div className="filter-group">
            <label>Profissional</label>
            <select value={selectedPro} onChange={e => setSelectedPro(e.target.value)}>
              <option value="">Todas</option>
              {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <div className="sched-summary">
          <span>{appointments.length} agendamentos</span>
          {totalRevenue > 0 && <span>R$ {totalRevenue.toFixed(2)} recebidos</span>}
        </div>
      </div>

      {loading ? (
        <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{height:100,marginBottom:12}} />)}</div>
      ) : appointments.length === 0 ? (
        <div className="sched-empty">
          <span>📅</span>
          <p>Nenhum agendamento para esta data</p>
        </div>
      ) : (
        <div className="sched-list">
          {appointments.map((a, i) => (
            <div key={a.id} className={`sched-card animate-fade ${a.status === 'CANCELLED' ? 'cancelled' : ''}`}
              style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="sched-time">
                <strong>{new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                <span>↕ {new Date(a.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="sched-body">
                <div className="sched-client">{a.client.fullName}</div>
                <div className="sched-phone">{a.client.phone}</div>
                <div className="sched-tags">
                  {a.services.map(s => <span key={s.serviceId}>{s.service.name}</span>)}
                </div>
              </div>

              {isAdmin && (
                <div className="sched-pro">
                  <div className="mini-avatar2" style={{ background: a.professional.avatarColor }}>
                    {a.professional.name.charAt(0)}
                  </div>
                  <span>{a.professional.name}</span>
                </div>
              )}

              <div className="sched-price">R$ {a.totalPrice.toFixed(2)}</div>

              <div className="sched-controls">
                <button className={`pay-btn ${a.paid ? 'paid' : ''}`} onClick={() => togglePayment(a.id, a.paid)}>
                  {a.paid ? '✓ Pago' : 'Marcar pago'}
                </button>
                <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)} className="status-select">
                  <option value="SCHEDULED">Agendado</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="NO_SHOW">Faltou</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
