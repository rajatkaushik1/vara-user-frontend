import { useEffect, useState, useRef } from 'react';
import './DownloadBadge.css';

function resolveAuthBackendUrl() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  return env.VITE_REACT_APP_AUTH_BACKEND_URL || env.VITE_AUTH_API_URL || env.VITE_AUTH_BACKEND_URL || 'http://localhost:5000';
}

export default function DownloadBadge({ isLoggedIn = false }) {
  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Guards and timers
  const inFlightRef = useRef(false);
  const lastFetchRef = useRef(0);
  const abortRef = useRef(null);
  const mountTimeRef = useRef(0);

  const THROTTLE_MS = 2000;
  const INITIAL_QUIET_MS = 1000; // ignore focus/visibility events for 1s after mount

  const fetchLimits = async ({ force = false } = {}) => {
    if (!isLoggedIn) return null;

    const now = Date.now();
    // Respect throttle unless specifically forced by a download event
    if (!force && now - lastFetchRef.current < THROTTLE_MS) {
      return null;
    }
    if (inFlightRef.current) {
      return null;
    }

    inFlightRef.current = true;
    lastFetchRef.current = now;

    try {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      const authBase = resolveAuthBackendUrl().replace(/\/+$/, '');
      const url = `${authBase}/api/user/limits?_=${Date.now()}`;

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: abortRef.current.signal
      });

      if (res.status === 401) {
        setData(null);
        setVisible(false);
        setLoaded(true);
        return null;
      }
      if (!res.ok) {
        setLoaded(true);
        return null;
      }

      const json = await res.json();
      setData(json);
      setVisible(true);
      setLoaded(true);
      return json;
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setLoaded(true);
      }
      return null;
    } finally {
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    // Reset on logout
    if (!isLoggedIn) {
      setVisible(false);
      setData(null);
      setLoaded(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    mountTimeRef.current = Date.now();

    // StrictMode re-mount guard (dev): avoid running the initial fetch twice
    const hasInitGlobal = typeof window !== 'undefined' && window.__VARA_DL_BADGE_INIT__ === true;

    let initialTimer = null;

    if (!hasInitGlobal) {
      if (typeof window !== 'undefined') {
        window.__VARA_DL_BADGE_INIT__ = true;
      }
      // First time in session: do one initial fetch immediately
      fetchLimits({ force: true });
    } else {
      // Already initialized in this session (likely StrictMode re-mount)
      // Do not force a second immediate fetch. Optionally schedule a non-forced fetch after a short delay.
      initialTimer = setTimeout(() => fetchLimits({ force: false }), 500);
    }

    // Event-driven refresh (download event + focus + visibility)
    const onDownloadRecorded = (e) => {
      const detail = e?.detail || {};
      if (typeof detail.remaining === 'number') {
        setData((d) => (d ? { ...d, remaining: Math.max(0, detail.remaining) } : d));
      } else if (typeof detail.optimisticDelta === 'number') {
        setData((d) => (d ? { ...d, remaining: Math.max(0, Number(d.remaining ?? 0) + detail.optimisticDelta) } : d));
      }
      // Downloads are authoritative → allow forced refresh
      fetchLimits({ force: true });
    };

    const onFocus = () => {
      // Ignore focus storms immediately after mount
      if (Date.now() - mountTimeRef.current < INITIAL_QUIET_MS) return;
      fetchLimits();
    };

    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - mountTimeRef.current < INITIAL_QUIET_MS) return;
      fetchLimits();
    };

    window.addEventListener('vara:download-recorded', onDownloadRecorded, { passive: true });
    window.addEventListener('focus', onFocus, { passive: true });
    document.addEventListener('visibilitychange', onVis, { passive: true });

    return () => {
      window.removeEventListener('vara:download-recorded', onDownloadRecorded);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);

      if (abortRef.current) abortRef.current.abort();
      inFlightRef.current = false;

      if (initialTimer) clearTimeout(initialTimer);
    };
  }, [isLoggedIn]);

  // Hide entirely when not logged in or not yet loaded/visible
  if (!isLoggedIn || !loaded || !visible || !data) return null;

  const remaining = Math.max(0, Number(data?.remaining ?? 0));
  const monthlyLimit = Math.max(0, Number(data?.monthlyLimit ?? 0));
  const tooltip = `${remaining} of ${monthlyLimit} downloads left this month`;

  return (
    <div
      className="download-badge"
      role="status"
      title={tooltip}
      aria-label={tooltip}
    >
      <span className="download-badge__count">{remaining}</span>
      <span className="download-badge__note" aria-hidden="true">♪</span>
    </div>
  );
}
