// Decoração de cada molde de capa (o fundo de cada uma fica no CSS: .cs-<id>)

/* ---------- Linho bordado ---------- */
export function FloralWreath() {
  const leaves = Array.from({ length: 18 }, (_, i) => i * 20);
  const flowers = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 200 200" className="cs-wreath" aria-hidden="true">
      <circle cx="100" cy="100" r="78" fill="none" stroke="#7d8f6a" strokeWidth="2" strokeDasharray="5 4" />
      {leaves.map(a => (
        <g key={a} transform={`rotate(${a} 100 100) translate(100 22)`}>
          <path d="M0 0 C 6 -6 14 -6 18 0 C 14 6 6 6 0 0 Z" fill="none" stroke="#6f8a5c" strokeWidth="1.8" strokeDasharray="2.5 1.8" />
        </g>
      ))}
      {flowers.map((a, i) => (
        <g key={a} transform={`rotate(${a + 10} 100 100) translate(100 22)`}>
          {[0, 72, 144, 216, 288].map(p => (
            <ellipse
              key={p}
              cx="0"
              cy="-5"
              rx="3.6"
              ry="5.5"
              transform={`rotate(${p})`}
              fill="none"
              stroke={i % 2 ? '#c97f8e' : '#d9a05b'}
              strokeWidth="1.8"
              strokeDasharray="2 1.5"
            />
          ))}
          <circle r="2.4" fill={i % 2 ? '#e7c46a' : '#c97f8e'} />
        </g>
      ))}
    </svg>
  );
}

export function RibbonBow() {
  return (
    <svg viewBox="0 0 90 120" className="cs-bow" aria-hidden="true">
      <path d="M45 40 C 20 18 4 28 8 44 C 12 58 34 54 45 40 Z" fill="#d68f9c" stroke="#b56d7c" strokeWidth="2" />
      <path d="M45 40 C 70 18 86 28 82 44 C 78 58 56 54 45 40 Z" fill="#d68f9c" stroke="#b56d7c" strokeWidth="2" />
      <path d="M45 42 C 38 64 30 90 22 116 L 34 112 L 40 118 C 44 92 46 66 45 42 Z" fill="#cf8392" />
      <path d="M45 42 C 52 64 60 90 68 116 L 56 112 L 50 118 C 46 92 44 66 45 42 Z" fill="#c27585" />
      <ellipse cx="45" cy="41" rx="8" ry="7" fill="#e3a3af" stroke="#b56d7c" strokeWidth="2" />
      <path d="M18 36 C 26 32 34 34 40 38" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ---------- Céu estrelado ---------- */
const STARS = [
  [12, 10, 1.4], [30, 6, 1], [52, 14, 1.8], [70, 8, 1.1], [88, 16, 1.5], [8, 30, 1], [24, 40, 1.6], [92, 36, 1.2],
  [16, 62, 1.3], [84, 58, 1.7], [10, 84, 1.1], [34, 92, 1.4], [62, 88, 1], [80, 82, 1.5], [46, 76, 1], [66, 30, 1.2]
];

export function StarField() {
  return (
    <svg viewBox="0 0 100 140" preserveAspectRatio="none" className="cs-starfield" aria-hidden="true">
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y * 1.4} r={r * 0.45} fill="#fff6d8" className="cs-twinkle" style={{ animationDelay: `${(i % 7) * 0.5}s` }} />
      ))}
      {/* constelações */}
      <g stroke="#e9cf8a" strokeOpacity="0.55" strokeWidth="0.35" fill="none">
        <path d="M14 22 L 26 16 L 34 24 L 46 18" />
        <path d="M70 106 L 78 98 L 88 104 L 84 116 L 74 118 Z" />
      </g>
      <g fill="#f3d995">
        {[[14, 22], [26, 16], [34, 24], [46, 18], [70, 106], [78, 98], [88, 104], [84, 116], [74, 118]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.9" />
        ))}
      </g>
    </svg>
  );
}

export function Moon() {
  return (
    <svg viewBox="0 0 60 60" className="cs-moon" aria-hidden="true">
      <defs>
        <radialGradient id="cs-moon-g" cx="35%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="1" stopColor="#d9b05a" />
        </radialGradient>
      </defs>
      <path d="M38 6 A 24 24 0 1 0 54 42 A 19 19 0 1 1 38 6 Z" fill="url(#cs-moon-g)" />
    </svg>
  );
}

/* ---------- Aquarela ---------- */
export function PressedFlower({ color = '#e58fa3', className = '' }) {
  return (
    <svg viewBox="0 0 60 90" className={`cs-pressed ${className}`} aria-hidden="true">
      <path d="M30 88 C 30 70 28 50 30 30" stroke="#8aa26f" strokeWidth="2" fill="none" />
      <path d="M30 62 C 20 56 14 58 12 52 C 20 50 26 54 30 60" fill="#a4bb86" opacity="0.85" />
      <path d="M30 70 C 40 64 46 66 48 60 C 40 58 34 62 30 68" fill="#a4bb86" opacity="0.85" />
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="30" cy="20" rx="6" ry="10" transform={`rotate(${a} 30 28)`} fill={color} opacity="0.75" />
      ))}
      <circle cx="30" cy="28" r="4" fill="#f2c96b" />
    </svg>
  );
}

/* ---------- Carta vintage ---------- */
export function PostStamps() {
  return (
    <svg viewBox="0 0 110 80" className="cs-stamps" aria-hidden="true">
      <g transform="rotate(-6 30 40)">
        <rect x="6" y="10" width="44" height="56" fill="#f6efe0" stroke="#f6efe0" strokeWidth="4" strokeDasharray="3 3" />
        <rect x="11" y="15" width="34" height="46" fill="#c9786f" />
        <path d="M28 46 c-8 -5 -10 -11 -6 -14 c2 -2 5 -1 6 1 c1 -2 4 -3 6 -1 c4 3 2 9 -6 14z" fill="#f6efe0" />
      </g>
      <g transform="rotate(5 80 38)">
        <rect x="58" y="12" width="40" height="50" fill="#f6efe0" stroke="#f6efe0" strokeWidth="4" strokeDasharray="3 3" />
        <rect x="63" y="17" width="30" height="40" fill="#7f9bb3" />
        <circle cx="78" cy="34" r="8" fill="#f2d48a" />
        <path d="M63 50 L 72 42 L 80 50 L 86 44 L 93 50 L 93 57 L 63 57 Z" fill="#5c7a8f" />
      </g>
      <circle cx="58" cy="44" r="18" fill="none" stroke="#5a4636" strokeOpacity="0.45" strokeWidth="1.5" />
      <path d="M38 40 C 50 34 66 46 80 40 M38 46 C 50 40 66 52 80 46" stroke="#5a4636" strokeOpacity="0.4" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function TwineBow() {
  return (
    <svg viewBox="0 0 80 60" className="cs-twine-bow" aria-hidden="true">
      <g fill="none" stroke="#e8d6b0" strokeWidth="3" strokeLinecap="round">
        <path d="M40 30 C 20 10 6 18 10 30 C 14 42 30 38 40 30" />
        <path d="M40 30 C 60 10 74 18 70 30 C 66 42 50 38 40 30" />
        <path d="M40 30 C 34 42 28 50 22 58" />
        <path d="M40 30 C 46 42 52 50 60 58" />
      </g>
      <g fill="none" stroke="#b89e72" strokeWidth="1" strokeDasharray="2 2">
        <path d="M40 30 C 20 10 6 18 10 30 C 14 42 30 38 40 30" />
        <path d="M40 30 C 60 10 74 18 70 30 C 66 42 50 38 40 30" />
      </g>
      <circle cx="40" cy="30" r="4" fill="#d9c49a" />
    </svg>
  );
}
