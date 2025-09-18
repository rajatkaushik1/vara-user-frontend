import { useEffect, useRef } from 'react';

/**
 * useContentVersion
 * - Polls a small JSON endpoint (versionUrl) periodically and on focus/visibility change.
 * - When it detects a change in "v", it invokes onChange(newVersion, fullPayload).
 *
 * Options:
 * - versionUrl: string (required) — typically `${API_BASE_URL}/api/content/version`
 * - onChange: (newVersion: number, data: { v, songs, genres, subgenres, instruments, updatedAt }) => void (required)
 * - intervalMs: number (optional) — default 15000 ms
 *
 * Hardening:
 * - Store onChange in a ref and REMOVE it from the effect dependencies (prevents effect restart on re-renders).
 * - Add a 1s cooldown so initial + focus + visibility don't trigger multiple immediate calls.
 * - Add a global "single instance" guard to avoid duplicate setup in dev/HMR.
 */
export function useContentVersion({ versionUrl, onChange, intervalMs = 15000 }) {
  const lastVersionRef = useRef(null);
  const timerRef = useRef(null);

  // Keep the latest onChange in a ref so the effect doesn't depend on its identity.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Cooldown to collapse multiple triggers (initial + focus + visibility) fired nearly at once.
  const lastLoadAtRef = useRef(0);
  const COOLDOWN_MS = 1000; // 1 second

  // Optional debug toggle (set to true temporarily if you need console traces)
  const DEBUG = false;

  useEffect(() => {
    if (!versionUrl || typeof onChangeRef.current !== 'function') return;

    // Prevent duplicate initializations per page (dev StrictMode/HMR safety).
    const INIT_FLAG = '__VARA_CONTENT_VERSION_INIT__';
    if (typeof window !== 'undefined') {
      if (window[INIT_FLAG]) {
        if (DEBUG) console.log('[useContentVersion] Duplicate init prevented.');
        return; // already initialized for this page
      }
      window[INIT_FLAG] = true;
    }

    let cancelled = false;

    const load = async (reason = 'interval') => {
      // Throttle calls: skip if within cooldown window
      const now = Date.now();
      if (now - lastLoadAtRef.current < COOLDOWN_MS) {
        if (DEBUG) console.log(`[useContentVersion] Skipping "${reason}" due to cooldown.`);
        return;
      }
      lastLoadAtRef.current = now;

      try {
        if (DEBUG) console.log(`[useContentVersion] load("${reason}") → fetching ${versionUrl}`);
        const res = await fetch(versionUrl, { cache: 'no-store' });
        if (!res.ok) return; // silent fail
        const data = await res.json();

        // First run: store current version silently
        if (lastVersionRef.current === null) {
          lastVersionRef.current = typeof data?.v === 'number' ? data.v : 0;
          if (DEBUG) console.log(`[useContentVersion] initial v=${lastVersionRef.current}`);
          return;
        }

        // Detect change
        if (data && typeof data.v === 'number' && data.v !== lastVersionRef.current) {
          lastVersionRef.current = data.v;
          if (!cancelled && typeof onChangeRef.current === 'function') {
            try {
              if (DEBUG) console.log(`[useContentVersion] version changed → ${data.v} (reason: ${reason})`);
              onChangeRef.current(data.v, data);
            } catch {
              // swallow to avoid breaking the hook
            }
          }
        }
      } catch {
        // swallow transient errors
      }
    };

    const onFocus = () => load('focus');
    const onVisibility = () => {
      if (document.visibilityState === 'visible') load('visibility');
    };

    // Initial check
    load('initial');

    // Polling (min 3s)
    timerRef.current = setInterval(() => load('interval'), Math.max(3000, intervalMs));

    // Listeners
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      // We intentionally DO NOT clear the INIT_FLAG so the hook stays single-instance per page.
    };
  }, [versionUrl, intervalMs]); // NOTE: onChange intentionally NOT included
}

export default useContentVersion;
