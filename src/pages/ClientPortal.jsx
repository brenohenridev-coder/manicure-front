import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import api from '../services/api';
import './ClientPortal.css';
import PhotoUpload from '../components/PhotoUpload';

const STATUS_LABEL = { SCHEDULED: 'Agendado', COMPLETED: 'Concluído', CANCELLED: 'Cancelado', NO_SHOW: 'Não compareceu' };
const STATUS_CLASS = { SCHEDULED: 'status-scheduled', COMPLETED: 'status-done', CANCELLED: 'status-cancelled', NO_SHOW: 'status-noshow' };

export default function ClientPortal() {
  const { client, logoutClient, getClientToken } = useClientAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [actionLoading, setActionLoading] = useState(null);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [msg, setMsg] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);

  const uploadPhoto = async (base64) => {
    setPhotoLoading(true);
    try {
      const token = getClientToken();
      await api.patch('/api/client-auth/photo', { photo: base64 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('✅ Foto atualizada com sucesso');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Erro ao salvar foto'));
    } finally {
      setPhotoLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = getClientToken();
      const res = await api.get('/api/client-auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch {
      logoutClient();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const cancel = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    setActionLoading(id);
    setMsg('');
    try {
      const token = getClientToken();
      await api.patch(`/api/appointments/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('✅ Agendamento cancelado com sucesso');
      fetchProfile();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Erro ao cancelar'));
    } finally {
      setActionLoading(null);
    }
  };

  const reschedule = async (id) => {
    if (!newDate || !newTime) return setMsg('Escolha a nova data e horário');
    setActionLoading(id);
    setMsg('');
    try {
      const token = getClientToken();
      await api.patch(`/api/appointments/${id}/reschedule`,
        { date: `${newDate}T${newTime}:00` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg('✅ Agendamento remarcado com sucesso');
      setRescheduleId(null);
      fetchProfile();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Erro ao remarcar'));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="cp-loading">
      <div>✦</div><p>Carregando seu perfil...</p>
    </div>
  );

  const appointments = tab === 'upcoming' ? data?.upcoming : data?.past;

  return (
    <div className="cp-page">
      <header className="cp-header">
        <span className="cp-brand">✦ Studio Belle</span>
        <div className="cp-actions">
          <button onClick={() => navigate('/agendar')} className="cp-btn-outline">+ Novo agendamento</button>
          <button onClick={logoutClient} className="cp-btn-ghost">Sair</button>
        </div>
      </header>

      <main className="cp-main">
        {/* Perfil */}
        <div className="cp-profile-card">
          <PhotoUpload currentPhoto={data?.photo} name={data?.fullName} size={56} onUpload={uploadPhoto} loading={photoLoading} />
          <div>
            <h2>{data?.fullName}</h2>
            <p>@{data?.username} · {data?.phone}</p>
          </div>
          <div className="cp-visits">
            <span className="cp-visits-num">{data?.totalVisits}</span>
            <span>visita{data?.totalVisits !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {msg && <div className={`cp-msg ${msg.startsWith('✅') ? 'cp-msg-ok' : 'cp-msg-err'}`}>{msg}</div>}

        {/* Tabs */}
        <div className="cp-tabs">
          <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>
            Próximos ({data?.upcoming?.length || 0})
          </button>
          <button className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>
            Histórico ({data?.past?.length || 0})
          </button>
        </div>

        {/* Lista */}
        {!appointments?.length ? (
          <div className="cp-empty">
            <span>✦</span>
            <p>{tab === 'upcoming' ? 'Nenhum agendamento futuro' : 'Nenhum histórico ainda'}</p>
            {tab === 'upcoming' && <button onClick={() => navigate('/agendar')} className="cp-btn">Agendar agora</button>}
          </div>
        ) : (
          <div className="cp-list">
            {appointments.map(apt => (
              <div key={apt.id} className="cp-appt-card">
                <div className="cp-appt-top">
                  <div>
                    <div className="cp-appt-date">
                      {new Date(apt.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                      {' às '}
                      {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="cp-appt-prof">
                      <span className="cp-dot" style={{ background: apt.professional.avatarColor }}></span>
                      {apt.professional.name}
                    </div>
                    <div className="cp-appt-services">
                      {apt.services.map(s => s.service.name).join(', ')}
                    </div>
                  </div>
                  <div className="cp-appt-right">
                    <span className={`cp-status ${STATUS_CLASS[apt.status]}`}>{STATUS_LABEL[apt.status]}</span>
                    <span className="cp-price">R$ {apt.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>

                {apt.status === 'SCHEDULED' && (
                  <div className="cp-appt-btns">
                    {rescheduleId === apt.id ? (
                      <div className="cp-reschedule">
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} min="09:00" max="19:00" />
                        <button onClick={() => reschedule(apt.id)} disabled={actionLoading === apt.id} className="cp-btn-sm cp-btn-confirm">
                          {actionLoading === apt.id ? '...' : 'Confirmar'}
                        </button>
                        <button onClick={() => setRescheduleId(null)} className="cp-btn-sm cp-btn-cancel-ghost">Voltar</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => { setRescheduleId(apt.id); setNewDate(''); setNewTime(''); }} className="cp-btn-sm cp-btn-reschedule">
                          Remarcar
                        </button>
                        <button onClick={() => cancel(apt.id)} disabled={actionLoading === apt.id} className="cp-btn-sm cp-btn-cancel">
                          {actionLoading === apt.id ? '...' : 'Cancelar'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}