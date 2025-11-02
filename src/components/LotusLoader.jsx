import React from 'react';

/**
 * LotusLoader
 * - Still lotus when active=false (no particles/aura visible).
 * - Animated orbit + aura when active=true.
 *
 * Props:
 * - active?: boolean (default: false)
 * - size?: number (default: 140)
 * - imageSrc?: string (default: '/lotus.png')
 * - orbitScale?: number (default: 1.52)  // bigger = wider visual ring (like before)
 * - radiusFactor?: number (default: 0.74) // bigger = dots travel further from lotus
 * - className?: string
 * - ariaLabel?: string
 */
export default function LotusLoader({
  active = false,
  size = 140,
  imageSrc = '/lotus.png',
  orbitScale = 1.52,
  radiusFactor = 0.74,
  className = '',
  ariaLabel
}) {
  const label = ariaLabel || (active ? 'AI is thinking…' : 'VARA AI');
  const cls = `ai-lotus-loader ${active ? 'is-active' : 'is-still'} ${className}`.trim();

  return (
    <div
      className={cls}
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{
        ['--ai-lotus-size']: `${size}px`,
        ['--ai-orbit-scale']: `${orbitScale}`,
        ['--ai-radius-factor']: `${radiusFactor}`,
      }}
    >
      {/* Aura + orbit are completely hidden in still mode */}
      <div className="ai-petal-illusion" aria-hidden="true"></div>

      <div className="ai-orbit" aria-hidden="true">
        <span className="ai-dot" style={{ '--i': 0, '--angle': '0deg' }} />
        <span className="ai-dot" style={{ '--i': 1, '--angle': '60deg' }} />
        <span className="ai-dot" style={{ '--i': 2, '--angle': '120deg' }} />
        <span className="ai-dot" style={{ '--i': 3, '--angle': '180deg' }} />
        <span className="ai-dot" style={{ '--i': 4, '--angle': '240deg' }} />
        <span className="ai-dot" style={{ '--i': 5, '--angle': '300deg' }} />
      </div>

      {/* Lotus image (always visible) */}
      <div
        className="ai-lotus"
        aria-hidden="true"
        style={{ backgroundImage: `url("${imageSrc}")` }}
      />

      <style>{`
        .ai-lotus-loader {
          --size: var(--ai-lotus-size, 140px);
          --orbit-scale: var(--ai-orbit-scale, 1.52);
          --radius-factor: var(--ai-radius-factor, 0.74);
          --radius: calc(var(--size) * var(--radius-factor));
          --dot-size: 9px;
          --orbit-speed: 3.2s;
          --petal-speed: 7s;

          position: relative;
          width: var(--size);
          height: var(--size);
          display: grid;
          place-items: center;
          isolation: isolate;
          pointer-events: none; /* never blocks clicks */
        }

        .ai-lotus {
          position: absolute;
          inset: 0;
          background: center/contain no-repeat;
          z-index: 2;
        }

        /* Hidden entirely in still mode */
        .ai-lotus-loader.is-still .ai-orbit,
        .ai-lotus-loader.is-still .ai-dot,
        .ai-lotus-loader.is-still .ai-petal-illusion {
          display: none !important;
        }

        /* Active mode only */
        .ai-lotus-loader.is-active .ai-orbit {
          position: absolute;
          width: calc(var(--size) * var(--orbit-scale));
          height: calc(var(--size) * var(--orbit-scale));
          z-index: 1;
          animation:
            ai-orbitAppear 520ms cubic-bezier(.2,.9,.2,1) both,
            ai-orbitSpin var(--orbit-speed) linear infinite 480ms;
          will-change: transform, opacity;
        }
        .ai-lotus-loader.is-active .ai-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: var(--dot-size);
          height: var(--dot-size);
          margin: calc(var(--dot-size) / -2);
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, #fff 0%, #ffe17a 50%, #ff9f1a 100%);
          box-shadow:
            0 0 6px 2px rgba(255, 208, 0, .65),
            0 0 14px 6px rgba(255, 140, 0, .35);
          transform: rotate(var(--angle)) translateX(0) scale(0.6);
          animation:
            ai-dotIntro 720ms cubic-bezier(.2,.9,.2,1) both,
            ai-dotPulse 2.2s ease-in-out infinite 0s;
          animation-delay:
            calc(var(--i) * 0.08s),
            calc(0.72s + var(--i) * 0.18s);
          will-change: transform, opacity;
        }

        .ai-lotus-loader.is-active .ai-petal-illusion {
          position: absolute;
          width: calc(var(--size) * 1.18); /* classic aura size (like before) */
          height: calc(var(--size) * 1.18);
          z-index: 1;
          border-radius: 50%;
          background:
            repeating-conic-gradient(
              from 0deg,
              rgba(255, 215, 0, .18) 0 22deg,
              rgba(255, 215, 0, 0) 22deg 60deg
            );
          filter: blur(18px) saturate(115%);
          animation:
            ai-petalIntro 760ms cubic-bezier(.2,.9,.2,1) both,
            ai-petalRotate var(--petal-speed) linear infinite 520ms;
          will-change: transform, opacity;
        }

        /* Keyframes */
        @keyframes ai-orbitSpin { to { transform: rotate(360deg); } }
        @keyframes ai-dotPulse {
          0%, 100% { transform: scale(1) rotate(var(--angle)) translateX(var(--radius)); opacity: .95; }
          50%      { transform: scale(1.25) rotate(var(--angle)) translateX(var(--radius)); opacity: 1; }
        }
        @keyframes ai-orbitAppear { 0% { transform: scale(.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes ai-dotIntro {
          0% { transform: rotate(var(--angle)) translateX(0) scale(0.6); opacity: 0; }
          60% { transform: rotate(var(--angle)) translateX(calc(var(--radius) * .95)) scale(1.06); opacity: 1; }
          100% { transform: rotate(var(--angle)) translateX(var(--radius)) scale(1); }
        }
        @keyframes ai-petalRotate { to { transform: rotate(360deg); } }
        @keyframes ai-petalIntro { 0% { transform: scale(.7) rotate(-12deg); opacity: 0; } 60% { transform: scale(1.05) rotate(-4deg); opacity: .85; } 100% { transform: scale(1) rotate(0deg); opacity: .85; } }

        @media (prefers-reduced-motion: reduce) {
          .ai-lotus, .ai-orbit, .ai-dot, .ai-petal-illusion, .ai-lotus-loader {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
