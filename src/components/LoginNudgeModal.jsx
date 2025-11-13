import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function LoginNudgeModal({
  open,
  onClose,
  onLogin,
  title = 'Log in to keep listening',
  message = "You’ve reached the free play limit for guests. Log in to continue playing, save favourites, and get Certificate IDs.",
}) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const s = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
      zIndex: 3200,
      display: 'grid',
      placeItems: 'center',
      padding: '16px',
    },
    panel: {
      position: 'relative',
      width: 'min(92vw, 420px)',
      background: 'linear-gradient(180deg, rgba(21,21,21,0.96) 0%, rgba(12,12,12,0.96) 100%)',
      color: '#e0e0e0',
      borderRadius: 16,
      border: '1px solid rgba(235,186,47,0.35)',
      boxShadow: '0 18px 44px rgba(0,0,0,0.55)',
      overflow: 'hidden',
    },
    topAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: 'linear-gradient(90deg, #ffc107, #ff9800)',
      opacity: 0.9,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 14px 8px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    title: {
      margin: 0,
      fontFamily: 'Montserrat, Inter, system-ui, sans-serif',
      fontWeight: 900,
      letterSpacing: 0.3,
      fontSize: 17,
      backgroundImage: 'linear-gradient(90deg, #ffd24a, #ff9800)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      textShadow: '0 0 18px rgba(255,193,7,0.15)',
    },
    close: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      width: 32,
      height: 32,
      borderRadius: 10,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 900,
      fontSize: 18,
      cursor: 'pointer',
      transition: 'background 160ms ease, transform 120ms ease',
    },
    body: {
      padding: '12px 16px 4px 16px',
      fontSize: 14,
      color: '#d6d6d6',
      lineHeight: 1.55,
    },
    bullets: {
      margin: '10px 0 0 0',
      padding: 0,
      listStyle: 'none',
      color: '#cfcfcf',
      display: 'grid',
      gap: 6,
      fontWeight: 600,
    },
    bulletItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13.5,
      color: '#cfcfcf',
    },
    dot: {
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: 9999,
      background: 'linear-gradient(90deg, #ffc107, #ff9800)',
      boxShadow: '0 0 10px rgba(255,193,7,0.45)',
      flex: '0 0 auto',
    },
    actions: {
      display: 'flex',
      gap: 10,
      padding: '12px 16px 16px 16px',
      justifyContent: 'flex-end',
    },
    btnPrimary: {
      border: 'none',
      background: 'linear-gradient(90deg, #ffc107, #ff9800)',
      color: '#111',
      fontWeight: 900,
      borderRadius: 9999,
      padding: '11px 18px',
      cursor: 'pointer',
      boxShadow: '0 6px 18px rgba(255,193,7,0.35)',
      transition: 'filter 160ms ease, transform 120ms ease',
    },
    btnGhost: {
      border: '1px solid rgba(255,255,255,0.22)',
      background: 'transparent',
      color: '#e0e0e0',
      fontWeight: 800,
      borderRadius: 9999,
      padding: '10px 16px',
      cursor: 'pointer',
      transition: 'background 160ms ease, transform 120ms ease',
    },
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return createPortal(
    <div ref={overlayRef} style={s.overlay} onMouseDown={handleOverlayClick}>
      <div ref={modalRef} style={s.panel} role="dialog" aria-modal="true" aria-label="Login required">
        <div style={s.topAccent} aria-hidden="true"></div>

        <div style={s.header}>
          <h3 style={s.title}>{title}</h3>
          <button type="button" aria-label="Close" style={s.close} onClick={onClose}>×</button>
        </div>

        <div style={s.body}>
          {message}
          <ul style={s.bullets} aria-label="Benefits">
            <li style={s.bulletItem}><span style={s.dot} aria-hidden="true"></span> Continue playing full tracks</li>
            <li style={s.bulletItem}><span style={s.dot} aria-hidden="true"></span> Save your favourites</li>
            <li style={s.bulletItem}><span style={s.dot} aria-hidden="true"></span> Get Certificate IDs on downloads</li>
          </ul>
        </div>

        <div style={s.actions}>
          <button type="button" style={s.btnGhost} onClick={onClose}>Maybe later</button>
          <button type="button" style={s.btnPrimary} onClick={onLogin}>Log in</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
