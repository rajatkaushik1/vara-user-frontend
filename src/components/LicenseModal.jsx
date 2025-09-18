import React, { useEffect, useCallback, useState } from 'react';
import './LicenseModal.css';

export default function LicenseModal({ open, onClose, data }) {
  // data: { licenseId, issuedToEmail, subscriptionStatus, validFor, songTitle, issuedAtUtcIso, remaining }
  const [copied, setCopied] = useState(false);

  const handleKey = useCallback((e) => {
    if (!open) return;
    if (e.key === 'Escape') onClose && onClose();
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleKey]);

  if (!open) return null;

  const licenseId = data?.licenseId || '—';
  const issuedToEmail = data?.issuedToEmail || '—';
  const subscriptionStatus = data?.subscriptionStatus || '—';
  const validFor = data?.validFor || 'Use on YouTube & Social Platforms';
  const songTitle = data?.songTitle || '—';
  const issuedAt = data?.issuedAtUtcIso ? new Date(data.issuedAtUtcIso).toUTCString() : 'Loading…';
  const remaining = typeof data?.remaining === 'number' ? data.remaining : '—';

  const yellowBlockText = `This video contains music from varamusic.com
License ID: ${licenseId}`;

  const copyYellowBlock = async () => {
    try {
      await navigator.clipboard.writeText(yellowBlockText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // ignore
    }
  };

  const stopProp = (e) => e.stopPropagation();

  return (
    <div className="license-modal-overlay" onClick={onClose} aria-modal="true" role="dialog" aria-labelledby="license-modal-title">
      <div className="license-modal-dialog" onClick={stopProp}>
        {/* Header */}
        <div className="license-modal-header">
          <div className="license-modal-title-row">
            <span className="license-modal-check" aria-hidden="true">✔</span>
            <h3 id="license-modal-title" className="license-modal-title">Downloading has started</h3>
          </div>
          <button className="license-modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="license-modal-subtitle">
          We have created <span className="license-modal-italic">exclusive License</span> for you
        </div>

        {/* Yellow description block */}
        <div className="license-modal-yellow">
          <div className="license-modal-yellow-head">
            ⚠ Put this in your video description, caption, or credits:
          </div>
          <div className="license-modal-yellow-body">
            <div className="license-modal-yellow-text">
              <div>This video contains music from</div>
              <div className="license-modal-domain">varamusic.com</div>
              <div className="license-modal-license-line">License ID: <b>{licenseId}</b></div>
            </div>
            <button className="license-modal-copy" onClick={copyYellowBlock} aria-label="Copy license text">
              <span className="copy-squares" aria-hidden="true"></span>
            </button>
          </div>
          {copied && <div className="license-modal-copied">Copied!</div>}
        </div>

        {/* More Details */}
        <div className="license-modal-details-title">More Details:</div>
        <div className="license-modal-details">
          <div><b>License ID:</b> {licenseId}</div>
          <div><b>Issued To:</b> {issuedToEmail}</div>
          <div><b>Subscription Status:</b> {subscriptionStatus}</div>
          <div><b>Valid For:</b> {validFor}</div>
          <div><b>Track:</b> {songTitle}</div>
          <div><b>Issued At (UTC):</b> {issuedAt}</div>
        </div>

        {/* Remaining */}
        <div className="license-modal-remaining">
          Downloads remaining this month: <b>{remaining}</b>
        </div>

        {/* Disclaimer */}
        <div className="license-modal-disclaimer">
          Each License ID is valid for one video/project only. Reusing the same ID across multiple projects is strictly prohibited.
        </div>
      </div>
    </div>
  );
}
