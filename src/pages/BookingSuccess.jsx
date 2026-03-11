import { useLocation, Link } from 'react-router-dom';
import './BookingSuccess.css';

export default function BookingSuccess() {
  const { state } = useLocation();

  return (
    <div className="success-page">
      <div className="success-card animate-fade">
        <div className="success-petals">
          <span>🌸</span><span>✨</span><span>🌺</span>
        </div>
        <div className="success-check">✓</div>
        <h1>Agendamento Confirmado!</h1>
        <p className="success-name">{state?.name || 'Obrigada pela preferência'} 💕</p>
        <p className="success-info">
          Seu agendamento foi realizado com sucesso.<br/>
          Aguardamos você em breve!
        </p>
        {state?.slot && (
          <div className="success-datetime">
            📅 {new Date(state.slot).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
          </div>
        )}
        <Link to="/" className="success-btn">Fazer outro agendamento</Link>
      </div>
    </div>
  );
}
