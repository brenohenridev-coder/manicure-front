import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './AdminClients.css';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/clients', { params: search ? { search } : {} });
      setClients(res.data);
    } catch(e) {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  const openClient = async (id) => {
    setSelected(id);
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/clients/${id}`);
      setDetail(res.data);
    } catch(e) {} finally { setDetailLoading(false); }
  };

  const formatCPF = (cpf) => cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || cpf;
  const formatPhone = (p) => p?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') || p;

  return (
    <div className="clients-page animate-fade">
      <div className="clients-header">
        <div>
          <h1>Clientes</h1>
          <p>Gerencie a sua cartela de clientes</p>
        </div>
      </div>

      <div className="clients-layout">
        {/* List */}
        <div className="clients-list-panel">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input placeholder="Buscar por nome..." value={search}
              onChange={e => setSearch(e.target.value)} />
            {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
          </div>

          {loading ? (
            <div>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height:70,marginBottom:8}} />)}</div>
          ) : clients.length === 0 ? (
            <div className="clients-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <p>{search ? 'Nenhuma cliente encontrada' : 'Nenhuma cliente cadastrada'}</p>
            </div>
          ) : (
            <div className="client-items">
              {clients.map(c => (
                <button key={c.id} className={`client-item ${selected === c.id ? 'active' : ''}`}
                  onClick={() => openClient(c.id)}>
                  <div className="client-avatar">
                    {c.fullName.charAt(0)}
                  </div>
                  <div className="client-info">
                    <span className="client-name">{c.fullName}</span>
                    <span className="client-phone">{formatPhone(c.phone)}</span>
                  </div>
                  {c.appointments?.[0] && (
                    <div className={`client-status ${c.appointments[0].paid ? 'paid' : 'unpaid'}`}>
                      {c.appointments[0].paid ? '✓' : '○'}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          <p className="clients-count">{clients.length} cliente{clients.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Detail panel */}
        <div className="clients-detail-panel">
          {!selected ? (
            <div className="detail-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <p>Selecione uma cliente para ver os detalhes</p>
            </div>
          ) : detailLoading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{height:80,marginBottom:12}} />)}</div>
          ) : detail ? (
            <div className="client-detail animate-slide">
              <div className="detail-avatar">
                {detail.fullName.charAt(0)}
              </div>
              <h2>{detail.fullName}</h2>

              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span>📞 Celular</span>
                  <strong>{formatPhone(detail.phone)}</strong>
                </div>
                <div className="detail-info-item">
                  <span>📋 CPF</span>
                  <strong>{formatCPF(detail.cpf)}</strong>
                </div>
                <div className="detail-info-item">
                  <span>🎂 Nascimento</span>
                  <strong>{new Date(detail.birthDate).toLocaleDateString('pt-BR')}</strong>
                </div>
                <div className="detail-info-item">
                  <span>Desde</span>
                  <strong>{new Date(detail.createdAt).toLocaleDateString('pt-BR')}</strong>
                </div>
              </div>

              <h3>Histórico de Agendamentos</h3>
              {detail.appointments?.length === 0 ? (
                <p className="no-history">Nenhum agendamento ainda</p>
              ) : (
                <div className="history-list">
                  {detail.appointments?.map(a => (
                    <div key={a.id} className="history-item">
                      <div className="history-date">
                        {new Date(a.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
                        <span>{new Date(a.date).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</span>
                      </div>
                      <div className="history-body">
                        <div>{a.professional.name}</div>
                        <div className="history-services">
                          {a.services.map(s => s.service.name).join(', ')}
                        </div>
                      </div>
                      <div className={`history-paid ${a.paid ? 'paid' : ''}`}>
                        {a.paid ? '✓ Pago' : 'Pendente'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}