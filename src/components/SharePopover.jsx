import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ShareIcon = ({ size = 18, color = '#1a1a1a' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 3h7v7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14L21 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SharePopover({
  isOpen,
  link,
  anchorRef,
  onClose,
  onCopy,
  enableNativeShare = true,
  align = 'left',
  title = 'Share this song',
}) {
  const popRef = useRef(null);
  const inputRef = useRef(null);
  const [coords, setCoords] = useState({ top: -9999, left: -9999 });

  const s = {
    bubble: {
      minWidth: 260,
      maxWidth: 320,
      background: '#ebba2f',
      color: '#050405',
      borderRadius: 14,
      boxShadow: '0 10px 26px rgba(0,0,0,0.45)',
      border: '1px solid rgba(0,0,0,0.18)',
      padding: '14px 14px 12px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontWeight: 800,
      fontFamily: 'Montserrat, Inter, system-ui, sans-serif',
      fontSize: 14,
      letterSpacing: 0.3,
      marginBottom: 10,
    },
    closeBtn: {
      border: 'none',
      background: 'transparent',
      color: '#050405',
      width: 28,
      height: 28,
      borderRadius: 8,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    row: { display: 'flex', gap: 8, alignItems: 'center' },
    input: {
      flex: 1,
      background: '#111',
      color: '#fff',
      borderRadius: 8,
      padding: '10px 12px',
      border: '1px solid rgba(255,255,255,0.12)',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 600,
      fontSize: 13,
      outline: 'none',
      boxShadow: '0 0 0 0 rgba(0,0,0,0)',
    },
    copy: {
      border: 'none',
      background: '#050405',
      color: '#fff',
      borderRadius: 8,
      padding: '10px 14px',
      fontWeight: 800,
      fontSize: 12,
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
    },
    shareBtn: {
      border: 'none',
      background: '#ffd24a',
      color: '#050405',
      borderRadius: 8,
      padding: '8px 10px',
      fontWeight: 800,
      fontSize: 12,
      cursor: 'pointer',
      boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
  };

  const canNativeShare = !!(enableNativeShare && navigator?.share);

  const updatePosition = useCallback(() => {
    if (!anchorRef?.current || !popRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const bubbleEl = popRef.current.firstChild || popRef.current;
    const bubbleW = bubbleEl?.offsetWidth || 280;
    const bubbleH = bubbleEl?.offsetHeight || 140;
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const M = 10;

    let top = rect.bottom + M;
    let left = align === 'right' ? rect.right - bubbleW : rect.left;

    // Flip above if not enough room below
    if (top + bubbleH > vh - M && rect.top - bubbleH - M >= M) {
      top = rect.top - bubbleH - M;
    }

    // Clamp inside viewport
    left = Math.min(Math.max(M, left), vw - bubbleW - M);
    top = Math.min(Math.max(M, top), vh - bubbleH - M);

    setCoords({ top: Math.round(top), left: Math.round(left) });
  }, [anchorRef, align]);

  // Positioning lifecycle
  useEffect(() => {
    if (!isOpen) return;
    let raf = requestAnimationFrame(updatePosition);
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);  // capture to catch inner scrollers
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click / ESC
  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e) => {
      if (!popRef.current) return;
      const anchorEl = anchorRef?.current;
      const bubbleEl = popRef.current;
      if (anchorEl && (anchorEl === e.target || anchorEl.contains(e.target))) return;
      if (bubbleEl.contains(e.target)) return;
      onClose?.();
    };
    const onEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('mousedown', onDoc, true);
    document.addEventListener('touchstart', onDoc, { passive: true, capture: true });
    document.addEventListener('keydown', onEsc, true);
    return () => {
      document.removeEventListener('mousedown', onDoc, true);
      document.removeEventListener('touchstart', onDoc, true);
      document.removeEventListener('keydown', onEsc, true);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(link || ''));
      onCopy?.();
    } catch {
      try {
        const el = inputRef.current;
        if (el) {
          el.select();
          document.execCommand('copy');
          onCopy?.();
        }
      } catch {}
    }
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({ title: 'VARA Music', text: 'Check this track on VARA', url: String(link || '') });
    } catch {}
  };

  if (!isOpen) return null;

  const fixedWrapStyle = { position: 'fixed', top: coords.top, left: coords.left, zIndex: 2500 };

  return createPortal(
    <div ref={popRef} style={fixedWrapStyle}>
      <div style={s.bubble} role="dialog" aria-label="Share this song">
        <div style={s.header}>
          <span>{String(title || '').toUpperCase()}</span>
          <button type="button" aria-label="Close" onClick={onClose} style={s.closeBtn}>×</button>
        </div>

        <div style={s.row}>
          <input
            ref={inputRef}
            type="text"
            value={String(link || '')}
            readOnly
            style={s.input}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Share link"
          />
          <button type="button" onClick={handleCopy} style={s.copy}>COPY</button>
        </div>

        {canNativeShare && (
          <button type="button" onClick={handleNativeShare} style={s.shareBtn}>
            <ShareIcon size={16} color="#050405" />
            Share…
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
