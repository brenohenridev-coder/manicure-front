import './LicenseBlocked.css';

export default function LicenseBlocked() {
  return (
    <div className="blocked-page">
      <div className="blocked-card animate-fade">
        <div className="blocked-icon">🔒</div>
        <h1>Sistema Temporariamente Indisponível</h1>
        <p className="blocked-sub">
          O acesso ao sistema está suspenso devido a uma pendência financeira.
        </p>
        <div className="blocked-info">
          <span>📞</span>
          <div>
            <strong>Entre em contato com o suporte</strong>
            <p>Regularize o pagamento para restabelecer o acesso imediatamente.</p>
          </div>
        </div>
        <div className="blocked-badge">
          <span>💅</span> Studio Belle — Sistema de Agendamento
        </div>
      </div>
    </div>
  );
}
