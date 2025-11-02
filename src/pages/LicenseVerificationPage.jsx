import { useState, useMemo } from 'react';

function resolveAuthBackendUrl() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  return (
    env.VITE_REACT_APP_AUTH_BACKEND_URL ||
    env.VITE_AUTH_API_URL ||
    env.VITE_AUTH_BACKEND_URL ||
    'http://localhost:5000'
  );
}

function formatDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function LicenseVerificationPage() {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const description = useMemo(
    () => 'Enter your VARA certificate ID (e.g., VARA-58B2-1297) to verify validity.',
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setCopied(false);

    const trimmed = (id || '').trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a Certificate ID.');
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const base = resolveAuthBackendUrl().replace(/\/+$/, '');
      const res = await fetch(`${base}/api/license/verify?id=${encodeURIComponent(trimmed)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || 'Invalid Certificate ID.');
        setResult(null);
      } else {
        setResult(json);
        setError('');
      }
    } catch (err) {
      if (err && (err.name === 'AbortError' || String(err).includes('AbortError'))) {
        setError('The verification request timed out. Please try again.');
      } else {
        setError('Could not verify the certificate. Please try again.');
      }
      setResult(null);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const onCopy = async () => {
    try {
      if (result?.licenseId) {
        await navigator.clipboard.writeText(result.licenseId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {}
  };

  return (
    <div style={{ maxWidth: 760, margin: '64px auto', padding: '0 16px' }}>
      <h1 style={{ marginBottom: 12 }}>certificate Verification</h1>
      <p style={{ opacity: 0.85, marginBottom: 20 }}>{description}</p>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="VARA-XXXX-XXXX"
          aria-label="Certificate ID"
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 18px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #f7c04a 0%, #f2a91f 100%)',
            color: '#111',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Checking…' : 'Verify'}
        </button>
      </form>

      {error && (
        <div style={{
          color: '#ff8a8a',
          marginBottom: 12,
          padding: '8px 10px',
          border: '1px solid rgba(255,0,0,0.25)',
          borderRadius: 8,
          background: 'rgba(255,0,0,0.06)'
        }}>
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: 16,
            background: 'rgba(255,255,255,0.04)'
          }}
        >
          <div style={{ marginBottom: 10, fontWeight: 700 }}>
            {result.message || '✅ Certificate Found'}
          </div>
          <div style={{ lineHeight: 1.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>Certificate ID:</strong> <span>{result.licenseId}</span>
              <button
                onClick={onCopy}
                type="button"
                style={{
                  marginLeft: 6,
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Copy
              </button>
              {copied && <span style={{ fontSize: 12, opacity: 0.8 }}>Copied!</span>}
            </div>

            <div><strong>Issued To:</strong> {result.issuedTo}</div>
            <div><strong>Subscription Status:</strong> {result.subscriptionStatus}</div>
            <div><strong>Valid For:</strong> {result.validFor}</div>
            {result.songTitle && <div><strong>Track:</strong> {result.songTitle}</div>}
            {result.issuedAtUtcIso && (
              <div><strong>Issued At (UTC):</strong> {new Date(result.issuedAtUtcIso).toUTCString()}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}