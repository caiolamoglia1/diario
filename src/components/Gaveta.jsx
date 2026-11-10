/** faixa de papel no topo das seções: título + atalhos, numa linha só */
export function SectionStrip({ title, onBack, onGaveta, children }) {
  return (
    <header className="notes-strip section-strip">
      <span className="strip-day">{title}</span>
      {children}
      <span className="strip-dot" aria-hidden="true">·</span>
      <button className="strip-link" onClick={onGaveta}>
        🗝️ gaveta
      </button>
      <span className="strip-dot" aria-hidden="true">·</span>
      <button className="strip-link" onClick={onBack}>
        📖 voltar ao diário
      </button>
    </header>
  );
}

/** a gaveta da mesa: menu com todos os cantinhos do diário */
export function Gaveta({ onClose, onPick, badges }) {
  const items = [
    { id: 'bilhetes', icon: '💌', label: 'bilhetinhos do dia', badge: badges.notesToday },
    { id: 'cartas', icon: '✉️', label: 'cartas “abra quando…”', badge: badges.closedLetters },
    { id: 'pergunta', icon: '❓', label: 'pergunta do dia', badge: badges.questionPending ? '!' : null },
    { id: 'planos', icon: '📝', label: 'nossa lista e contagens' },
    { id: 'retro', icon: '📊', label: 'retrospectiva' },
    { id: 'busca', icon: '🔍', label: 'buscar' },
    { id: 'calendario', icon: '📅', label: 'calendário' },
    { id: 'atualizacoes', icon: '✦', label: 'atualizações', badge: badges.updates ? 'novo' : null }
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="gaveta" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="gaveta">
        <div className="gaveta-front">
          <span className="gaveta-knob" aria-hidden="true" />
          <h2>a gaveta</h2>
        </div>
        <div className="gaveta-inside">
          {items.map((item, i) => (
            <button key={item.id} className="gaveta-card" style={{ '--i': i }} onClick={() => onPick(item.id)}>
              <span className="gaveta-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="gaveta-label">{item.label}</span>
              {item.badge ? <span className="tab-badge">{item.badge}</span> : null}
            </button>
          ))}
        </div>
        <button className="link-btn gaveta-close" onClick={onClose}>
          fechar a gaveta
        </button>
      </div>
    </div>
  );
}
