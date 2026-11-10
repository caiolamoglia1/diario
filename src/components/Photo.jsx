import { useEffect, useMemo, useRef } from 'react';
import { usePhotoUrl } from '../lib/photos';

/** foto colada com fita (mostra a partir do caminho no Storage) */
export function Photo({ path, className = '', onClick }) {
  const url = usePhotoUrl(path);
  if (!path) return null;
  return (
    <figure className={`taped-photo ${className}`} onClick={onClick}>
      <span className="photo-tape" aria-hidden="true" />
      {url ? <img src={url} alt="foto" loading="lazy" /> : <span className="photo-loading">♥</span>}
    </figure>
  );
}

/** escolher uma foto: mostra prévia da nova ou da que já existe, com opção de tirar */
export function PhotoPicker({ file, existingPath, onPick, onClear }) {
  const inputRef = useRef(null);
  const existingUrl = usePhotoUrl(file ? null : existingPath);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const shown = preview ?? existingUrl;

  return (
    <div className="photo-picker">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => {
          const picked = e.target.files?.[0];
          if (picked) onPick(picked);
          e.target.value = '';
        }}
      />
      {shown ? (
        <>
          <img className="photo-thumb" src={shown} alt="prévia da foto" />
          <button type="button" className="link-btn" onClick={() => inputRef.current.click()}>
            trocar
          </button>
          <button type="button" className="link-btn danger" onClick={onClear}>
            tirar foto
          </button>
        </>
      ) : (
        <button type="button" className="link-btn" onClick={() => inputRef.current.click()}>
          📷 colar uma foto
        </button>
      )}
    </div>
  );
}
