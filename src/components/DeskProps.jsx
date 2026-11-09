// Ilustrações em SVG dos objetos da mesa.
// Gradientes compartilhados ficam em <SvgDefs/> (renderizado uma vez na mesa).

export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {/* folhas: claro na base, escuro na ponta */}
        <linearGradient id="g-leaf-a" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a9c27c" />
          <stop offset="1" stopColor="#6f8c48" />
        </linearGradient>
        <linearGradient id="g-leaf-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#97b46b" />
          <stop offset="1" stopColor="#5e7a3c" />
        </linearGradient>
        <linearGradient id="g-succ" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#b9d8a3" />
          <stop offset="0.6" stopColor="#86ad72" />
          <stop offset="1" stopColor="#c98a8f" />
        </linearGradient>
        <linearGradient id="g-succ-in" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#d6ecc4" />
          <stop offset="1" stopColor="#97c182" />
        </linearGradient>
        <radialGradient id="g-petal-0" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#e597a2" />
          <stop offset="1" stopColor="#a84858" />
        </radialGradient>
        <radialGradient id="g-petal-1" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f2b3bd" />
          <stop offset="1" stopColor="#c46a7a" />
        </radialGradient>
        <radialGradient id="g-petal-2" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#d4707f" />
          <stop offset="1" stopColor="#8f3446" />
        </radialGradient>
        <linearGradient id="g-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf6" />
          <stop offset="0.85" stopColor="#f6eedf" />
          <stop offset="1" stopColor="#e9dcc6" />
        </linearGradient>
        <linearGradient id="g-pen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e597ab" />
          <stop offset="0.35" stopColor="#fbd3dd" />
          <stop offset="1" stopColor="#d9849b" />
        </linearGradient>
        <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dc95" />
          <stop offset="0.5" stopColor="#d6aa52" />
          <stop offset="1" stopColor="#a87d2c" />
        </linearGradient>
        <linearGradient id="g-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a5130" />
          <stop offset="0.4" stopColor="#c08454" />
          <stop offset="1" stopColor="#7a4426" />
        </linearGradient>
        {/* Morro */}
        <linearGradient id="g-black-candle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0d0c10" />
          <stop offset="0.3" stopColor="#3a3842" />
          <stop offset="0.55" stopColor="#1b1a20" />
          <stop offset="1" stopColor="#08080b" />
        </linearGradient>
        <linearGradient id="g-old-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2c98e" />
          <stop offset="0.5" stopColor="#b08f52" />
          <stop offset="1" stopColor="#6e5428" />
        </linearGradient>
        <radialGradient id="g-dark-cup" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#4a4852" />
          <stop offset="0.6" stopColor="#24232a" />
          <stop offset="1" stopColor="#131217" />
        </radialGradient>
        <radialGradient id="g-tea" cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#8a5530" />
          <stop offset="1" stopColor="#3a1f10" />
        </radialGradient>
        <radialGradient id="g-rose" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#8e2a40" />
          <stop offset="1" stopColor="#3b0d18" />
        </radialGradient>
        <linearGradient id="g-old-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efe4c8" />
          <stop offset="0.7" stopColor="#ddcca6" />
          <stop offset="1" stopColor="#b79c6c" />
        </linearGradient>
        <linearGradient id="g-moor-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8d98a6" />
          <stop offset="1" stopColor="#c4c6c2" />
        </linearGradient>
        <radialGradient id="g-flame-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffd28a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* =========================================================
   Tema aconchego
   ========================================================= */

export function Mug() {
  return (
    <svg viewBox="0 0 240 230" className="svg-prop">
      <defs>
        <radialGradient id="coffee" cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#c08a5a" />
          <stop offset="0.7" stopColor="#8f5a35" />
          <stop offset="1" stopColor="#5e3620" />
        </radialGradient>
        <radialGradient id="cupbody" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fffcf6" />
          <stop offset="0.7" stopColor="#f1e3cf" />
          <stop offset="1" stopColor="#d9c3a5" />
        </radialGradient>
        <radialGradient id="doily" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#fbf5ea" />
          <stop offset="1" stopColor="#eadbc3" />
        </radialGradient>
      </defs>
      {/* paninho de crochê */}
      <circle cx="112" cy="122" r="100" fill="url(#doily)" />
      <circle cx="112" cy="122" r="100" fill="none" stroke="#f3e8d6" strokeWidth="16" strokeDasharray="0.1 15.7" strokeLinecap="round" />
      <circle cx="112" cy="122" r="88" fill="none" stroke="#dcc8a9" strokeWidth="2" strokeDasharray="3 5" />
      <circle cx="112" cy="122" r="78" fill="none" stroke="#e3d2b6" strokeWidth="6" strokeDasharray="0.1 9" strokeLinecap="round" />
      {/* sombra da xícara no paninho */}
      <ellipse cx="124" cy="128" rx="70" ry="66" fill="#6b4a2c" opacity="0.18" />
      {/* alça */}
      <path d="M168 88 q42 -6 44 30 q2 34 -40 32" fill="none" stroke="#cdb593" strokeWidth="18" strokeLinecap="round" />
      <path d="M168 88 q42 -6 44 30 q2 34 -40 32" fill="none" stroke="#f7ecdc" strokeWidth="9" strokeLinecap="round" />
      <path d="M176 86 q30 -2 32 22" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
      {/* xícara */}
      <circle cx="110" cy="112" r="68" fill="url(#cupbody)" stroke="#d6bf9f" strokeWidth="2" />
      <circle cx="110" cy="108" r="58" fill="#fdf8f0" />
      <circle cx="110" cy="108" r="58" fill="none" stroke="#e6d4ba" strokeWidth="4" />
      <circle cx="110" cy="108" r="49" fill="url(#coffee)" />
      <circle cx="110" cy="108" r="49" fill="none" stroke="#3e2414" strokeOpacity="0.35" strokeWidth="4" />
      {/* coração de espuma */}
      <path d="M110 132 C 86 116 80 100 90 92 C 98 86 106 90 110 97 C 114 90 122 86 130 92 C 140 100 134 116 110 132 Z" fill="#f4e2c8" />
      <path d="M110 124 C 96 114 93 104 99 99 C 104 96 108 99 110 103 C 112 99 116 96 121 99 C 127 104 124 114 110 124 Z" fill="#e3c19a" opacity="0.75" />
      <path d="M92 96 C 96 92 102 92 106 96" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* brilho na borda */}
      <path d="M62 82 A 58 58 0 0 1 104 50" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M160 150 A 68 68 0 0 1 120 179" stroke="#b89c78" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M110 176 c-7 -5 -9 -10 -6 -13 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c3 3 1 8 -6 13z" fill="#d98a8f" />
    </svg>
  );
}

export function Vine({ flip = false }) {
  const leaves = [[30, 40, -40], [52, 70, 30], [62, 100, -35], [86, 122, 25], [96, 154, -30], [120, 170, 35], [128, 200, -20]];
  return (
    <svg viewBox="0 0 160 230" className="svg-prop" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M20 10 C 50 60 60 110 100 150 S 140 210 140 228" fill="none" stroke="#56692f" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M21 10 C 50 60 60 110 100 150" fill="none" stroke="#9db36d" strokeWidth="1" strokeLinecap="round" />
      {leaves.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 0 C 10 -18 34 -18 42 0 C 34 18 10 18 0 0 Z" fill={`url(#g-leaf-${i % 2 ? 'b' : 'a'})`} />
          <path d="M0 0 C 10 18 34 18 42 0 C 30 8 12 8 0 0 Z" fill="#3f5524" opacity="0.25" />
          <path d="M2 0 L 38 0" stroke="#4f6a2c" strokeWidth="1.2" />
          <path d="M8 -6 C 16 -11 26 -11 32 -7" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

export function Succulent() {
  const outer = Array.from({ length: 10 }, (_, i) => i * 36);
  const inner = Array.from({ length: 7 }, (_, i) => i * 51 + 20);
  return (
    <svg viewBox="0 0 200 200" className="svg-prop">
      <defs>
        <radialGradient id="pot" cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#fffbf5" />
          <stop offset="0.75" stopColor="#ecdfcd" />
          <stop offset="1" stopColor="#cdb89a" />
        </radialGradient>
        <radialGradient id="soil" cx="50%" cy="50%" r="50%">
          <stop offset="0.6" stopColor="#7a5a3e" />
          <stop offset="1" stopColor="#4a3220" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="108" r="78" fill="url(#pot)" stroke="#cbb492" strokeWidth="2" />
      <path d="M38 76 A 78 78 0 0 1 98 30" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
      {[0, 60, 120, 180, 240, 300].map(a => (
        <g key={a} transform={`rotate(${a} 100 108) translate(100 40)`}>
          <path d="M0 0 c-5 -4 -7 -8 -4 -10 c2 -1 3 0 4 1 c1 -1 2 -2 4 -1 c3 2 1 6 -4 10z" fill="#e2a0a3" />
        </g>
      ))}
      <circle cx="100" cy="104" r="62" fill="url(#soil)" />
      {outer.map(a => (
        <g key={`o${a}`} transform={`rotate(${a} 100 104)`}>
          <path d="M100 104 C 86 80 92 52 100 40 C 108 52 114 80 100 104 Z" fill="url(#g-succ)" stroke="#5f8452" strokeWidth="1" />
          <path d="M100 100 C 104 82 104 60 100 44" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" fill="none" />
          <path d="M100 104 C 112 80 110 60 102 42 C 108 60 106 82 100 104 Z" fill="#2e4a24" opacity="0.25" />
        </g>
      ))}
      {inner.map(a => (
        <path key={`i${a}`} d="M100 104 C 90 88 94 70 100 62 C 106 70 110 88 100 104 Z" fill="url(#g-succ-in)" stroke="#7aa067" strokeWidth="1" transform={`rotate(${a} 100 104)`} />
      ))}
      <circle cx="100" cy="104" r="8" fill="#d7ecc6" />
    </svg>
  );
}

export function Candle() {
  return (
    <svg viewBox="0 0 160 190" className="svg-prop candle-svg">
      <defs>
        <linearGradient id="glass" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0.06" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id="wax" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="1" stopColor="#e8cf9f" />
        </radialGradient>
      </defs>
      <circle className="candle-halo" cx="80" cy="70" r="78" fill="url(#g-flame-glow)" />
      <rect x="24" y="74" width="112" height="96" rx="14" fill="#f9eedb" />
      <rect x="24" y="100" width="112" height="70" rx="12" fill="#ffd9a0" opacity="0.25" />
      <rect x="24" y="74" width="112" height="96" rx="14" fill="url(#glass)" stroke="#dcc8a6" strokeWidth="2" />
      <ellipse cx="80" cy="74" rx="56" ry="20" fill="#fbf2df" stroke="#e0cfae" strokeWidth="2" />
      <ellipse cx="80" cy="76" rx="44" ry="14" fill="url(#wax)" />
      <ellipse cx="80" cy="78" rx="18" ry="5" fill="#ffefc4" />
      <line x1="80" y1="74" x2="80" y2="58" stroke="#3e2818" strokeWidth="2.5" strokeLinecap="round" />
      <g className="flame">
        <path d="M80 18 C 92 36 94 50 80 60 C 66 50 68 36 80 18 Z" fill="#ffad3d" />
        <path d="M80 30 C 88 42 88 50 80 57 C 72 50 72 42 80 30 Z" fill="#ffe08a" />
        <path d="M80 40 C 84 46 84 51 80 55 C 76 51 76 46 80 40 Z" fill="#fffbe8" />
      </g>
      <rect x="40" y="112" width="80" height="26" rx="4" fill="#d8b98c" opacity="0.9" />
      <rect x="40" y="132" width="80" height="6" rx="2" fill="#a88558" opacity="0.4" />
      <path d="M80 130 c-6 -4 -8 -8 -5 -11 c2 -2 4 -1 5 1 c1 -2 3 -3 5 -1 c3 3 1 7 -5 11z" fill="#b5546a" />
      <path d="M32 86 L32 160" stroke="#fff" strokeOpacity="0.75" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Petal({ hue = 0, dark = false }) {
  return (
    <svg viewBox="0 0 60 50" className="svg-prop">
      <path d="M30 47 C 12 40 3 24 9 12 C 14 3 24 4 30 13 C 36 4 46 3 51 12 C 57 24 48 40 30 47 Z" fill={dark ? 'url(#g-rose)' : `url(#g-petal-${hue % 3})`} />
      <path d="M30 47 C 44 40 52 26 50 14 C 46 30 38 40 30 47 Z" fill="#5a1626" opacity="0.25" />
      <path d="M30 44 C 22 36 18 26 20 16" stroke="#fff" strokeOpacity="0.3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Star({ color = '#f1c75b' }) {
  return (
    <svg viewBox="0 0 40 40" className="svg-prop">
      <path d="M20 3 L24.5 14.5 L37 15.5 L27.5 23.5 L30.5 36 L20 29.5 L9.5 36 L12.5 23.5 L3 15.5 L15.5 14.5 Z" fill={color} stroke="#c8932c" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 8 L22.5 15 L20 22 Z" fill="#fff" opacity="0.45" />
    </svg>
  );
}

export function DriedLeaf() {
  return (
    <svg viewBox="0 0 120 100" className="svg-prop">
      <g fill="#d3a273" stroke="#9c6a40" strokeWidth="1.5">
        <path d="M60 52 C 40 20 10 18 6 34 C 2 50 30 62 60 52 Z" />
        <path d="M60 52 C 80 20 110 18 114 34 C 118 50 90 62 60 52 Z" />
        <path d="M60 54 C 44 70 28 88 40 92 C 52 96 60 74 60 54 Z" />
        <path d="M60 54 C 76 70 92 88 80 92 C 68 96 60 74 60 54 Z" />
      </g>
      <g fill="#7a4c2a" opacity="0.22">
        <path d="M60 52 C 40 46 22 48 8 40 C 20 58 42 60 60 52 Z" />
        <path d="M60 52 C 80 46 98 48 112 40 C 100 58 78 60 60 52 Z" />
      </g>
      <g stroke="#fff3df" strokeOpacity="0.5" strokeWidth="1.5" fill="none">
        <path d="M54 46 C 40 32 24 28 14 30" />
        <path d="M66 46 C 80 32 96 28 106 30" />
      </g>
      <path d="M60 30 L60 80" stroke="#7a4a28" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Sprig() {
  return (
    <svg viewBox="0 0 110 150" className="svg-prop">
      <g stroke="#7a5a3a" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M55 145 C 52 110 40 70 24 30" />
        <path d="M55 145 C 56 104 58 64 60 18" />
        <path d="M55 145 C 60 110 74 72 92 36" />
      </g>
      {[[24, 30], [32, 52], [60, 18], [59, 44], [92, 36], [80, 60], [44, 80], [70, 86]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i % 3 ? 4 : 5.5} fill={i % 2 ? '#c99aa3' : '#b07480'} />
          <circle cx={x - 1.3} cy={y - 1.3} r={1.5} fill="#fff" opacity="0.5" />
        </g>
      ))}
      <path d="M44 112 L 68 104 M44 120 L 68 112" stroke="#d6b88f" strokeWidth="6" strokeLinecap="round" />
      <path d="M44 112 L 68 104" stroke="#f3dfbf" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Stamp() {
  return (
    <svg viewBox="0 0 150 130" className="svg-prop">
      <rect x="62" y="58" width="84" height="62" rx="10" fill="#e9dfe9" stroke="#bdaec0" strokeWidth="2" />
      <rect x="70" y="66" width="34" height="46" rx="5" fill="#d9879a" />
      <rect x="106" y="66" width="32" height="46" rx="5" fill="#8fb4d9" />
      <rect x="70" y="66" width="68" height="10" rx="5" fill="#fff" opacity="0.25" />
      <ellipse cx="54" cy="72" rx="34" ry="16" fill="#5e3820" opacity="0.4" />
      <ellipse cx="54" cy="70" rx="34" ry="16" fill="#8a5432" />
      <rect x="34" y="34" width="40" height="38" fill="url(#g-wood)" />
      <ellipse cx="54" cy="34" rx="20" ry="8" fill="#c58a5a" />
      <circle cx="54" cy="18" r="16" fill="url(#g-wood)" />
      <circle cx="49" cy="13" r="5" fill="#e0b48a" />
    </svg>
  );
}

export function Polaroid() {
  return (
    <svg viewBox="0 0 190 220" className="svg-prop">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6c9d4" />
          <stop offset="1" stopColor="#d5c4ef" />
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="172" height="200" rx="4" fill="url(#g-paper)" />
      <rect x="22" y="24" width="144" height="134" fill="url(#sky)" />
      <circle cx="140" cy="54" r="14" fill="#fff4d2" opacity="0.9" />
      <path d="M22 140 C 60 122 110 128 166 136 L 166 158 L 22 158 Z" fill="#b9d6a5" />
      <text x="64" y="128" fontSize="44" textAnchor="middle">🐻</text>
      <text x="124" y="128" fontSize="44" textAnchor="middle">🐰</text>
      <path d="M94 84 c-9 -6 -11 -12 -7 -16 c3 -3 6 -1 7 1 c1 -2 4 -4 7 -1 c4 4 2 10 -7 16z" fill="#e05f7e" />
      <rect x="22" y="24" width="144" height="134" fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="3" />
      <text x="94" y="194" fontSize="22" textAnchor="middle" fill="#7d6352" fontFamily="Dancing Script, cursive">nós</text>
      <g transform="rotate(-8 100 10)">
        <rect x="64" y="-2" width="70" height="22" fill="#f7b6c2" opacity="0.9" />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect key={i} x={64 + i * 12} y="-2" width="6" height="22" fill={['#ffe08a', '#a8d8c4', '#c7b5ec'][i % 3]} opacity="0.85" />
        ))}
      </g>
    </svg>
  );
}

export function Note() {
  return (
    <svg viewBox="0 0 190 190" className="svg-prop">
      <path
        d="M14 22 L178 16 L182 170 L170 176 L160 170 L148 178 L136 171 L122 178 L110 171 L96 178 L84 170 L70 177 L58 170 L44 178 L32 171 L18 176 Z"
        fill="url(#g-paper)"
      />
      {[60, 84, 108, 132, 156].map(y => (
        <line key={y} x1="24" y1={y} x2="172" y2={y - 2} stroke="#e2d4be" strokeWidth="1.2" />
      ))}
      {/* cantinho dobrado */}
      <path d="M178 16 L182 52 L150 18 Z" fill="#e3d3b8" />
      <path d="M150 18 L182 52 L178 16 Z" fill="#000" opacity="0.06" />
      <text x="98" y="108" fontSize="34" textAnchor="middle" fill="#3d2b24" fontFamily="Dancing Script, cursive">te amo</text>
      <path d="M98 140 c-8 -5 -10 -11 -6 -14 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c4 3 2 9 -6 14z" fill="#c4505f" />
      <g transform="rotate(-6 96 18)">
        <rect x="52" y="6" width="90" height="24" fill="#f3a7b5" opacity="0.92" />
        {[0, 1, 2, 3].map(i => (
          <path key={i} transform={`translate(${66 + i * 20} 18)`} d="M0 3 c-5 -3 -6 -7 -4 -9 c2 -1 3 0 4 1 c1 -1 2 -2 4 -1 c2 2 1 6 -4 9z" fill="#fff" opacity="0.8" />
        ))}
      </g>
    </svg>
  );
}

export function Pen() {
  return (
    <svg viewBox="0 0 60 230" className="svg-prop">
      <path d="M30 228 L22 196 L38 196 Z" fill="#f2d3a8" />
      <path d="M30 228 L22 196 L28 196 Z" fill="#fff" opacity="0.35" />
      <path d="M30 228 L27 214 L33 214 Z" fill="#5b3c2e" />
      <rect x="20" y="70" width="20" height="128" rx="6" fill="url(#g-pen)" />
      <rect x="18" y="62" width="24" height="14" rx="4" fill="url(#g-gold)" />
      <rect x="18" y="190" width="24" height="8" rx="3" fill="url(#g-gold)" />
      <rect x="36" y="80" width="5" height="54" rx="2.5" fill="url(#g-gold)" />
      <circle cx="30" cy="50" r="10" fill="url(#g-gold)" />
      <path d="M30 46 c-16 -10 -20 -22 -12 -28 c5 -4 10 -1 12 3 c2 -4 7 -7 12 -3 c8 6 4 18 -12 28z" fill="#ec8ca2" stroke="#c9607c" strokeWidth="2" />
      <ellipse cx="23" cy="24" rx="3.5" ry="2.2" fill="#fff" opacity="0.7" />
    </svg>
  );
}

export function HeartClips() {
  const clip = (color, x, y, r) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path
        d="M0 18 C -18 6 -20 -6 -12 -11 C -6 -14 -2 -10 0 -6 C 2 -10 6 -14 12 -11 C 20 -6 18 6 0 18 Z M0 10 C -10 3 -11 -3 -7 -6 C -4 -7 -2 -5 0 -2"
        fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-12 -9 C -6 -12 -3 -9 -1 -6" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 120 90" className="svg-prop">
      {clip('#d9a43a', 28, 50, -15)}
      {clip('#d97b92', 62, 34, 10)}
      {clip('#a99bd9', 92, 58, 25)}
    </svg>
  );
}

/* =========================================================
   Tema Morro dos Ventos Uivantes
   ========================================================= */

export function DarkTeacup() {
  return (
    <svg viewBox="0 0 240 220" className="svg-prop teacup-svg">
      {/* pires */}
      <ellipse cx="116" cy="124" rx="104" ry="92" fill="#1a191e" />
      <ellipse cx="116" cy="124" rx="104" ry="92" fill="none" stroke="url(#g-old-gold)" strokeWidth="2.5" />
      <ellipse cx="116" cy="124" rx="90" ry="78" fill="none" stroke="#3a3842" strokeWidth="2" />
      <ellipse cx="126" cy="132" rx="70" ry="64" fill="#000" opacity="0.35" />
      {/* alça */}
      <path d="M168 92 q40 -6 42 28 q2 32 -38 30" fill="none" stroke="#141318" strokeWidth="16" strokeLinecap="round" />
      <path d="M170 90 q34 -3 36 22" fill="none" stroke="#5b5866" strokeWidth="3" strokeLinecap="round" />
      {/* xícara */}
      <circle cx="112" cy="114" r="66" fill="url(#g-dark-cup)" />
      <circle cx="112" cy="110" r="56" fill="#2d2c33" />
      <circle cx="112" cy="110" r="56" fill="none" stroke="url(#g-old-gold)" strokeWidth="2.5" />
      <circle cx="112" cy="110" r="47" fill="url(#g-tea)" />
      <circle cx="112" cy="110" r="47" fill="none" stroke="#000" strokeOpacity="0.4" strokeWidth="5" />
      <ellipse cx="96" cy="92" rx="14" ry="5" fill="#fff" opacity="0.18" transform="rotate(-30 96 92)" />
      <path d="M58 86 A 56 56 0 0 1 100 54" stroke="#8f8b9c" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* vapor */}
      <g className="steam" fill="none" stroke="#dfe6ef" strokeLinecap="round" strokeWidth="5">
        <path d="M100 96 C 88 76 112 64 100 40" />
        <path d="M122 98 C 110 78 134 66 122 42" />
      </g>
    </svg>
  );
}

export function BlackCandle() {
  return (
    <svg viewBox="0 0 120 300" className="svg-prop candle-svg">
      <circle className="candle-halo" cx="60" cy="46" r="58" fill="url(#g-flame-glow)" />
      {/* castiçal */}
      <ellipse cx="60" cy="284" rx="50" ry="13" fill="#5a4626" />
      <ellipse cx="60" cy="280" rx="50" ry="13" fill="url(#g-old-gold)" />
      <path d="M44 280 C 46 262 52 256 52 246 L68 246 C 68 256 74 262 76 280 Z" fill="url(#g-old-gold)" />
      <ellipse cx="60" cy="246" rx="22" ry="6" fill="url(#g-old-gold)" />
      {/* vela */}
      <rect x="47" y="70" width="26" height="178" rx="3" fill="url(#g-black-candle)" />
      <path d="M47 76 C 47 90 52 96 52 108 C 52 116 56 116 56 104 L56 72 Z" fill="#26252c" />
      <path d="M73 74 C 73 84 69 88 69 98 C 69 104 66 104 66 96 L66 72 Z" fill="#1f1e24" />
      <ellipse cx="60" cy="71" rx="13" ry="4" fill="#3c3a44" />
      <path d="M53 90 L53 240" stroke="#9fb4cc" strokeOpacity="0.25" strokeWidth="2" />
      <line x1="60" y1="70" x2="60" y2="56" stroke="#1a1410" strokeWidth="2.5" strokeLinecap="round" />
      <g className="flame">
        <path d="M60 14 C 70 30 72 44 60 54 C 48 44 50 30 60 14 Z" fill="#ffa63d" />
        <path d="M60 26 C 66 36 66 44 60 51 C 54 44 54 36 60 26 Z" fill="#ffe08a" />
        <path d="M60 36 C 63 41 63 46 60 49 C 57 46 57 41 60 36 Z" fill="#fffbe8" />
      </g>
    </svg>
  );
}

function Rose({ x, y, s = 1, r = 0 }) {
  const outer = [0, 60, 120, 180, 240, 300];
  const inner = [30, 120, 210, 300];
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <circle r="21" fill="#2c0812" />
      {outer.map((a, i) => (
        <path key={a} d="M0 0 C -14 -6 -14 -24 0 -26 C 14 -24 14 -6 0 0 Z" transform={`rotate(${a})`}
          fill={i % 2 ? '#5a1527' : '#6e1d31'} stroke="#2c0812" strokeWidth="1" />
      ))}
      {outer.map(a => (
        <path key={`h${a}`} d="M-8 -20 C -4 -24 4 -24 8 -20" transform={`rotate(${a})`} stroke="#b3485f" strokeOpacity="0.55" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ))}
      {inner.map(a => (
        <path key={`i${a}`} d="M0 0 C -9 -4 -9 -15 0 -16 C 9 -15 9 -4 0 0 Z" transform={`rotate(${a})`} fill="#7e2438" stroke="#3b0d18" strokeWidth="1" />
      ))}
      <path d="M-1 -7 C 6 -7 7 1 3 4 C -1 7 -7 4 -6 -1 C -5 -4 -2 -5 1 -3" stroke="#2c0812" strokeWidth="1.8" fill="#5a1527" strokeLinecap="round" />
    </g>
  );
}

export function DriedRoses() {
  return (
    <svg viewBox="0 0 230 200" className="svg-prop">
      <g stroke="#3b2a1e" strokeWidth="3.5" fill="none" strokeLinecap="round">
        <path d="M30 190 C 70 150 110 120 170 60" />
        <path d="M40 196 C 90 170 130 150 196 120" />
        <path d="M24 186 C 50 130 70 90 80 40" />
      </g>
      {/* espinhos */}
      <g fill="#3b2a1e">
        {[[70, 152, 30], [110, 120, -150], [140, 92, 30], [100, 168, 90], [150, 144, -90], [56, 112, 180], [70, 76, 0]].map(([x, y, r], i) => (
          <path key={i} d="M0 0 L8 -3 L0 -10 Z" transform={`translate(${x} ${y}) rotate(${r})`} />
        ))}
      </g>
      {/* folhas secas */}
      <g fill="#5b6352">
        <path d="M120 112 C 130 92 152 92 156 100 C 146 112 130 116 120 112 Z" />
        <path d="M90 160 C 96 140 116 136 122 142 C 114 156 100 162 90 160 Z" />
        <path d="M66 96 C 52 82 54 62 62 60 C 70 72 72 86 66 96 Z" />
      </g>
      <g stroke="#7d856f" strokeWidth="1" fill="none" opacity="0.7">
        <path d="M122 110 C 134 102 146 100 154 100" />
        <path d="M92 158 C 102 148 112 144 120 142" />
      </g>
      <Rose x={176} y={56} s={1.15} r={-20} />
      <Rose x={200} y={118} s={0.95} r={30} />
      <Rose x={80} y={36} s={0.85} r={10} />
    </svg>
  );
}

export function ThornBranch() {
  return (
    <svg viewBox="0 0 220 80" className="svg-prop">
      <path d="M4 60 C 60 50 110 30 216 14" stroke="#2f241b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M90 40 C 110 52 130 60 160 62" stroke="#2f241b" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g fill="#2f241b">
        {[[30, 55, -20], [60, 49, 160], [96, 40, -20], [126, 32, 160], [160, 24, -20], [190, 19, 160], [130, 58, 70]].map(([x, y, r], i) => (
          <path key={i} d="M0 0 L7 -2 L0 -9 Z" transform={`translate(${x} ${y}) rotate(${r})`} />
        ))}
      </g>
    </svg>
  );
}

export function VintageKey() {
  return (
    <svg viewBox="0 0 200 110" className="svg-prop">
      <g fill="none" stroke="url(#g-old-gold)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="34" cy="36" r="12" />
        <circle cx="34" cy="74" r="12" />
        <circle cx="16" cy="55" r="12" />
        <path d="M44 55 L176 55" />
        <path d="M150 55 L150 78 M164 55 L164 72 M176 55 L176 82 L168 82" />
        <path d="M56 49 L56 61 M64 49 L64 61" />
      </g>
      <path d="M44 52 L176 52" stroke="#f4e3b6" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="34" cy="55" r="8" fill="url(#g-old-gold)" />
      {/* fita */}
      <path d="M70 55 C 80 30 92 34 88 50 C 86 58 76 60 70 55 Z" fill="#6b1c2e" />
      <path d="M70 55 C 92 66 96 84 80 96" stroke="#6b1c2e" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M70 55 C 84 74 78 92 62 100" stroke="#521423" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function FadedPolaroid() {
  return (
    <svg viewBox="0 0 190 220" className="svg-prop">
      <rect x="8" y="10" width="172" height="200" rx="3" fill="#e4ded2" />
      <rect x="8" y="10" width="172" height="200" rx="3" fill="url(#g-old-paper)" opacity="0.35" />
      <rect x="22" y="24" width="144" height="134" fill="url(#g-moor-sky)" />
      {/* charneca e casa no morro */}
      <path d="M22 118 C 52 96 84 92 118 104 C 140 112 152 104 166 98 L166 158 L22 158 Z" fill="#6c7568" />
      <path d="M22 134 C 60 118 104 120 166 128 L166 158 L22 158 Z" fill="#525b50" />
      <path d="M58 102 L58 88 L66 82 L74 88 L74 102 Z" fill="#3a3a3e" />
      <rect x="74" y="92" width="16" height="10" fill="#3a3a3e" />
      <rect x="62" y="80" width="3" height="6" fill="#3a3a3e" />
      {/* árvore torta pelo vento */}
      <path d="M140 110 C 139 98 141 88 148 80" stroke="#2c2a2a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M134 84 C 140 70 160 68 166 76 C 168 82 158 88 146 88 C 140 88 134 88 134 84 Z" fill="#363733" />
      <path d="M146 80 C 154 76 162 76 166 76" stroke="#4a4c46" strokeWidth="1.5" fill="none" />
      <rect x="22" y="24" width="144" height="134" fill="#d8c8a8" opacity="0.25" />
      <rect x="22" y="24" width="144" height="134" fill="none" stroke="#000" strokeOpacity="0.15" strokeWidth="3" />
      <text x="94" y="194" fontSize="20" textAnchor="middle" fill="#5a4a40" fontFamily="Dancing Script, cursive">Haworth</text>
      <rect x="62" y="0" width="66" height="20" fill="#9a9a96" opacity="0.6" transform="rotate(6 95 10)" />
    </svg>
  );
}

export function CalligraphyNote() {
  return (
    <svg viewBox="0 0 220 180" className="svg-prop">
      <path d="M10 14 L206 8 L212 166 L14 172 Z" fill="url(#g-old-paper)" />
      <path d="M10 14 L206 8 L212 166 L14 172 Z" fill="none" stroke="#8a6a3e" strokeOpacity="0.45" strokeWidth="6" />
      <g fontFamily="Dancing Script, cursive" fill="#2a1d1a" textAnchor="middle" fontSize="17">
        <text x="110" y="52">Do que quer que sejam</text>
        <text x="110" y="78">feitas nossas almas,</text>
        <text x="110" y="104">a sua e a minha</text>
        <text x="110" y="130">são iguais.</text>
      </g>
      <text x="176" y="156" fontFamily="Dancing Script, cursive" fill="#6b1c2e" fontSize="15" textAnchor="middle">— E. Brontë</text>
      <circle cx="40" cy="150" r="13" fill="#6b1c2e" />
      <circle cx="40" cy="150" r="9" fill="none" stroke="#3d0d18" strokeWidth="1.5" />
      <path d="M40 154 c-4 -3 -5 -5 -3 -7 c1 -1 2 0 3 1 c1 -1 2 -2 3 -1 c2 2 1 4 -3 7z" fill="#3d0d18" />
    </svg>
  );
}

export function WindLeaf({ tone = 0 }) {
  const fills = ['#4a3a2a', '#6b4a30', '#5b6352'];
  return (
    <svg viewBox="0 0 40 24" className="svg-prop">
      <path d="M2 12 C 10 0 30 0 38 12 C 30 24 10 24 2 12 Z" fill={fills[tone % 3]} />
      <path d="M4 12 L 36 12" stroke="#000" strokeOpacity="0.3" strokeWidth="1" />
    </svg>
  );
}

/* =========================================================
   Detalhes do livro
   ========================================================= */

export function CornerOrnament({ className = '' }) {
  return (
    <svg viewBox="0 0 80 80" className={`corner-ornament ${className}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 70 C 6 30 30 6 70 6" />
        <path d="M14 46 C 22 40 26 30 24 22" />
        <path d="M46 14 C 40 22 30 26 22 24" />
      </g>
      <g fill="currentColor">
        <path d="M24 22 c-6 -2 -10 -8 -6 -12 c4 2 7 7 6 12z" />
        <path d="M22 24 c-2 -6 -8 -10 -12 -6 c2 4 7 7 12 6z" />
        <path className="orn-heart" d="M12 12 c-4 -3 -5 -6 -3 -8 c1 -1 3 0 3 1 c1 -1 2 -2 4 -1 c2 2 0 5 -4 8z" />
        <path className="orn-diamond" d="M12 3 L16 8 L12 13 L8 8 Z" />
        <circle cx="70" cy="6" r="2.2" />
        <circle cx="6" cy="70" r="2.2" />
      </g>
    </svg>
  );
}

export function Flourish() {
  return (
    <svg viewBox="0 0 120 20" className="flourish" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M60 10 C 48 2 38 18 26 10 C 18 5 10 10 4 10" />
        <path d="M60 10 C 72 2 82 18 94 10 C 102 5 110 10 116 10" />
      </g>
      <path className="orn-heart" d="M60 14 c-5 -3 -6 -7 -4 -9 c2 -1 3 0 4 1 c1 -1 2 -2 4 -1 c2 2 1 6 -4 9z" fill="currentColor" />
      <path className="orn-diamond" d="M60 3 L65 10 L60 17 L55 10 Z" fill="currentColor" />
    </svg>
  );
}

export function KeyCharm() {
  return (
    <svg viewBox="0 0 70 90" className="key-charm" aria-hidden="true">
      <circle cx="14" cy="8" r="6" fill="none" stroke="#d9b45e" strokeWidth="2.5" />
      <path d="M14 14 L14 26" stroke="#d9b45e" strokeWidth="2" />
      <path d="M14 58 c-12 -8 -15 -17 -9 -21 c4 -3 7 -1 9 2 c2 -3 5 -5 9 -2 c6 4 3 13 -9 21z" fill="#d6455e" stroke="#a8304a" strokeWidth="1.5" />
      <path d="M17 14 L40 40" stroke="#d9b45e" strokeWidth="2" />
      <g transform="translate(40 40) rotate(40)" fill="none" stroke="#e2c26f" strokeWidth="3" strokeLinecap="round">
        <circle cx="0" cy="0" r="6" />
        <path d="M0 6 L0 34 M0 26 L6 26 M0 32 L5 32" />
      </g>
    </svg>
  );
}

export function Keyhole() {
  return (
    <svg viewBox="0 0 20 20" className="keyhole" aria-hidden="true">
      <circle cx="10" cy="7.5" r="3.4" fill="#2a1408" />
      <path d="M8.2 9 L11.8 9 L12.8 16 L7.2 16 Z" fill="#2a1408" />
    </svg>
  );
}
