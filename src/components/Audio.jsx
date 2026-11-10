import { useEffect, useMemo, useRef, useState } from 'react';
import { usePhotoUrl } from '../lib/photos';

const MAX_SECONDS = 60;

const audioSupported = typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;

function pickMime() {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  return options.find(type => window.MediaRecorder?.isTypeSupported?.(type)) ?? '';
}

/** grava um recadinho de voz de até 1 minuto */
export function AudioRecorder({ blob, onChange }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const recorderRef = useRef(null);
  const timerRef = useRef(0);
  const preview = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach(t => t.stop());
    },
    []
  );

  if (!audioSupported) return null;

  async function start() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
        setRecording(false);
        onChange(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      };
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= MAX_SECONDS && recorder.state === 'recording') recorder.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError('não deu para usar o microfone (permissão negada?)');
    }
  }

  const stop = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  return (
    <div className="audio-recorder">
      {recording ? (
        <button type="button" className="rec-btn recording" onClick={stop}>
          <span className="rec-dot" aria-hidden="true" /> gravando… {seconds}s — parar
        </button>
      ) : blob ? (
        <>
          <audio src={preview} controls preload="metadata" />
          <button type="button" className="link-btn" onClick={start}>
            regravar
          </button>
          <button type="button" className="link-btn danger" onClick={() => onChange(null)}>
            tirar
          </button>
        </>
      ) : (
        <button type="button" className="link-btn" onClick={start}>
          🎙️ gravar recadinho de voz
        </button>
      )}
      {error && <span className="error">{error}</span>}
    </div>
  );
}

/** toca um recadinho de voz guardado no Storage */
export function AudioPlayer({ path }) {
  const url = usePhotoUrl(path);
  if (!path) return null;
  return (
    <div className="audio-player">
      <span aria-hidden="true">🎙️</span>
      {url ? <audio src={url} controls preload="metadata" /> : <span className="muted">carregando…</span>}
    </div>
  );
}
