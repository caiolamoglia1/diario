import { useMemo, useState } from 'react';
import { formatDate, questionFor } from '../lib/constants';

// busca sem acento e sem diferença de maiúsculas
const fold = text => (text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function snippet(text, query) {
  const folded = fold(text);
  const at = folded.indexOf(query);
  if (at < 0) return text.slice(0, 110);
  const start = Math.max(0, at - 40);
  const end = Math.min(text.length, at + query.length + 60);
  return (
    <>
      {start > 0 && '…'}
      {text.slice(start, at)}
      <mark>{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length, end)}
      {end < text.length && '…'}
    </>
  );
}

export default function SearchModal({ entries, notes, letters, answers, wishlist, onClose, onPick }) {
  const [query, setQuery] = useState('');
  const q = fold(query.trim());

  const results = useMemo(() => {
    if (q.length < 2) return [];
    const out = [];
    entries.forEach((e, index) => {
      const text = `${e.title ?? ''} ${e.content}`;
      if (fold(text).includes(q)) out.push({ key: `e${e.id}`, icon: '📖', date: e.entry_date, title: e.title || 'página do diário', text: e.content, go: { kind: 'entry', index } });
    });
    notes.forEach(n => {
      if (!n.sealed && fold(n.content).includes(q)) out.push({ key: `n${n.id}`, icon: '💌', date: n.note_date, title: 'bilhetinho', text: n.content, go: { kind: 'notes', date: n.note_date } });
    });
    letters.forEach(l => {
      if (fold(`${l.prompt} ${l.content}`).includes(q)) out.push({ key: `l${l.id}`, icon: '✉️', date: l.created_at.slice(0, 10), title: `abra quando ${l.prompt}`, text: l.content, go: { kind: 'cartas' } });
    });
    answers.forEach(a => {
      if (fold(a.answer).includes(q)) out.push({ key: `a${a.question_date}${a.user_id}`, icon: '❓', date: a.question_date, title: questionFor(a.question_date), text: a.answer, go: { kind: 'pergunta' } });
    });
    wishlist.forEach(w => {
      if (fold(w.title).includes(q)) out.push({ key: `w${w.id}`, icon: '📝', date: w.created_at.slice(0, 10), title: 'nossa lista', text: w.title, go: { kind: 'planos' } });
    });
    return out.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 40);
  }, [q, entries, notes, letters, answers, wishlist]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-card" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="buscar">
        <input
          className="search-input"
          type="search"
          placeholder="🔍 procurar uma lembrança… (praia, pizza, aniversário)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          autoFocus
        />
        <div className="search-results">
          {q.length < 2 ? (
            <p className="muted">digite pelo menos 2 letras</p>
          ) : results.length === 0 ? (
            <p className="muted">nada encontrado com “{query.trim()}” 🥺</p>
          ) : (
            results.map(r => (
              <button key={r.key} className="search-result" onClick={() => onPick(r.go)}>
                <span className="sr-icon" aria-hidden="true">
                  {r.icon}
                </span>
                <span className="sr-body">
                  <span className="sr-title">
                    {r.title} <small>· {formatDate(r.date)}</small>
                  </span>
                  <span className="sr-text">{snippet(r.text, q)}</span>
                </span>
              </button>
            ))
          )}
        </div>
        <p className="search-foot muted">
          {results.length > 0 && `${results.length} ${results.length === 1 ? 'lembrança' : 'lembranças'} · `}cartas fechadas e bilhetes lacrados não
          entram na busca
        </p>
      </div>
    </div>
  );
}
