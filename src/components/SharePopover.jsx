import React, { useEffect, useRef } from 'react';

const ShareIcon = ({ size = 18, color = '#1a1a1a' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
    <path d="M18 8a3 3 0 1 0-2.82-4H15a3 3 0 0 0 3 3zM6 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
    <path d="M8.59 13.51l6.83-3.42m-6.83 7.82 6.83-3.42" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
  </svg>
);

export default function SharePopover({
  isOpen,
  link,
  anchorRef,            // element to position against (its offsetParent should be relative)
  onClose,
  onCopy,
  enableNativeShare = true,
  align = 'left',       // 'left' or 'right' alignment under the anchor
  title = 'Share this song',
}) {
  const popRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e) => {
      if (!popRef.current) return;
      if (anchorRef?.current?.contains?.(e.target)) return;
      if (!popRef.current.contains(e.target)) {
        onClose?.();
      }
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

  if (!isOpen) return null;

  const canNativeShare = !!(enableNativeShare && navigator?.share);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(link || ''));
      onCopy?.();
    } catch {
      try {
        // Fallback select + execCommand
        const el = inputRef.current;
        if (el) {
          el.select();
          document.execCommand('copy');
          onCopy?.();
        }
      } catch {}
    }
    // Do NOT auto-close (per your request).
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({ title: 'VARA Music', text: 'Check this track on VARA', url: String(link || '') });
      // keep popover open (non-intrusive)
    } catch {}
  };

  // Basic bubble styles (VARA yellow + black)
  const s = {
    wrap: {
      position: 'absolute',
      top: 'calc(100% + 10px)',
      [align === 'right' ? 'right' : 'left']: 0,
      zIndex: 2500,
    },
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

  return (
    <div ref={popRef} style={s.wrap}>
      <div style={s.bubble} role="dialog" aria-label="Share this song">
        <div style={s.header}>
          <span>{title.toUpperCase()}</span>
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
            <ShareIcon size={16} />
            Share…
          </button>
        )}
      </div>
    </div>
  );
}
