import React, { useEffect, useRef } from 'react';
import './lotus-hero.css';

const LotusHeroBackground = ({ durationMs = 3000, onIntroComplete, skipIntro = false }) => {
  const starFieldRef = useRef(null);
  const particleRef = useRef(null);
  const completedRef = useRef(false);
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);

  useEffect(() => {
    const starField = starFieldRef.current;
    const particlesEl = particleRef.current;
    const timeouts = timeoutsRef.current;
    const intervals = intervalsRef.current;

    if (!starField) return;

    const clearTimers = () => {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
      intervals.length = 0;
      timeouts.length = 0;
    };

    // Create one star (viewport units, matches HTML demo behavior)
    const createStar = (delay = 0) => {
      const to = setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'star';
        const x = Math.random() * 100;       // 0–100vw
        const speed = 3 + Math.random() * 4; // 3–7s
        const size = 1 + Math.random() * 2;  // 1–3px

        star.style.left = `${x}vw`;
        star.style.top = `100vh`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animation = `vara-starMove ${speed}s linear forwards`;

        starField.appendChild(star);
        const t2 = setTimeout(() => star.remove(), speed * 1000 + 50);
        timeouts.push(t2);
      }, delay);
      timeouts.push(to);
    };

    // Start the starfield (staggered initial + continuous)
    const startStars = () => {
      for (let i = 0; i < 50; i++) createStar(i * 200);
      const inter = setInterval(() => createStar(), 300);
      intervals.push(inter);
    };
    startStars();

    // Intro particles (only when not skipping intro)
    if (!skipIntro && particlesEl) {
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const angle = (Math.PI * 2 * i) / 15;
        const distance = 100 + Math.random() * 150;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        particle.style.left = `50vw`;
        particle.style.top = `60vh`;
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.animation = `vara-particleFloat 2s ease-out ${500 + i * 50}ms forwards`;
        particlesEl.appendChild(particle);
      }
    }

    // Signal intro completion once
    const signalComplete = (skipped) => {
      if (completedRef.current) return;
      completedRef.current = true;
      try { onIntroComplete && onIntroComplete(); } catch {}
      try {
        window.dispatchEvent(new CustomEvent('vara:hero-intro-complete', {
          detail: { durationMs, skipped }
        }));
      } catch {}
    };

    if (skipIntro) {
      const to = setTimeout(() => signalComplete(true), 0);
      timeouts.push(to);
    } else {
      const to = setTimeout(() => signalComplete(false), durationMs);
      timeouts.push(to);
    }

    // Cleanup
    return () => {
      clearTimers();
      if (starField) while (starField.firstChild) starField.removeChild(starField.firstChild);
      if (particlesEl) while (particlesEl.firstChild) particlesEl.removeChild(particlesEl.firstChild);
    };
  }, [durationMs, onIntroComplete, skipIntro]);

  return (
    <div className="vara-hero-bg" aria-hidden="true">
      <div ref={starFieldRef} className="star-field" />
      <div className="bg-glow" />
      {!skipIntro && <div className="lotus-center" />}
      <div ref={particleRef} className="particles" />
      <div className="vignette" />
    </div>
  );
};

export default LotusHeroBackground;
