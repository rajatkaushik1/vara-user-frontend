import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function LoginNudgeModal({
  open,
  onClose,
  onLogin,
  title = 'Log in to keep listening',
  message = "You've reached the free play limit. Log in to continue playing songs, save favourites, and get Certificate IDs.",
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
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      zIndex: 3200,
      display: 'grid',
      placeItems: 'center',
      padding: '16px',
    },
    panel: {
      position: 'relative',
      width: 'min(92vw, 420px)',
      background: '#151515',
      color: '#e0e0e0',
      borderRadius: 16,
      border: '1px solid rgba(235,186,47,0.35)',
      boxShadow: '0 16px 44px rgba(0,0,0,0.55)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 14px 10px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    logoWrap: { display: 'inline-flex', alignItems: 'center', gap: 8 },
    logo: { width: 22, height: 22, borderRadius: 6 },
    title: {
      margin: 0,
      fontFamily: 'Montserrat, Inter, system-ui, sans-serif',
      fontWeight: 800,
      letterSpacing: 0.2,
      fontSize: 16,
      color: '#fff',
    },
    close: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      width: 30,
      height: 30,
      borderRadius: 8,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 900,
      fontSize: 18,
      cursor: 'pointer',
    },
    body: {
      padding: '12px 16px 4px 16px',
      fontSize: 14,
      color: '#cfcfcf',
      lineHeight: 1.5,
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
      fontWeight: 800,
      borderRadius: 9999,
      padding: '10px 16px',
      cursor: 'pointer',
      boxShadow: '0 5px 15px rgba(255,193,7,0.35)',
    },
    btnGhost: {
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'transparent',
      color: '#e0e0e0',
      fontWeight: 700,
      borderRadius: 9999,
      padding: '9px 14px',
      cursor: 'pointer',
    },
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return createPortal(
    <div ref={overlayRef} style={s.overlay} onMouseDown={handleOverlayClick}>
      <div ref={modalRef} style={s.panel} role="dialog" aria-modal="true" aria-label="Login required">
        <div style={s.header}>
          <div style={s.logoWrap}>
            <img src="/logo.png" alt="VARA" style={s.logo} />
            <h3 style={s.title}>{title}</h3>
          </div>
          <button type="button" aria-label="Close" style={s.close} onClick={onClose}>×</button>
        </div>

        <div style={s.body}>{message}</div>

        <div style={s.actions}>
          <button type="button" style={s.btnGhost} onClick={onClose}>Maybe later</button>
          <button type="button" style={s.btnPrimary} onClick={onLogin}>Log in</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
