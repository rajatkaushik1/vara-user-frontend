// src/PremiumPage.jsx

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { AUTH_BASE_URL } from './config';
import './pages/PremiumPage.css';

// --- Icons (reused) ---
const CheckmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="glowing-icon">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
const MusicNoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="glowing-icon">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);
const YouTubeSafeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="glowing-icon">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="m9.5 14.5 5-2.5-5-2.5v5z"></path>
  </svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="glowing-icon">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const DEV_TOKEN = import.meta.env.VITE_DEV_ADMIN_TOKEN || 'VARA_DEV_4JcVgQ9kV7xTqP2m3ZsU8aRw6nYeB1Lh';

// Helpers
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(s);
  });
}
function daysBetween(now, then) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((then - now) / MS));
}

const styles = {
  historyCard: { marginTop: 20 },
  historyHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  historyTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#ebba2f' },
  historyScroll: { maxHeight: 380, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', color: '#b0b0b0', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(2px)' },
  td: { padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#e0e0e0' },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  copyBtn: { background: 'transparent', color: '#ebba2f', border: '1px solid #ebba2f', borderRadius: 8, padding: '6px 10px', fontWeight: 700, cursor: 'pointer' },
  smallNote: { color: '#9a9a9a', fontSize: '0.9rem', marginTop: 10 }
};

const PremiumPage = ({ currentUser, onPremiumAccess }) => {
  const [busy, setBusy] = useState(false);
  const [limits, setLimits] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const isPremiumActive = useMemo(() => {
    if (!currentUser) return false;
    const typeOk = currentUser.subscription_type === 'premium' || currentUser.is_premium === true;
    const expires = currentUser.premium_expires_at ? new Date(currentUser.premium_expires_at) : null;
    const timeOk = !expires || expires > new Date();
    return typeOk && timeOk;
  }, [currentUser]);

  const expiresAt = useMemo(() => {
    return currentUser?.premium_expires_at ? new Date(currentUser.premium_expires_at) : null;
  }, [currentUser?.premium_expires_at]);

  const daysLeft = useMemo(() => (expiresAt ? daysBetween(new Date(), expiresAt) : 0), [expiresAt]);

  const fetchLimits = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/user/limits?_=${Date.now()}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const j = await res.json();
        setLimits(j);
      }
    } catch (e) {
      console.error('Failed to fetch limits:', e);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`${AUTH_BASE_URL}/api/license/my?limit=100&_=${Date.now()}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) {
        setHistory([]);
        return;
      }
      const j = await res.json();
      setHistory(Array.isArray(j.items) ? j.items : []);
    } catch (e) {
      console.error('Failed to fetch license history:', e);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isPremiumActive) {
      fetchLimits();
      fetchHistory();
    }
  }, [isPremiumActive, fetchLimits, fetchHistory]);

  const copyLicense = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch (e) {
      console.error('Copy failed:', e);
      alert('Failed to copy license ID');
    }
  };

  const handleBuyPlan = useCallback(async (plan) => {
    const canAccess = onPremiumAccess();
    if (!canAccess) return;
    setBusy(true);
    try {
      // 1) Check billing config (decide Razorpay vs simulate)
      const cfgRes = await fetch(`${AUTH_BASE_URL}/api/billing/config`, { credentials: 'include' });
      const cfg = await cfgRes.json();
      const hasRazorpay = Boolean(cfg?.hasRazorpay);

      const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';
      if (hasRazorpay) {
        // Razorpay flow (plan-aware & billingCycle-aware)
        await loadRazorpayScript();
        const orderRes = await fetch(`${AUTH_BASE_URL}/api/billing/create-order`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, billingCycle: cycle })
        });
        const order = await orderRes.json();
        if (!orderRes.ok || !order?.orderId) {
          console.error('Create order failed:', order);
          alert('Payment error: could not create order. Please try again.');
          return;
        }

        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: `VARA ${plan.toUpperCase()}`,
          description: cycle === 'annual' ? 'Annual plan' : 'Monthly plan',
          order_id: order.orderId,
          theme: { color: '#f2a91f' },
          prefill: {
            name: (currentUser && currentUser.name) || '',
            email: (currentUser && currentUser.email) || ''
          },
          handler: async (resp) => {
            try {
              const verify = await fetch(`${AUTH_BASE_URL}/api/billing/verify`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: resp.razorpay_order_id,
                  paymentId: resp.razorpay_payment_id,
                  signature: resp.razorpay_signature,
                  plan // send plan for good measure
                })
              });
              const out = await verify.json();
              if (!verify.ok || !out?.ok) {
                console.error('Verification failed:', out);
                alert('Payment verification failed. Please contact support.');
                return;
              }
              // Fresh counters handled by backend — reload to reflect plan + usage
              alert(`Plan activated! Enjoy your ${plan.toUpperCase()} benefits.`);
              window.location.reload();
            } catch (e) {
              console.error('Verify error:', e);
              alert('Payment verification error. Please try again.');
            }
          }
        });
        rzp.open();
        return;
      }

      // 3) Dev simulate for Starter (when no Razorpay) and for Pro/Pro+ always
      const url = new URL(`${AUTH_BASE_URL}/api/billing/dev/simulate-purchase`);
      url.searchParams.set('plan', plan);
      url.searchParams.set('token', DEV_TOKEN);
      const sim = await fetch(url.toString(), { method: 'POST', credentials: 'include' });
      const result = await sim.json();
      if (!sim.ok || !result?.ok) {
        console.error('Dev simulate failed:', result);
        alert('Dev simulate failed. Check console for details.');
        return;
      }
      alert(`Plan '${plan.toUpperCase()}' activated (dev). Counters refreshed.`);
      window.location.reload();
    } catch (err) {
      console.error('Premium purchase error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [onPremiumAccess, currentUser, billingCycle]);

  const handleGetPremiumClick = useCallback(async () => {
    await handleBuyPlan('starter');
  }, [handleBuyPlan]);

  // --- UI when Premium is ACTIVE ---
  if (isPremiumActive) {
    const used = Math.max(0, Number(limits?.usedThisMonth ?? 0));
    const limit = Math.max(0, Number(limits?.monthlyLimit ?? 50));
    const remaining = Math.max(0, Number(limits?.remaining ?? (limit - used)));
    const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    return (
      <div className="premium-page">
        <div className="premium-content-container">
          <div className="premium-active-grid">
            {/* Black status box (same style as non-premium pricing card) */}
            <div className="premium-card pricing-card premium-status-card">
              <div className="premium-status-header">
                <span className="status-chip">You’re Premium</span>
                {daysLeft > 0 && (
                  <span className="status-sub">
                    Expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}
                    {expiresAt ? ` • ${expiresAt.toDateString()}` : ''}
                  </span>
                )}
              </div>

              <div className="status-row">
                <div className="status-metric">
                  <div className="metric-label">Downloads remaining this month</div>
                  <div className="metric-value">{remaining} / {limit}</div>
                  <div className="meter"><div className="meter-fill" style={{ width: `${percent}%` }} /></div>
                </div>
              </div>

              <div className="status-actions">
                {/* Removed renew button as requested */}
                <a className="btn btn-outline" href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>
                  BROWSE MUSIC
                </a>
                <a className="btn btn-outline" href="/license-verification" target="_blank" rel="noopener noreferrer">
                  CERTIFICATE VERIFICATION
                </a>
              </div>

              <div className="status-footnote">
                Your premium pass gives you up to 50 downloads per month across Free + Paid songs. Usage resets monthly.
              </div>
            </div>

            {/* License history list with scroll (second black box) */}
            <div className="premium-card premium-history-card">
              <div style={styles.historyHeader}>
                <div style={styles.historyTitle}>Download & Certificate History</div>
                <div style={{ color: '#b0b0b0', fontWeight: 600 }}>
                  {loadingHistory ? 'Loading…' : `${history.length} record${history.length === 1 ? '' : 's'}`}
                </div>
              </div>

              <div style={styles.historyScroll}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>S. No.</th>
                      <th style={styles.th}>Song name</th>
                      <th style={styles.th}>certificate ID</th>
                      <th style={styles.th}>Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHistory ? (
                      <tr><td style={styles.td} colSpan={4}>Loading…</td></tr>
                    ) : history.length === 0 ? (
                      <tr><td style={styles.td} colSpan={4}>No downloads yet.</td></tr>
                    ) : (
                      history.map((item, idx) => (
                        <tr key={`${item.licenseId}-${idx}`}>
                          <td style={styles.td}>{idx + 1}</td>
                          <td style={styles.td}>{item.songTitle || '-'}</td>
                          <td style={{ ...styles.td, ...styles.mono }}>{item.licenseId || '-'}</td>
                          <td style={styles.td}>
                            {item.licenseId ? (
                              <button
                                style={styles.copyBtn}
                                onClick={() => copyLicense(item.licenseId, idx)}
                                title="Copy license ID"
                              >
                                {copiedIdx === idx ? 'COPIED' : 'COPY'}
                              </button>
                            ) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={styles.smallNote}>
                Tip: Click “certificate Verification” to validate a certificate ID publicly.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- UI when FREE: new pricing grid with monthly/annual toggle ---
  const isAnnual = billingCycle === 'annual';

  return (
    <div className="premium-page">
      <div className="premium-content-container" style={{ gridTemplateColumns: '1fr' }}>
        {/* Header + Toggle */}
        <div className="pricing-page-header">
          <div className="pricing-header-box">
            <h1 className="pricing-title">Choose your Premium plan</h1>
            <p className="pricing-subtitle">Unlock downloads, premium tracks, and more — built for creators.</p>
          </div>
        </div>

        <div className="pricing-controls">
          <div className="billing-toggle" role="tablist" aria-label="Billing Cycle">
            <button
              className={`toggle-btn ${!isAnnual ? 'active' : ''}`}
              role="tab"
              aria-selected={!isAnnual}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`toggle-btn ${isAnnual ? 'active' : ''}`}
              role="tab"
              aria-selected={isAnnual}
              onClick={() => setBillingCycle('annual')}
            >
              Annual <span className="save-badge">Save</span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="pricing-grid">
          {/* Free */}
            <div className="plan-card free">
              <div className="plan-head">
                <div className="plan-name">Free</div>
              </div>

              <div className="original-price">₹9 / month</div>
              <div className="plan-price">
                <div className="price-amount">₹0</div>
                <div className="price-period">/month</div>
              </div>

              <ul className="feature-list">
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  3 downloads/month (Free collection only)
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Ad‑Free Music Discovery
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  High‑Quality Audio Files
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Browse the full Premium collection (downloads excluded)
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  5 VARA‑AI queries per month
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Certificate for YouTube & Social Media
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Coverage for Unlimited Channels
                </li>
              </ul>

              <div className="plan-cta">
                <button
                  className="cta-btn cta-ghost"
                  onClick={() => { window.location.assign('/home'); }}
                  aria-label="Start for Free"
                >
                  START FOR FREE
                </button>
              </div>
            </div>

            {/* Starter (Most Popular) */}
            <div className="plan-card starter">
              <div className="plan-head">
                <div className="plan-name">Starter</div>
              </div>

              <div className="original-price">₹119 / month</div>
              <div className="plan-price">
                <div className="price-amount">{isAnnual ? '₹39' : '₹59'}</div>
                <div className="price-period">/month</div>
              </div>
              <div className="annual-note">
                {isAnnual ? 'Billed annually at ₹39/month' : 'or ₹39/month, billed annually'}
              </div>

              <ul className="feature-list">
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  50 downloads/month (Free + Premium)
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Full download access to the Premium collection
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  200 VARA‑AI queries per month
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Safelist Unlimited YouTube Channels
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Ad‑Free Music Discovery
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  High‑Quality Audio Files
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Certificate for YouTube & Social Media
                </li>
              </ul>

              <div className="plan-cta">
                <button
                  className="cta-btn cta-primary"
                  onClick={busy ? undefined : handleGetPremiumClick}
                  disabled={busy}
                  aria-label="Get Premium Starter plan"
                >
                  {busy ? 'PROCESSING…' : (currentUser ? 'GET PREMIUM' : 'LOGIN & GET PREMIUM')}
                </button>
              </div>
            </div>

            {/* Pro */}
            <div className="plan-card pro">
              <div className="plan-head">
                <div className="plan-name">Pro</div>
                <div className="popular-badge">Most Popular</div>
              </div>

              <div className="original-price">₹189 / month</div>
              <div className="plan-price">
                <div className="price-amount">{isAnnual ? '₹79' : '₹99'}</div>
                <div className="price-period">/month</div>
              </div>
              <div className="annual-note">
                {isAnnual ? 'Billed annually at ₹79/month' : 'or ₹79/month, billed annually'}
              </div>

              <ul className="feature-list">
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  150 downloads/month (Free + Premium)
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Full download access to the Premium collection
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  500 VARA‑AI queries per month
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Safelist Unlimited YouTube Channels
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Ad‑Free Music Discovery
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  High‑Quality Audio Files 
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Certificate for YouTube & Social Media
                </li>
              </ul>

              <div className="plan-cta">
                <button
                  className="cta-btn cta-primary"
                  onClick={busy ? undefined : () => handleBuyPlan('pro')}
                  disabled={busy}
                  aria-label="Get Pro plan"
                >
                  {busy ? 'PROCESSING…' : (currentUser ? 'GET PRO' : 'LOGIN & GET PRO')}
                </button>
              </div>
            </div>

            {/* Pro+ */}
            <div className="plan-card proplus">
              <div className="plan-head">
                <div className="plan-name">Pro+</div>
                <div className="value-badge">Best Value</div>
              </div>

              <div className="original-price">₹379 / month</div>
              <div className="plan-price">
                <div className="price-amount">{isAnnual ? '₹179' : '₹199'}</div>
                <div className="price-period">/month</div>
              </div>
              <div className="annual-note">
                {isAnnual ? 'Billed annually at ₹179/month' : 'or ₹179/month, billed annually'}
              </div>

              <ul className="feature-list">
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  400 downloads/month (Free + Premium)
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Full download access to the Premium collection
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  2,000 VARA‑AI queries per month
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Safelist Unlimited YouTube Channels
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  Ad‑Free Music Discovery
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  High‑Quality Audio Files 
                </li>
                <li className="feature-item">
                  <span className="icon"><CheckmarkIcon /></span>
                  certificate for YouTube & Social Media
                </li>
              </ul>

              <div className="plan-cta">
                <button
                  className="cta-btn cta-primary"
                  onClick={busy ? undefined : () => handleBuyPlan('pro_plus')}
                  disabled={busy}
                  aria-label="Get Pro Plus plan"
                >
                  {busy ? 'PROCESSING…' : (currentUser ? 'GET PRO+' : 'LOGIN & GET PRO+')}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;