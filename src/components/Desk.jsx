import { memo } from 'react';
import Particles from './reactbits/Particles/Particles';
import AnimatedContent from './reactbits/AnimatedContent/AnimatedContent';
import { useTheme } from '../lib/theme';
import {
  BlackCandle,
  CalligraphyNote,
  Candle,
  DarkTeacup,
  DriedLeaf,
  DriedRoses,
  FadedPolaroid,
  HeartClips,
  Mug,
  Note,
  Pen,
  Petal,
  Polaroid,
  Sprig,
  Stamp,
  Star,
  Succulent,
  SvgDefs,
  ThornBranch,
  Vine,
  VintageKey,
  WindLeaf
} from './DeskProps';

// [classe CSS (posição/tamanho), ilustração, atraso da animação de entrada]
const COZY = [
  ['p-vine-top', <Vine key="v1" />, 0.1],
  ['p-vine-left', <Vine key="v2" flip />, 0.15],
  ['p-mug', <Mug key="mug" />, 0.2],
  ['p-leaf', <DriedLeaf key="leaf" />, 0.4],
  ['p-star-1', <Star key="s1" />, 0.55],
  ['p-note', <Note key="note" />, 0.45],
  ['p-pen', <Pen key="pen" />, 0.6],
  ['p-clips', <HeartClips key="clips" />, 0.65],
  ['p-succulent', <Succulent key="succ" />, 0.25],
  ['p-candle', <Candle key="candle" />, 0.3],
  ['p-petal-1', <Petal key="pt1" />, 0.5],
  ['p-petal-2', <Petal key="pt2" hue={1} />, 0.55],
  ['p-petal-3', <Petal key="pt3" hue={2} />, 0.6],
  ['p-petal-4', <Petal key="pt4" hue={1} />, 0.65],
  ['p-stamp', <Stamp key="stamp" />, 0.4],
  ['p-sprig', <Sprig key="sprig" />, 0.5],
  ['p-star-2', <Star key="s2" color="#f6d97e" />, 0.7],
  ['p-star-3', <Star key="s3" color="#b9c8f0" />, 0.75],
  ['p-polaroid', <Polaroid key="polaroid" />, 0.35]
];

const MOOR = [
  ['m-teacup', <DarkTeacup key="cup" />, 0.2],
  ['m-thorns', <ThornBranch key="thorn" />, 0.3],
  ['m-roses', <DriedRoses key="roses" />, 0.35],
  ['m-note', <CalligraphyNote key="note" />, 0.45],
  ['m-candle', <BlackCandle key="candle" />, 0.25],
  ['m-petal-1', <Petal key="pt1" dark />, 0.5],
  ['m-petal-2', <Petal key="pt2" dark />, 0.55],
  ['m-key', <VintageKey key="key" />, 0.4],
  ['m-polaroid', <FadedPolaroid key="pol" />, 0.35]
];

const MOTES = {
  cozy: ['#fff1c9', '#ffd9a8', '#ffe6b0'],
  moor: ['#e8d6a6', '#bcd0ea', '#9fb6d6']
};

function DeskDecor({ theme }) {
  const props = theme === 'moor' ? MOOR : COZY;
  return (
    <>
      <SvgDefs />
      <div className="desk-light" aria-hidden="true" />
      <div className="desk-props" aria-hidden="true">
        {props.map(([cls, node, delay]) => (
          <div key={cls} className={`prop ${cls}`}>
            <AnimatedContent trigger="mount" distance={30} direction="vertical" duration={1} delay={delay} scale={0.92}>
              {node}
            </AnimatedContent>
          </div>
        ))}
      </div>
      {theme === 'moor' && (
        <div className="moor-weather" aria-hidden="true">
          <div className="fog fog-1" />
          <div className="fog fog-2" />
          <div className="fog fog-3" />
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`wind-leaf wl-${i}`}>
              <WindLeaf tone={i} />
            </div>
          ))}
        </div>
      )}
      <div className="desk-motes" aria-hidden="true">
        <Particles
          particleColors={MOTES[theme]}
          particleCount={110}
          particleSpread={12}
          speed={0.05}
          particleBaseSize={80}
          alphaParticles
          glow={1}
          twinkle={0.8}
          drift={theme === 'moor' ? 'none' : 'up'}
          driftSpeed={0.25}
          hoverEffect="repel"
          clickBurst={false}
          opacity={theme === 'moor' ? 0.6 : 0.75}
          disableRotation
        />
      </div>
    </>
  );
}

const Decor = memo(DeskDecor);

export default function Desk({ children }) {
  const theme = useTheme();
  return (
    <div className="desk">
      <Decor theme={theme} />
      <div className="desk-content">{children}</div>
    </div>
  );
}
