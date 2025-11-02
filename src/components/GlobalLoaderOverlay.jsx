// src/components/GlobalLoaderOverlay.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function GlobalLoaderOverlay() {
  const [visible, setVisible] = useState(false);
  const activeCountRef = useRef(0);
  const safetyTimerRef = useRef(null);

  // Helpers
  const setVisibleSafe = (v) => {
    // Avoid extra renders
    setVisible(prev => (prev === v ? prev : v));
  };

  const clearSafetyTimer = () => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  };

  const startSafetyTimer = (ms = 15000) => {
    clearSafetyTimer();
    safetyTimerRef.current = setTimeout(() => {
      // Fail-safe: if something forgot to hide, force it off
      activeCountRef.current = 0;
      setVisibleSafe(false);
    }, ms);
  };

  const handleShow = (timeoutMs = 15000) => {
    activeCountRef.current += 1;
    setVisibleSafe(true);
    startSafetyTimer(timeoutMs);
  };

  const handleHide = () => {
    activeCountRef.current = Math.max(0, activeCountRef.current - 1);
    if (activeCountRef.current === 0) {
      setVisibleSafe(false);
      clearSafetyTimer();
    }
  };

  const handleFlash = (ms = 550) => {
    activeCountRef.current += 1;
    setVisibleSafe(true);
    // Short-lived; no need to re-arm safety unless overlapping
    setTimeout(() => {
      activeCountRef.current = Math.max(0, activeCountRef.current - 1);
      if (activeCountRef.current === 0) setVisibleSafe(false);
    }, Math.max(120, ms | 0));
  };

  useEffect(() => {
    const onShow = (e) => {
      const ms = (e?.detail && typeof e.detail.timeoutMs === 'number') ? e.detail.timeoutMs : 15000;
      handleShow(ms);
    };
    const onHide = () => handleHide();
    const onFlash = (e) => {
      const ms = (e?.detail && typeof e.detail.ms === 'number') ? e.detail.ms : 550;
      handleFlash(ms);
    };

    window.addEventListener('vara:loader:show', onShow);
    window.addEventListener('vara:loader:hide', onHide);
    window.addEventListener('vara:loader:flash', onFlash);
    return () => {
      window.removeEventListener('vara:loader:show', onShow);
      window.removeEventListener('vara:loader:hide', onHide);
      window.removeEventListener('vara:loader:flash', onFlash);
      clearSafetyTimer();
      activeCountRef.current = 0;
    };
  }, []);

  // Styles: full-screen dim overlay + golden rotating particle loader
  return (
    <div
      className="vara-global-loader"
      data-visible={visible ? 'true' : 'false'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647, // max
        display: 'grid',
        placeItems: 'center',
        background: visible ? 'rgba(0,0,0,0.6)' : 'transparent',
        transition: 'background 160ms ease',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        userSelect: 'none'
      }}
      aria-hidden={!visible}
      aria-label="Loading"
      role="status"
    >
      {/* Loader container (rotates) */}
      <div
        className="vara-loader-container"
        style={{
          position: 'relative',
          width: 88,
          height: 88,
          animation: 'vara-rotate-loader 2.5s linear infinite',
          filter: 'saturate(1.05)'
        }}
      >
        {/* Particles */}
        <span className="vara-particle vara-p1" />
        <span className="vara-particle vara-p2" />
        <span className="vara-particle vara-p3" />
        <span className="vara-particle vara-p4" />
      </div>

      <style>{`
        .vara-particle {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, #fff 0%, #ffe17a 55%, #ff9f1a 100%);
          box-shadow:
            0 0 10px rgba(255, 193, 7, 0.95),
            0 0 20px rgba(255, 152, 0, 0.65),
            0 0 34px rgba(255, 152, 0, 0.35);
          animation: vara-particle-glow 2.5s ease-in-out infinite;
        }
        .vara-p1 { top: 0; left: 50%; transform: translateX(-50%); animation-delay: 0s; }
        .vara-p2 { top: 50%; right: 0; transform: translateY(-50%); animation-delay: -0.625s; }
        .vara-p3 { bottom: 0; left: 50%; transform: translateX(-50%); animation-delay: -1.25s; }
        .vara-p4 { top: 50%; left: 0; transform: translateY(-50%); animation-delay: -1.875s; }

        @keyframes vara-rotate-loader {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes vara-particle-glow {
          0%, 100% { transform: scale(0.6); opacity: 0.6; }
          50%      { transform: scale(1.2); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vara-loader-container,
          .vara-particle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
