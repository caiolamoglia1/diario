import { useEffect } from 'react';
import { CHANGELOG, markUpdatesSeen } from '../lib/changelog';
import { formatDate } from '../lib/constants';
import { SectionStrip } from './Gaveta';

export default function UpdatesView({ onBack, onGaveta, onSeen }) {
  useEffect(() => {
    markUpdatesSeen();
    onSeen?.();
  }, [onSeen]);

  return (
    <section className="section-view">
      <SectionStrip title="✦ atualizações" onBack={onBack} onGaveta={onGaveta} />
      <div className="paper-sheet updates-sheet">
        <h3>o que chegou no nosso diário</h3>
        <ol className="updates">
          {CHANGELOG.map((u, i) => (
            <li key={u.version} className={i === 0 ? 'latest' : ''}>
              <header>
                <span className="update-version">v{u.version}</span>
                <strong>{u.title}</strong>
                <small>{formatDate(u.date)}</small>
                {i === 0 && <span className="tab-badge">novo</span>}
              </header>
              <ul>
                {u.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
