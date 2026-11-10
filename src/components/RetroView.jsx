import { useMemo, useState } from 'react';
import { MOODS, formatDate, todayISO } from '../lib/constants';
import { SectionStrip } from './Gaveta';
import { Photo } from './Photo';

const words = text => (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);

function periodLabel(mode, y, m) {
  if (mode === 'ano') return String(y);
  return new Date(y, m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function Stat({ value, label }) {
  return (
    <div className="stat-tile">
      <strong>{value.toLocaleString('pt-BR')}</strong>
      <span>{label}</span>
    </div>
  );
}

/** barras de humor: uma série só, uma cor, valor escrito ao lado (nunca só cor) */
function MoodBars({ counts }) {
  const max = Math.max(1, ...counts.map(c => c.count));
  return (
    <ul className="mood-bars" aria-label="humores do período">
      {counts.map(c => (
        <li key={c.emoji} title={`${c.label}: ${c.count} ${c.count === 1 ? 'página' : 'páginas'}`}>
          <span className="mood-bar-label">
            <span aria-hidden="true">{c.emoji}</span> {c.label}
          </span>
          <span className="mood-bar-track">
            <span className="mood-bar-fill" style={{ width: `${(c.count / max) * 100}%` }} />
          </span>
          <span className="mood-bar-value">{c.count}</span>
        </li>
      ))}
    </ul>
  );
}

export default function RetroView({ me, profiles, entries, notes, wishlist, answers, onOpenEntry, onBack, onGaveta }) {
  const today = todayISO();
  const [mode, setMode] = useState('mes');
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number);
    return { y, m: m - 1 };
  });
  const { y, m } = cursor;
  const prefix = mode === 'ano' ? `${y}-` : `${y}-${String(m + 1).padStart(2, '0')}-`;

  const move = delta =>
    setCursor(({ y: cy, m: cm }) => {
      if (mode === 'ano') return { y: cy + delta, m: cm };
      const d = new Date(cy, cm + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const stats = useMemo(() => {
    const inPeriod = d => d && d.startsWith(prefix);
    const pageList = entries.filter(e => inPeriod(e.entry_date));
    const noteList = notes.filter(n => inPeriod(n.note_date) && !n.sealed);
    const doneList = wishlist.filter(w => inPeriod(w.done_at?.slice(0, 10)));
    const moodCounts = MOODS.map(md => ({ ...md, count: pageList.filter(e => e.mood === md.emoji).length }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count);
    const byPerson = profiles.map(p => ({ ...p, pages: pageList.filter(e => e.author_id === p.id).length }));
    const loved = [...pageList].sort((a, b) => (b.reactions?.length ?? 0) - (a.reactions?.length ?? 0))[0];
    const photos = [...pageList, ...noteList, ...doneList].filter(x => x.photo_path).map(x => x.photo_path).slice(0, 9);
    return {
      pages: pageList.length,
      notes: noteList.length,
      words: pageList.reduce((sum, e) => sum + words(e.content), 0) + noteList.reduce((s, n) => s + words(n.content), 0),
      done: doneList.length,
      answers: answers.filter(a => inPeriod(a.question_date) && a.user_id === me.id).length,
      moodCounts,
      byPerson,
      loved: loved && (loved.reactions?.length ?? 0) > 0 ? loved : null,
      photos
    };
  }, [entries, notes, wishlist, answers, profiles, prefix, me.id]);

  // nesse dia, em anos anteriores
  const onThisDay = useMemo(() => {
    const md = today.slice(5);
    return entries
      .map((e, index) => ({ ...e, index }))
      .filter(e => e.entry_date.slice(5) === md && e.entry_date < today);
  }, [entries, today]);

  const empty = stats.pages + stats.notes + stats.done === 0;

  return (
    <section className="section-view">
      <SectionStrip title="📊 retrospectiva" onBack={onBack} onGaveta={onGaveta}>
        <span className="strip-dot" aria-hidden="true">·</span>
        <button className={`strip-link${mode === 'mes' ? ' strong' : ''}`} onClick={() => setMode('mes')}>
          mês
        </button>
        <button className={`strip-link${mode === 'ano' ? ' strong' : ''}`} onClick={() => setMode('ano')}>
          ano
        </button>
        <span className="strip-dot" aria-hidden="true">·</span>
        <button className="strip-link" onClick={() => move(-1)} aria-label="período anterior">
          ‹
        </button>
        <span className="strip-small">{periodLabel(mode, y, m)}</span>
        <button className="strip-link" onClick={() => move(1)} aria-label="próximo período">
          ›
        </button>
      </SectionStrip>

      <div className="section-columns">
        <div className="paper-sheet retro-sheet">
          <h3>{periodLabel(mode, y, m)}</h3>
          {empty ? (
            <p className="muted">nada escrito nesse período… ainda 💭</p>
          ) : (
            <>
              <div className="stat-row">
                <Stat value={stats.pages} label={stats.pages === 1 ? 'página' : 'páginas'} />
                <Stat value={stats.notes} label={stats.notes === 1 ? 'bilhete' : 'bilhetes'} />
                <Stat value={stats.words} label="palavras" />
                <Stat value={stats.done} label={stats.done === 1 ? 'sonho realizado' : 'sonhos realizados'} />
              </div>
              {stats.byPerson.length > 1 && (
                <p className="retro-line">
                  {stats.byPerson.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && ' · '}
                      {p.emoji} {p.name} escreveu {p.pages} {p.pages === 1 ? 'página' : 'páginas'}
                    </span>
                  ))}
                </p>
              )}
              {stats.moodCounts.length > 0 && (
                <>
                  <h4>como a gente se sentiu</h4>
                  <MoodBars counts={stats.moodCounts} />
                </>
              )}
              {stats.loved && (
                <p className="retro-line">
                  💗 a página mais amada: <strong>{stats.loved.title || formatDate(stats.loved.entry_date)}</strong> (
                  {stats.loved.reactions.length} {stats.loved.reactions.length === 1 ? 'reação' : 'reações'})
                </p>
              )}
            </>
          )}
        </div>

        <div className="paper-sheet retro-side">
          <h3>📜 nesse dia…</h3>
          {onThisDay.length === 0 ? (
            <p className="muted">nenhuma página escrita neste dia em anos anteriores… ainda 💭</p>
          ) : (
            <ul className="letter-list">
              {onThisDay.map(e => {
                const years = Number(today.slice(0, 4)) - Number(e.entry_date.slice(0, 4));
                return (
                  <li key={e.id}>
                    <button className="strip-link" onClick={() => onOpenEntry(e.index)}>
                      há {years} {years === 1 ? 'ano' : 'anos'}: {e.title || e.content.slice(0, 40)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {stats.photos.length > 0 && (
            <>
              <h3>📷 fotos do período</h3>
              <div className="retro-photos">
                {stats.photos.map(path => (
                  <Photo key={path} path={path} className="retro-photo" />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
