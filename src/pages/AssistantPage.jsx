import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AUTH_BASE_URL, TASTE_ENDPOINTS } from '../config';
import LotusLoader from '../components/LotusLoader';
import Tooltip from '../components/Tooltip';
import premiumLotusIcon from '/premium-lotus-icon.png';
import { PlayIcon, PauseIcon, HeartIcon, DownloadIcon } from '../components/Icons';

const INSTRUMENT_PILL_STYLE = { backgroundColor: '#21c45d', color: '#ffffff' };
const MOOD_PILL_STYLE = { backgroundColor: '#8e44ad', color: '#ffffff' };
const MAX_CHARS = 1800; // hard cap for prompt textarea

// Thinking ticker phrases (AI vibe)
const AI_TICKER_LINES = [
  'Analyzing your vibe...',
  'Finding songs that match your mood...',
  'Turning feelings into playlists...',
  'Mixing the perfect soundtrack...',
  'Curating tracks just for you...',
  'Scanning the soundscape...',
  'Setting the right tone...',
  'Digging through virtual crates...',
  'Tuning your playlist...',
  'Vibing with your prompt...',
  'Looking for hidden gems...',
  'Matching energy levels...',
  'Building your perfect mix...',
  'Connecting beats with emotions...',
  'Searching across genres...',
  'Finding rhythm in your words...',
  'Translating your mood into music...',
  'Sampling sonic possibilities...',
  'Adjusting the frequency...',
  'Warming up the speakers...',
  'Feeling your vibe, finding your sound...',
  'Spinning up the soundtrack...',
  'Recommending your next favorite song...',
  'Listening to your mood (metaphorically)...',
  'Digging deep into the archives...',
  'Blending moods and melodies...',
  'Surfing the soundwaves...',
  'Your sonic matchmaker is at work...',
  'Composing the vibe...',
  'Just a few beats away...',
  'Browsing endless playlists...',
  'Picking tracks that resonate...',
  'Fine-tuning recommendations...',
  'Jamming with your prompt...',
  'Searching for the perfect rhythm...',
  'Matching lyrics to your mood...',
  'Setting the tempo...',
  'Syncing energy and melody...',
  'Making sure it feels right...',
  'Almost ready to play...',
  'Checking BPMs and emotions...',
  'Curating something special...',
  'Calibrating your vibe meter...',
  'Crafting your musical journey...',
  'Running final sound checks...',
  'Getting in tune with your mood...',
  'Loading some magic...',
  'Queueing your next anthem...',
  'Making sure it flows just right...',
  'Ready to drop your mix in 3… 2… 1…'
];

// Helper: in-place Fisher–Yates shuffle
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Hoisted, stable component: VocalsDropdown
const VocalsDropdown = React.memo(function VocalsDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (ev) => {
      if (rootRef.current && !rootRef.current.contains(ev.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick, true);
    document.addEventListener('touchstart', onDocClick, { passive: true, capture: true });
    return () => {
      document.removeEventListener('mousedown', onDocClick, true);
      document.removeEventListener('touchstart', onDocClick, true);
    };
  }, []);

  const currentLabel = value === 'on' ? 'With Vocals' : 'Instrumental';

  return (
    <div className={`ai-pill-dropdown ${open ? 'open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="ai-pill-header"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{currentLabel}</span>
        <span className="ai-caret" aria-hidden="true"></span>
      </button>
      <ul className="ai-pill-options" role="listbox" aria-label="Vocals">
        <li
          className={`ai-pill-option ${value === 'off' ? 'selected' : ''}`}
          role="option"
          aria-selected={value === 'off'}
          onClick={(e) => { e.stopPropagation(); onChange('off'); setOpen(false); }}
        >
          Instrumental
        </li>
        <li
          className={`ai-pill-option ${value === 'on' ? 'selected' : ''}`}
          role="option"
          aria-selected={value === 'on'}
          onClick={(e) => { e.stopPropagation(); onChange('on'); setOpen(false); }}
        >
          With Vocals
        </li>
      </ul>
    </div>
  );
});

// Hoisted, stable component: QuantityPill
const QuantityPill = React.memo(function QuantityPill({ value, onChange, min = 3, max = 10 }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (ev) => {
      if (rootRef.current && !rootRef.current.contains(ev.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick, true);
    document.addEventListener('touchstart', onDocClick, { passive: true, capture: true });
    return () => {
      document.removeEventListener('mousedown', onDocClick, true);
      document.removeEventListener('touchstart', onDocClick, true);
    };
  }, []);

  const nums = Array.from({ length: (max - min + 1) }, (_, i) => min + i);

  return (
    <div className="ai-qty-wrap" ref={rootRef}>
      <span className="ai-qty-label">Quantity (3-10)</span>
      <div
        className={`ai-qty-pill ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ai-qty-value">{value}</span>
        <div className="ai-qty-dropdown">
          {nums.map((n) => (
            <div
              key={n}
              className={`ai-qty-option ${n === value ? 'selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); onChange(n); setOpen(false); }}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

function AssistantPage({
  currentUser,
  handlePlayPause,
  currentPlayingSong,
  isPlaying,
  formatTime,
  favouriteSongs,
  handleToggleFavourite,
  handleDownload,
  currentSongId
}) {
  const [queryText, setQueryText] = useState('');
  const [vocals, setVocals] = useState('off'); // 'off' | 'on'
  const [topK, setTopK] = useState(10);
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  // AI usage indicator
  const [aiInfo, setAiInfo] = useState({ monthlyLimit: null, usedThisMonth: null, remaining: null });
  const fetchAiLimits = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_BASE_URL.replace(/\/+$/, '')}/api/user/limits?_=${Date.now()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) {
        setAiInfo({ monthlyLimit: null, usedThisMonth: null, remaining: null });
        return;
      }
      const j = await res.json();
      const ai = j && j.ai ? j.ai : null;
      if (ai && typeof ai.monthlyLimit === 'number') {
        setAiInfo({ monthlyLimit: ai.monthlyLimit, usedThisMonth: ai.usedThisMonth, remaining: ai.remaining });
      } else {
        setAiInfo({ monthlyLimit: null, usedThisMonth: null, remaining: null });
      }
    } catch {
      setAiInfo({ monthlyLimit: null, usedThisMonth: null, remaining: null });
    }
  }, []);

  // Enrich AI results with duration (and fill any missing core fields) via Admin API
  const enrichResultsWithDurations = useCallback(async (rawResults = []) => {
    try {
      if (!Array.isArray(rawResults) || rawResults.length === 0) return rawResults;

      // Collect unique IDs (support both songId and _id)
      const ids = Array.from(
        new Set(
          rawResults
            .map((r) => {
              const v = r?.songId ?? r?._id;
              return typeof v === 'string' || typeof v === 'number' ? String(v) : '';
            })
            .filter(Boolean)
        )
      );
      if (ids.length === 0) return rawResults;

      // Fetch full songs by ids from Admin API
      const url = TASTE_ENDPOINTS.getSongsByIds(ids);
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        // On failure, return as-is; UI will hide duration
        return rawResults.map((r) => ({ ...r, duration: undefined }));
      }
      const fullSongs = await res.json();
      const byId = new Map(
        (Array.isArray(fullSongs) ? fullSongs : []).map((s) => [String(s?._id), s])
      );

      // Merge duration (and optionally fill missing core metadata)
      const merged = rawResults.map((r) => {
        const sid = String(r?.songId ?? r?._id ?? '');
        const s = byId.get(sid);
        if (!s) {
          return { ...r, duration: undefined }; // hide if not found
        }
        return {
          ...r,
          // Duration from Admin API
            duration: typeof s.duration === 'number' ? s.duration : undefined,

          // Soft-fill any missing fields so cards stay consistent with home
          imageUrl: r.imageUrl || s.imageUrl || r.imageURL || undefined,
          audioUrl: r.audioUrl || s.audioUrl || undefined,
          bpm: r.bpm ?? s.bpm,
          key: r.key ?? s.key,
          hasVocals: r.hasVocals ?? s.hasVocals,
          collectionType: r.collectionType ?? s.collectionType,
          genres: (Array.isArray(r.genres) && r.genres.length) ? r.genres : s.genres,
          subGenres: (Array.isArray(r.subGenres) && r.subGenres.length) ? r.subGenres : s.subGenres,
          moods: (Array.isArray(r.moods) && r.moods.length) ? r.moods : s.moods,
          instruments: (Array.isArray(r.instruments) && r.instruments.length) ? r.instruments : s.instruments,
        };
      });

      return merged;
    } catch {
      // Hide duration on error to avoid showing 0:00
      return rawResults.map((r) => ({ ...r, duration: undefined }));
    }
  }, []);

  const [tickerText, setTickerText] = useState('');
  const tickerRef = useRef({ timer: null, items: [], index: 0 });
  

  // Refs and helpers for auto-growing textarea and result scroll
  const resultsRef = useRef(null);
  const promptRef = useRef(null);
  const MAX_TA_HEIGHT = 220; // cap before scrollbar for textarea

  const autoResize = () => {
    const ta = promptRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const next = Math.min(ta.scrollHeight, MAX_TA_HEIGHT);
    ta.style.height = `${next}px`;
    ta.style.overflowY = ta.scrollHeight > MAX_TA_HEIGHT ? 'auto' : 'hidden';
  };

  const requestRecs = useCallback(async () => {
    setError('');
    setLoading(true);
    setResults([]);
    setIntent(null);
    try {
      // Optional guard: if we know remaining is 0, short-circuit with a friendly error
      if (currentUser && aiInfo && typeof aiInfo.remaining === 'number' && aiInfo.remaining <= 0) {
        setError('You’ve reached your monthly VARA‑AI limit for this plan.');
        setLoading(false);
        return;
      }

      // Enhanced fetch with 401/429 handling and limits refresh
      const res = await fetch(`${AUTH_BASE_URL.replace(/\/+$/, '')}/api/ai/recommend`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ queryText, vocals, topK })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setError('Please log in to use VARA‑AI.');
        return;
      }
      if (res.status === 429 && (data?.error === 'AI_LIMIT_REACHED')) {
        setError('You’ve reached your monthly VARA‑AI limit for this plan.');
        // Re-fetch limits to update the badge
        try { await fetchAiLimits(); } catch {}
        return;
      }
      if (!res.ok || !data || data.ok === false) {
        throw new Error(data?.message || 'Recommendation request failed');
      }
      setIntent(data.intent || null);

      // Set initial results immediately for responsiveness, then enrich in background
      const baseResults = Array.isArray(data.results) ? data.results : [];
      setResults(baseResults);

      // Enrich with durations (and soft-fill metadata); update results once
      try {
        const enriched = await enrichResultsWithDurations(baseResults);
        if (Array.isArray(enriched) && enriched.length) {
          setResults(enriched);
        }
      } catch { /* no-op; keep baseResults */ }

      // Successful call → refresh limits (remaining may have decreased)
      try { await fetchAiLimits(); } catch {}
    } catch (e) {
      setError(e?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, [queryText, vocals, topK]);

  const handlePromptKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow newline; then auto-resize
      // No preventDefault → lets the textarea insert '\n'
      setTimeout(autoResize, 0);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (queryText.trim() && !loading) requestRecs();
    }
  };

  // Initial auto-resize
  useEffect(() => { autoResize(); }, []);

  // Scroll to results once they load
  useEffect(() => {
    if (!loading && Array.isArray(results) && results.length > 0 && resultsRef.current) {
      setTimeout(() => {
        const header = document.querySelector('.header');
        const offset = (header ? header.offsetHeight : 0) + 12;
        const y = resultsRef.current.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 150);
    }
  }, [loading, results]);

  useEffect(() => {
    // Clear any previous timer on change
    if (tickerRef.current.timer) {
      clearTimeout(tickerRef.current.timer);
      tickerRef.current.timer = null;
    }

    if (loading) {
      // Build a fresh, randomized pool (3–5 lines)
      const pool = shuffleArray(AI_TICKER_LINES);
      const count = 3 + Math.floor(Math.random() * 3); // 3..5
      const items = pool.slice(0, count);

      tickerRef.current.items = items;
      tickerRef.current.index = 0;
      setTickerText(items[0] || '');

      const loop = () => {
        const delay = 500 + Math.floor(Math.random() * 1000); // 0.5–1.5s
        tickerRef.current.timer = setTimeout(() => {
          const { items } = tickerRef.current;
          if (!Array.isArray(items) || items.length === 0) return;
          tickerRef.current.index = (tickerRef.current.index + 1) % items.length;
          setTickerText(items[tickerRef.current.index] || '');
          loop();
        }, delay);
      };
      loop();
    } else {
      // Stop + reset
      setTickerText('');
    }

    // On unmount or change
    return () => {
      if (tickerRef.current.timer) {
        clearTimeout(tickerRef.current.timer);
        tickerRef.current.timer = null;
      }
    };
  }, [loading]);

  // Fetch AI limits on mount and when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchAiLimits();
    } else {
      setAiInfo({ monthlyLimit: null, usedThisMonth: null, remaining: null });
    }
  }, [currentUser, fetchAiLimits]);

  const renderResultCard = (r, idx) => {
    const isFav = favouriteSongs instanceof Set ? favouriteSongs.has(r.songId) : false;
    const isCurrent = currentPlayingSong && (currentPlayingSong._id === r.songId);

    // Normalize to the shape your existing handlers expect (match home card)
    const song = {
      _id: r.songId,
      title: r.title,
      imageUrl: r.imageUrl,
      audioUrl: r.audioUrl,
      bpm: r.bpm,
      key: r.key,
      hasVocals: r.hasVocals,
      collectionType: r.collectionType,
      genres: r.genres,
      subGenres: r.subGenres,
      moods: r.moods,
      instruments: r.instruments,
      duration: r.duration
    };

    const matchText = (typeof r.why === 'string' && r.why.trim())
      ? (r.why.trim().toLowerCase().startsWith('matches') ? r.why.trim() : `Matches: ${r.why.trim()}`)
      : null;

    return (
      <div key={r.songId} className="ai-card-wrap">
        <div className="raw-card-sizer ai-enter">
          <div className="song-card">
            <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'}
                alt={song.title}
                className="song-card-image"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }}
              />
              <button
                className="cover-play-button"
                onClick={() => handlePlayPause && handlePlayPause(song, results)}
                aria-label="Play/Pause"
                style={{ position: 'absolute', left: 10, bottom: 10 }}
              >
                {isCurrent && isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            </div>

            {(song.collectionType === 'premium' || song.collectionType === 'paid') && (
              <div className="premium-indicator">
                <Tooltip text={<span>Premium<br />song</span>}>
                  <img src={premiumLotusIcon} alt="Premium" className="premium-indicator-icon" />
                </Tooltip>
              </div>
            )}

            <div className="song-text-and-button-wrapper">
              <div className="song-card-info">
                <h4>{song.title}</h4>

                {/* Pills: genres, sub-genres, instruments (green), moods (purple) */}
                <div className="genre-scroll-wrapper">
                  {song.genres?.length > 0 && (
                    <div className="genre-pill-container">
                      {song.genres.map((g, gi) => (
                        <span key={g?._id || `g-${gi}`} className="genre-pill">{g?.name || 'Genre'}</span>
                      ))}
                    </div>
                  )}

                  {song.subGenres?.length > 0 && (
                    <div className="subgenre-pill-container">
                      {song.subGenres.map((sg, sgi) => (
                        <span key={sg?._id || `sg-${sgi}`} className="subgenre-pill">{sg?.name || 'Sub-genre'}</span>
                      ))}
                    </div>
                  )}

                  {song.instruments?.length > 0 && (
                    <div className="instrument-pill-container">
                      {song.instruments.map((ins, ii) => (
                        <span
                          key={ins?._id || `ins-${ii}`}
                          className="subgenre-pill"
                          style={INSTRUMENT_PILL_STYLE}
                        >
                          {ins?.name || 'Instrument'}
                        </span>
                      ))}
                    </div>
                  )}

                  {song.moods?.length > 0 && (
                    <div className="instrument-pill-container">
                      {song.moods.map((m, mi) => (
                        <span
                          key={m?._id || `m-${mi}`}
                          className="subgenre-pill"
                          style={MOOD_PILL_STYLE}
                        >
                          {m?.name || 'Mood'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="song-card-bottom-row_final">
                <div className="metadata-grid">
                  <div className="card-row">
                    <div className="card-column left">
                      <Tooltip text="Beats Per Minute">
                        <span className="metadata-item">{song.bpm || ''}</span>
                      </Tooltip>
                    </div>
                    <div className="card-column center">
                      <Tooltip text="Download this song">
                        <button className="icon-button" onClick={() => handleDownload && handleDownload(song)} aria-label="Download song">
                          <DownloadIcon />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="card-column right">
                      <Tooltip text="Musical key">
                        <span className="metadata-item">{song.key || ''}</span>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="card-row">
                    <div className="card-column left">
                      <Tooltip text="Song length">
                        <span className="song-timestamp">
        { (typeof song?.duration === 'number' && isFinite(song.duration) && song.duration > 0 && typeof formatTime === 'function')
          ? formatTime(song.duration)
          : '' }
      </span>
                      </Tooltip>
                    </div>
                    <div className="card-column center">
                      <Tooltip text={isFav ? "Remove from favorites" : "Add to favorites"}>
                        <button className="icon-button" onClick={() => handleToggleFavourite && handleToggleFavourite(song._id)} aria-label="Add to favourites">
                          <HeartIcon filled={isFav} />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="card-column right">
                      {song.hasVocals && (
                        <Tooltip text="Contains vocals">
                          <img src="/vocal-icon.png" alt="Vocals" className="vocal-icon" title="This song contains vocals" />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yellow Matches banner hugging the card */}
        {matchText && (
          <div className="ai-match-banner">{matchText}</div>
        )}
      </div>
    );
  };

  return (
    <div className="ai-page">
      <div className="ai-hero">
        {/* Lotus (wider orbit) */}
        <div className="ai-lotus-wrap">
          <LotusLoader active={loading} size={140} orbitScale={1.52} radiusFactor={0.74} />
        </div>

        {/* Keep logo size; increase gap via CSS */}
        <img
          src="/AI%20logo.png"
          alt="VARA-AI"
          className="ai-logo"
          draggable="false"
        />

        <p className="ai-tagline">
          Describe a script, a scene, a mood, a personality, or just a certain sound.
        </p>

        {currentUser && typeof aiInfo.remaining === 'number' && typeof aiInfo.monthlyLimit === 'number' && (
          <div className="ai-usage-badge" role="status" aria-live="polite">
            VARA‑AI: {aiInfo.remaining} / {aiInfo.monthlyLimit} left this month
          </div>
        )}

        <div className="ai-prompt">
          <div className="ai-prompt-wrap">
            <textarea
              ref={promptRef}
              placeholder={"Don't overthink it, just describe a mood or scene..."}
              value={queryText}
              onChange={(e) => {
                const next = e.target.value.slice(0, MAX_CHARS);
                setQueryText(next);
                autoResize();
              }}
              onKeyDown={handlePromptKeyDown}
              onPaste={(e) => {
                // Enforce the cap on paste (prevents overflow visually)
                const pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
                const selStart = e.currentTarget.selectionStart ?? queryText.length;
                const selEnd = e.currentTarget.selectionEnd ?? queryText.length;
                const before = queryText.slice(0, selStart);
                const after = queryText.slice(selEnd);
                const remaining = MAX_CHARS - (before.length + after.length);
                if (pasted.length > remaining) {
                  e.preventDefault();
                  const next = (before + pasted.slice(0, Math.max(remaining, 0)) + after);
                  setQueryText(next);
                  requestAnimationFrame(autoResize);
                }
              }}
              maxLength={MAX_CHARS}
              className="ai-prompt-textarea"
              disabled={loading}
              rows={3}
            />
            <span className={`ai-char-counter ${queryText.length >= MAX_CHARS ? 'at-limit' : ''}`}>
              {queryText.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Thinking ticker (appears while loading) */}
        <div className={`ai-thinking ${loading ? 'show' : ''}`} aria-live="polite">
          {loading && tickerText ? (
            <div className="ai-thinking-line" key={tickerText}>{tickerText}</div>
          ) : null}
        </div>

        {/* Pills row */}
        <div className="ai-controls">
          <VocalsDropdown value={vocals} onChange={setVocals} />
          <QuantityPill value={topK} onChange={(n) => setTopK(Math.max(3, Math.min(20, Number(n) || 10)))} />
        </div>

        {/* CTA row on its own line */}
        <div className="ai-cta-row">
          <button
            className="ai-cta"
            onClick={requestRecs}
            disabled={!queryText.trim() || loading}
          >
            {loading ? 'Finding…' : 'Get Tracks'}
          </button>
        </div>

        {/* Show More Detail button only when results exist */}
        {results.length > 0 && (
          <div className="ai-secondary-row">
            <button
              className="ai-debug-btn"
              onClick={() => setShowDebug(s => !s)}
            >
              {showDebug ? 'Hide Details' : 'Show More Detail'}
            </button>
          </div>
        )}

        {error && <div className="ai-error">❌ {error}</div>}

        {showDebug && intent && (
          <pre className="ai-debug-box">{JSON.stringify(intent, null, 2)}</pre>
        )}
      </div>

      <div className="ai-results" ref={resultsRef}>
        {results.length === 0 && !loading && !error && (
          <div className="ai-placeholder">No results yet — try a query above.</div>
        )}
        {results.length > 0 && (
          <div className="ai-results-wrap">
            <div className="raw-library-grid">
              {results.map((r, idx) => renderResultCard(r, idx))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ai-page {
          --gold1: #ffc107;
          --gold2: #ff9800;
          --left: #050405;
          --mid: #0b0b0b;
          --text: #ffffff;
          --card: #151515;
          --cardBorder: #242424;
          --pillText: #050405;
          color: var(--text);
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(90deg, var(--left) 0%, var(--mid) 45%, rgba(235,186,47,0.10) 70%, rgba(235,186,47,0.26) 100%);
          padding: 32px 16px 24px;
        }
        .ai-hero {
          max-width: 960px;
          margin: 0 auto 32px;
          text-align: center;
          border-radius: 18px;
          padding: 28px 18px 22px;
          border: none; /* remove border */
          background: rgba(0,0,0,0.06);
        }
        .ai-lotus-wrap {
          display: grid;
          place-items: center;
          margin-bottom: 56px; /* ensure particles never touch logo */
        }

        .ai-logo {
          width: 180px;  /* keep original size */
          height: auto;
          margin: 6px auto 10px;
          user-select: none;
          -webkit-user-drag: none;
        }

        .ai-tagline {
          margin: 8px 0 18px;
          color: rgba(255,255,255,.85);
          font-size: 16px;
        }

        .ai-prompt { display: grid; place-items: center; }
        .ai-prompt-input {
          width: min(720px, 100%);
          height: 56px;
          padding: 0 20px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(15, 15, 15, 0.9);
          color: var(--text);
          outline: none;
          transition: box-shadow .2s ease, border-color .2s ease;
        }
        .ai-prompt-input::placeholder { color: rgba(255,255,255,0.55); }
        .ai-prompt-input:focus {
          border-color: rgba(255, 193, 7, 0.65);
          box-shadow: 0 0 22px rgba(255, 193, 7, 0.25);
        }
        .ai-prompt-input:disabled { opacity: .7; cursor: not-allowed; }

        /* Pills row (only pills here) */
        .ai-controls {
          margin: 18px auto 0;
          display: flex;
          gap: 18px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        /* CTA on its own line */
        .ai-cta-row {
          display: grid;
          place-items: center;
          margin-top: 16px; /* ensure it's on a new row */
          margin-bottom: 6px;
        }

        /* Gold pill dropdown (vocals) */
        .ai-pill-dropdown {
          position: relative;
          width: 200px;
          border-radius: 25px;
          background: linear-gradient(90deg, var(--gold1), var(--gold2));
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.7);
          overflow: hidden;
        }
        .ai-pill-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          cursor: pointer;
          font-weight: bold;
          color: var(--pillText);
          background: transparent;
          border: none;
        }
        .ai-caret {
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid var(--pillText);
          transition: transform .2s ease-out;
        }
        .ai-pill-dropdown.open .ai-caret { transform: rotate(180deg); }

        .ai-pill-options {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 0;
          overflow: hidden;
          transition: max-height .25s ease-out;
          background: linear-gradient(90deg, var(--gold1), var(--gold2));
          border-top: 1px solid rgba(5,4,5,0.2);
        }
        .ai-pill-dropdown.open .ai-pill-options { max-height: 120px; }
        .ai-pill-option {
          padding: 8px 20px;
          color: var(--pillText);
          cursor: pointer;
        }
        .ai-pill-option:hover { background-color: rgba(0,0,0,0.1); }
        .ai-pill-option.selected { font-weight: bold; background-color: rgba(0,0,0,0.05); }

        /* Quantity pill */
        .ai-qty-wrap { display: flex; align-items: center; gap: 12px; }
        .ai-qty-label { color: var(--text); font-weight: bold; }
        .ai-qty-pill {
          position: relative;
          width: 80px;
          height: 45px;
          display: grid;
          place-items: center;
          background: linear-gradient(90deg, var(--gold1), var(--gold2));
          border-radius: 25px;
          box-shadow: 0 0 10px rgba(255, 193, 7, 0.7);
          color: var(--pillText);
          font-weight: bold;
          font-size: 1.1em;
          user-select: none;
          cursor: pointer;
        }
        .ai-qty-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          max-height: 0;
          opacity: 0;
          overflow-y: auto;
          overflow-x: hidden;
          background: linear-gradient(90deg, var(--gold1), var(--gold2));
          border-radius: 15px;
          box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
          margin-top: 10px;
          transition: max-height 0.25s ease-out, opacity 0.25s ease-out;
          z-index: 10;
          border: 1px solid rgba(5, 4, 5, 0.1);
        }
        .ai-qty-pill.open .ai-qty-dropdown { max-height: 200px; opacity: 1; }
        .ai-qty-option { padding: 8px 15px; color: var(--pillText); cursor: pointer; }
        .ai-qty-option:hover { background-color: rgba(0, 0, 0, 0.1); }
        .ai-qty-option.selected { font-weight: bold; background-color: rgba(0, 0, 0, 0.05); }

        /* CTA (gold pill) */
        .ai-cta {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 15px 30px;
          background: linear-gradient(90deg, var(--gold1), var(--gold2));
          border-radius: 30px;
          border: none;
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
          color: var(--pillText);
          font-size: 1.2em;
          font-weight: bold;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .ai-cta:hover { transform: translateY(-2px); box-shadow: 0 0 25px rgba(255, 193, 7, 1); }
        .ai-cta:active { transform: translateY(0); box-shadow: 0 0 10px rgba(255, 193, 7, 0.6); }
        .ai-cta:disabled { opacity: .7; cursor: not-allowed; }

        /* Results */
        .ai-results { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
        .ai-placeholder { opacity: 0.75; padding: 12px; text-align: center; }
        .ai-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 16px;
          margin-top: 12px;
        }
        /* Wrapper for card + banner */
        .ai-card-wrap { display: flex; flex-direction: column; }
        /* Matches banner (yellow, hugging the card) */
        .ai-match-banner {
          background: #ebba2f;
          color: #050405;
          font-weight: 700;
          font-size: clamp(12px, 0.95vw, 14px);
          padding: 10px 16px;
          border-radius: 0 0 12px 12px;
          margin-top: -6px;
          box-shadow: 0 4px 12px rgba(235,186,47,0.25);
          line-height: 1.3;
        }

        /* Constrain debug box height */
        .ai-debug-box { max-height: 280px; overflow-y: auto; }

        /* Textarea styling with auto-grow cap + scrollbar */
        .ai-prompt-textarea {
          width: min(720px, 100%);
          min-height: 56px;
          max-height: 220px;
          padding: 12px 20px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(15, 15, 15, 0.9);
          color: #fff;
          outline: none;
          resize: none;
          overflow-y: hidden;
          transition: box-shadow .2s ease, border-color .2s ease;
        }
        .ai-prompt-textarea::placeholder { color: rgba(255,255,255,0.55); }
        .ai-prompt-textarea:focus {
          border-color: rgba(255, 193, 7, 0.65);
          box-shadow: 0 0 22px rgba(255, 193, 7, 0.25);
        }

        /* AI-only: 40px side gutters and allow each row to fit banner height */
        .ai-results-wrap { padding: 0 40px; }
        .ai-results .raw-library-grid {
          grid-auto-rows: auto;     /* grow to fit banner + card */
          align-content: start;
        }

        /* Keep/ensure enter animation */
        @keyframes aiFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ai-enter {
          opacity: 0;
          animation: aiFadeUp 480ms ease-out forwards;
        }

        /* Stagger animation using .ai-results */
        .ai-results .ai-card-wrap:nth-child(1)  .ai-enter { animation-delay: 30ms; }
        .ai-results .ai-card-wrap:nth-child(2)  .ai-enter { animation-delay: 60ms; }
        .ai-results .ai-card-wrap:nth-child(3)  .ai-enter { animation-delay: 90ms; }
        .ai-results .ai-card-wrap:nth-child(4)  .ai-enter { animation-delay: 120ms; }
        .ai-results .ai-card-wrap:nth-child(5)  .ai-enter { animation-delay: 150ms; }
        .ai-results .ai-card-wrap:nth-child(6)  .ai-enter { animation-delay: 180ms; }
        .ai-results .ai-card-wrap:nth-child(7)  .ai-enter { animation-delay: 210ms; }
        .ai-results .ai-card-wrap:nth-child(8)  .ai-enter { animation-delay: 240ms; }
        .ai-results .ai-card-wrap:nth-child(9)  .ai-enter { animation-delay: 270ms; }
        .ai-results .ai-card-wrap:nth-child(10) .ai-enter { animation-delay: 300ms; }
        .ai-results .ai-card-wrap:nth-child(11) .ai-enter { animation-delay: 330ms; }
        .ai-results .ai-card-wrap:nth-child(12) .ai-enter { animation-delay: 360ms; }

        /* === Restore Show More Detail button styling (gold-outline pill) === */
        .ai-secondary-row {
          display: grid;
          place-items: center;
          margin-top: 28px;
        }

        .ai-debug-btn {
          appearance: none;
          -webkit-appearance: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 10px 18px;
          border-radius: 9999px;

          background: transparent;
          color: #ebba2f;
          border: 1px solid #ebba2f;

          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.3px;
          line-height: 1;

          cursor: pointer;
          user-select: none;
          text-decoration: none;

          box-shadow: 0 0 0 0 rgba(235,186,47,0);
          transition: transform .15s ease, box-shadow .15s ease, background .2s ease, color .2s ease;
        }

        .ai-debug-btn:hover {
          background: rgba(235,186,47,0.12);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(235,186,47,0.28);
        }

        .ai-debug-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .ai-debug-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px rgba(235,186,47,0.85);
          border-color: #ebba2f;
        }

        /* Make sure generic button/link resets don't strip our styles */
        .ai-secondary-row .ai-debug-btn {
          background: transparent !important;
          border-color: #ebba2f !important;
          color: #ebba2f !important;
          padding: 10px 18px !important;
          border-radius: 9999px !important;
        }
        /* Character counter wrapper and badge */
        .ai-prompt-wrap {
          position: relative;
          width: min(720px, 100%);
          margin: 0 auto; /* ensures it stays centered inside .ai-prompt */
        }

        .ai-char-counter {
          position: absolute;
          right: 12px;
          bottom: 10px;
          font-size: 12px;
          color: #cfcfcf;
          background: rgba(0, 0, 0, 0.35);
          padding: 2px 8px;
          border-radius: 8px;
          line-height: 1;
          pointer-events: none; /* do not block text selection/caret */
          user-select: none;
        }

        .ai-char-counter.at-limit {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.15);
          box-shadow: 0 0 0 1px rgba(255, 107, 107, 0.25) inset;
        }

        .ai-usage-badge {
          display: inline-block;
          margin: 8px auto 4px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 13px;
          background: rgba(235,186,47,0.18);
          color: #ffd56a;
          border: 1px solid rgba(235,186,47,0.35);
          box-shadow: 0 4px 14px -6px rgba(235,186,47,0.35) inset, 0 0 0 1px rgba(255,255,255,0.04);
        }
      `}</style>
    </div>
  );
}

export default AssistantPage;
