import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './BookingPage.css';

const SALON_ADDRESS = 'Rua das Flores, 123, São Paulo, SP';
const SALON_MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975!2d-46.6388!3d-23.5489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMyJzU2LjEiUyA0NsKwMzgnMTkuNyJX!5e0!3m2!1spt!2sbr!4v1234567890';

const STEPS = ['Dados', 'Profissional', 'Serviços', 'Horário', 'Confirmar'];

export default function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [form, setForm] = useState({ fullName: '', cpf: '', phone: '', birthDate: '' });
  const [clientId, setClientId] = useState(null);
  const [selectedPro, setSelectedPro] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    api.get('/api/professionals').then(r => setProfessionals(r.data)).catch(() => {});
    api.get('/api/services').then(r => setServices(r.data)).catch(() => {});
  }, []);

  const totalDuration = selectedServices.reduce((s, id) => {
    const svc = services.find(sv => sv.id === id);
    return s + (svc?.duration || 0);
  }, 0);

  const totalPrice = selectedServices.reduce((s, id) => {
    const svc = services.find(sv => sv.id === id);
    return s + (svc?.price || 0);
  }, 0);

  useEffect(() => {
    if (selectedPro && selectedDate && selectedServices.length > 0) {
      setAvailableSlots([]);
      api.get('/api/schedule/available', {
        params: { professionalId: selectedPro, date: selectedDate, duration: totalDuration }
      }).then(r => setAvailableSlots(r.data)).catch(() => {});
    }
  }, [selectedPro, selectedDate, selectedServices]);

  const formatCPF = (v) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
  const formatPhone = (v) => v.replace(/\D/g,'').slice(0,11).replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');

  const goNext = async () => {
    setError('');
    if (step === 0) {
      if (!form.fullName || !form.cpf || !form.phone || !form.birthDate) {
        setError('Preencha todos os campos'); return;
      }
      setLoading(true);
      try {
        const res = await api.post('/api/clients', {
          ...form,
          cpf: form.cpf.replace(/\D/g,''),
          phone: form.phone.replace(/\D/g,'')
        });
        setClientId(res.data.id);
        setStep(1);
      } catch(e) { setError(e.response?.data?.error || 'Erro ao cadastrar'); }
      finally { setLoading(false); }
    } else if (step === 1) {
      if (!selectedPro) { setError('Selecione uma profissional'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!selectedServices.length) { setError('Selecione pelo menos um serviço'); return; }
      setStep(3);
    } else if (step === 3) {
      if (!selectedSlot) { setError('Selecione um horário'); return; }
      setStep(4);
    } else if (step === 4) {
      setLoading(true);
      try {
        await api.post('/api/appointments', {
          clientId,
          professionalId: selectedPro,
          date: selectedSlot,
          serviceIds: selectedServices
        });
        navigate('/agendamento/sucesso', { state: { name: form.fullName, slot: selectedSlot } });
      } catch(e) { setError(e.response?.data?.error || 'Erro ao agendar'); }
      finally { setLoading(false); }
    }
  };

  const toggleService = (id) => {
    setSelectedSlot(null);
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const pro = professionals.find(p => p.id === selectedPro);

  return (
    <div className="booking-page">
      {/* Header */}
      <header className="booking-header">
        <div className="booking-logo">
          <span className="logo-icon">✦</span>
          <div>
            <h1>Studio Belle</h1>
            <p>Manicure & Nail Art</p>
          </div>
        </div>
        <a href="/admin/login" className="admin-link">Área Profissional</a>
      </header>

      <main className="booking-main">
        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="booking-card animate-fade">
          {/* STEP 0 — Personal data */}
          {step === 0 && (
            <div className="step-content">
              <h2 className="step-title">Suas Informações</h2>
              <p className="step-sub">Preencha seus dados para realizar o agendamento</p>
              <div className="form-grid">
                <div className="field full">
                  <label>Nome completo</label>
                  <input placeholder="Maria Aparecida Silva" value={form.fullName}
                    onChange={e => setForm({...form, fullName: e.target.value})} />
                </div>
                <div className="field">
                  <label>CPF</label>
                  <input placeholder="000.000.000-00" value={form.cpf}
                    onChange={e => setForm({...form, cpf: formatCPF(e.target.value)})} />
                </div>
                <div className="field">
                  <label>Celular</label>
                  <input placeholder="(11) 99999-9999" value={form.phone}
                    onChange={e => setForm({...form, phone: formatPhone(e.target.value)})} />
                </div>
                <div className="field">
                  <label>Data de nascimento</label>
                  <input type="date" value={form.birthDate}
                    onChange={e => setForm({...form, birthDate: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Choose professional */}
          {step === 1 && (
            <div className="step-content">
              <h2 className="step-title">Escolha sua Profissional</h2>
              <p className="step-sub">Selecione com quem você quer ser atendida</p>
              <div className="pro-grid">
                {professionals.map(p => (
                  <button key={p.id} className={`pro-card ${selectedPro === p.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPro(p.id)}>
                    <div className="pro-avatar" style={{ background: p.avatarColor }}>
                      {p.name.charAt(0)}
                    </div>
                    <span className="pro-name">{p.name}</span>
                    {selectedPro === p.id && <span className="pro-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Choose services */}
          {step === 2 && (
            <div className="step-content">
              <h2 className="step-title">Selecione os Serviços</h2>
              <p className="step-sub">Você pode escolher mais de um serviço</p>
              <div className="services-grid">
                {services.map(s => {
                  const selected = selectedServices.includes(s.id);
                  return (
                    <button key={s.id} className={`service-card ${selected ? 'selected' : ''}`}
                      onClick={() => toggleService(s.id)}>
                      <div className="service-info">
                        <span className="service-name">{s.name}</span>
                        <span className="service-meta">⏱ {s.duration} min</span>
                      </div>
                      <span className="service-price">R$ {s.price.toFixed(2)}</span>
                      {selected && <div className="service-check">✓</div>}
                    </button>
                  );
                })}
              </div>
              {selectedServices.length > 0 && (
                <div className="services-summary">
                  <span>Total: <strong>{totalDuration} min</strong></span>
                  <span>Valor: <strong>R$ {totalPrice.toFixed(2)}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Pick date & time */}
          {step === 3 && (
            <div className="step-content">
              <h2 className="step-title">Escolha o Horário</h2>
              <p className="step-sub">Selecione a data e o melhor horário para você</p>
              <div className="date-picker-row">
                <label>Data do agendamento</label>
                <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
                  onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null); }} />
              </div>
              {selectedDate && (
                <>
                  <p className="slots-label">Horários disponíveis</p>
                  {availableSlots.length === 0 ? (
                    <div className="no-slots">Carregando horários...</div>
                  ) : (
                    <div className="slots-grid">
                      {availableSlots.map(slot => (
                        <button key={slot.time}
                          className={`slot ${!slot.available ? 'unavailable' : ''} ${selectedSlot === slot.time ? 'selected' : ''}`}
                          onClick={() => slot.available && setSelectedSlot(slot.time)}
                          disabled={!slot.available}>
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 4 — Confirm */}
          {step === 4 && (
            <div className="step-content">
              <h2 className="step-title">Confirmar Agendamento</h2>
              <p className="step-sub">Revise os detalhes antes de confirmar</p>
              <div className="confirm-card">
                <div className="confirm-row"><span>👤 Cliente</span><strong>{form.fullName}</strong></div>
                <div className="confirm-row"><span>💅 Profissional</span><strong>{pro?.name}</strong></div>
                <div className="confirm-row">
                  <span>🌸 Serviços</span>
                  <div className="confirm-services">
                    {selectedServices.map(id => {
                      const svc = services.find(s => s.id === id);
                      return <span key={id}>{svc?.name}</span>;
                    })}
                  </div>
                </div>
                <div className="confirm-row">
                  <span>📅 Data e Hora</span>
                  <strong>{selectedSlot ? new Date(selectedSlot).toLocaleString('pt-BR', { dateStyle:'long', timeStyle:'short' }) : ''}</strong>
                </div>
                <div className="confirm-row"><span>⏱ Duração</span><strong>{totalDuration} minutos</strong></div>
                <div className="confirm-row total-row"><span>💰 Total</span><strong>R$ {totalPrice.toFixed(2)}</strong></div>
              </div>

              {/* Mini Map */}
              <div className="map-section">
                <h3>📍 Nossa localização</h3>
                <p>{SALON_ADDRESS}</p>
                <div className="map-container">
                  <iframe
                    src={SALON_MAPS_EMBED}
                    width="100%" height="200" style={{ border: 0, borderRadius: 12 }}
                    allowFullScreen="" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização do salão"
                  />
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-msg">⚠ {error}</div>}

          <div className="booking-actions">
            {step > 0 && (
              <button className="btn-back" onClick={() => { setStep(step - 1); setError(''); }}>
                ← Voltar
              </button>
            )}
            <button className="btn-next" onClick={goNext} disabled={loading}>
              {loading ? <span className="spinner" /> : step === 4 ? '✓ Confirmar Agendamento' : 'Continuar →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
