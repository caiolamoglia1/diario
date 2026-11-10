import { useMemo, useState } from 'react';
import { formatDate, specialDay, todayISO } from '../lib/constants';

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export default function Calendar({ entries, notes, togetherSince, startDate, onClose, onOpenEntry, onOpenNotes }) {
  const today = todayISO();
  const start = startDate ?? today;
  const [cursor, setCursor] = useState(() => {
    const [y, m] = start.split('-').map(Number);
    return { y, m: m - 1 };
  });
  const [picked, setPicked] = useState(start);

  const entriesByDay = useMemo(() => {
    const map = {};
    entries.forEach((e, index) => {
      (map[e.entry_date] ??= []).push(index);
    });
    return map;
  }, [entries]);

  const notesByDay = useMemo(() => {
    const map = {};
    notes.forEach(n => {
      map[n.note_date] = (map[n.note_date] ?? 0) + 1;
    });
    return map;
  }, [notes]);

  const { y, m } = cursor;
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthName = new Date(y, m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const move = delta =>
    setCursor(({ y: cy, m: cm }) => {
      const d = new Date(cy, cm + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const pickedEntries = entriesByDay[picked] ?? [];
  const pickedNotes = notesByDay[picked] ?? 0;
  const pickedSpecial = specialDay(togetherSince, picked);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="calendar-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="calendário">
        <header className="cal-head">
          <button className="strip-link" onClick={() => move(-1)} aria-label="mês anterior">
            ‹
          </button>
          <h2>{monthName}</h2>
          <button className="strip-link" onClick={() => move(1)} aria-label="próximo mês">
            ›
          </button>
        </header>

        <div className="cal-grid">
          {WEEK.map((w, i) => (
            <span key={`w${i}`} className="cal-week">
              {w}
            </span>
          ))}
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} />;
            const key = iso(y, m, day);
            const hasEntry = Boolean(entriesByDay[key]);
            const noteCount = notesByDay[key] ?? 0;
            const special = specialDay(togetherSince, key);
            return (
              <button
                key={key}
                className={`cal-day${key === today ? ' today' : ''}${key === picked ? ' picked' : ''}${special ? ' special' : ''}`}
                onClick={() => setPicked(key)}
                aria-label={`${formatDate(key)}${hasEntry ? ', tem página' : ''}${noteCount ? `, ${noteCount} bilhetes` : ''}`}
              >
                <span className="cal-num">{day}</span>
                <span className="cal-marks" aria-hidden="true">
                  {hasEntry && <span className="mark-entry">✎</span>}
                  {noteCount > 0 && <span className="mark-note">♥</span>}
                  {special && <span className="mark-special">✦</span>}
                </span>
              </button>
            );
          })}
        </div>

        <p className="cal-legend">
          <span className="mark-entry">✎</span> página · <span className="mark-note">♥</span> bilhetes ·{' '}
          <span className="mark-special">✦</span> data especial
        </p>

        <div className="cal-picked">
          <strong>{formatDate(picked)}</strong>
          {pickedSpecial && (
            <span className="cal-special-text">
              {pickedSpecial.kind === 'aniversario'
                ? `💞 ${pickedSpecial.years} ${pickedSpecial.years === 1 ? 'ano' : 'anos'} juntos`
                : `💞 ${pickedSpecial.months} ${pickedSpecial.months === 1 ? 'mês' : 'meses'} juntos`}
            </span>
          )}
          <div className="cal-actions">
            {pickedEntries.length > 0 && (
              <button className="strip-link strong" onClick={() => onOpenEntry(pickedEntries[0])}>
                📖 ler {pickedEntries.length > 1 ? `as ${pickedEntries.length} páginas` : 'a página'}
              </button>
            )}
            <button className="strip-link" onClick={() => onOpenNotes(picked)}>
              💌 {pickedNotes > 0 ? `ver ${pickedNotes} ${pickedNotes === 1 ? 'bilhete' : 'bilhetes'}` : 'deixar um bilhete'}
            </button>
          </div>
        </div>

        <button className="link-btn cal-close" onClick={onClose}>
          fechar
        </button>
      </div>
    </div>
  );
}
