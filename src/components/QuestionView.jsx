import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatDate, questionFor, shiftDate, todayISO } from '../lib/constants';
import { SectionStrip } from './Gaveta';
import { MissingSql } from './LettersView';

function AnswerForm({ date, userId, initial, onSaved, onCancel }) {
  const [text, setText] = useState(initial ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    const { error: err } = await supabase.from('answers').upsert({ question_date: date, user_id: userId, answer: text.trim() });
    setBusy(false);
    if (err) setError(err.message);
    else onSaved();
  }

  return (
    <form className="answer-form" onSubmit={save}>
      <textarea
        className="lined answer-input"
        placeholder="sua resposta…"
        value={text}
        maxLength={2000}
        onChange={e => setText(e.target.value)}
        autoFocus
        required
      />
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="link-btn" onClick={onCancel}>
            cancelar
          </button>
        )}
        <button className="wax-btn" disabled={busy || !text.trim()}>
          {busy ? 'guardando…' : 'responder'}
        </button>
      </div>
    </form>
  );
}

export default function QuestionView({ me, profiles, answers, answeredBy, missing, onChanged, onBack, onGaveta }) {
  const today = todayISO();
  const [date, setDate] = useState(today);
  const [editing, setEditing] = useState(false);
  const partner = profiles.find(p => p.id !== me.id);

  const mine = answers.find(a => a.question_date === date && a.user_id === me.id);
  const theirs = answers.find(a => a.question_date === date && a.user_id !== me.id);
  const theyAnswered = answeredBy.some(a => a.question_date === date && a.user_id !== me.id);

  // dias anteriores em que os dois responderam (o banco só entrega a do outro se você respondeu)
  const history = useMemo(() => {
    const days = [...new Set(answers.map(a => a.question_date))].filter(d => d !== date).sort().reverse();
    return days
      .map(d => ({
        date: d,
        mine: answers.find(a => a.question_date === d && a.user_id === me.id),
        theirs: answers.find(a => a.question_date === d && a.user_id !== me.id)
      }))
      .filter(h => h.mine && h.theirs)
      .slice(0, 6);
  }, [answers, date, me.id]);

  return (
    <section className="section-view">
      <SectionStrip title="❓ pergunta do dia" onBack={onBack} onGaveta={onGaveta}>
        <span className="strip-dot" aria-hidden="true">·</span>
        <button className="strip-link" onClick={() => setDate(shiftDate(date, -1))} aria-label="dia anterior">
          ‹
        </button>
        <span className="strip-small">{date === today ? 'hoje' : formatDate(date)}</span>
        <button className="strip-link" onClick={() => setDate(shiftDate(date, 1))} disabled={date >= today} aria-label="próximo dia">
          ›
        </button>
      </SectionStrip>

      {missing ? (
        <MissingSql />
      ) : (
        <div className="question-layout">
          <div className="paper-sheet question-sheet">
            <p className="eyebrow">{formatDate(date)}</p>
            <h2 className="question-text">“{questionFor(date)}”</h2>

            <div className="answer-block">
              <h4>
                {me.emoji} {me.name}
              </h4>
              {mine && !editing ? (
                <>
                  <p className="answer-text">{mine.answer}</p>
                  <button className="link-btn tiny" onClick={() => setEditing(true)}>
                    editar minha resposta
                  </button>
                </>
              ) : (
                <AnswerForm
                  key={`${date}-${editing}`}
                  date={date}
                  userId={me.id}
                  initial={mine?.answer}
                  onCancel={editing ? () => setEditing(false) : null}
                  onSaved={() => {
                    setEditing(false);
                    onChanged();
                  }}
                />
              )}
            </div>

            {partner && (
              <div className="answer-block partner">
                <h4>
                  {partner.emoji} {partner.name}
                </h4>
                {theirs ? (
                  <p className="answer-text">{theirs.answer}</p>
                ) : theyAnswered ? (
                  <p className="answer-locked">🔒 {partner.name} já respondeu — responda para ver a resposta 💭</p>
                ) : (
                  <p className="muted">{partner.name} ainda não respondeu</p>
                )}
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="paper-sheet history-sheet">
              <h3>respostas anteriores</h3>
              {history.map(h => (
                <button key={h.date} className="history-item" onClick={() => setDate(h.date)}>
                  <small>{formatDate(h.date)}</small>
                  <strong>{questionFor(h.date)}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
