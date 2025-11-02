import React, { useState, useCallback } from 'react';
import { AUTH_BASE_URL } from '../config';

function AiSuggestPanel({
  queryText,               // string (required): the current search query
  currentUser,             // optional, for future personalization (not required)
  handlePlayPause,
  currentPlayingSong,
  isPlaying,
  favouriteSongs,
  handleToggleFavourite,
  handleDownload
}) {
  const [vocals, setVocals] = useState('off'); // 'off' | 'on'
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState(null);
  const [results, setResults] = useState([]);
  const [err, setErr] = useState('');

  const run = useCallback(async () => {
    if (!queryText || !queryText.trim()) return;
    setErr('');
    setLoading(true);
    setResults([]);
    setIntent(null);

    try {
      const res = await fetch(`${AUTH_BASE_URL.replace(/\/+$/, '')}/api/ai/recommend`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ queryText, vocals, topK: 8 })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data || data.ok === false) {
        throw new Error(data?.message || 'Recommendation request failed');
      }
      setIntent(data.intent || null);
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      setErr(e?.message || 'Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  }, [queryText, vocals]);

  const renderItem = (r) => {
    const isFav = favouriteSongs instanceof Set ? favouriteSongs.has(r.songId) : false;
    const isCurrent = currentPlayingSong && (currentPlayingSong._id === r.songId);
    const isPremium = r.collectionType === 'paid' || r.collectionType === 'premium';

    const songObj = {
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
      instruments: r.instruments
    };

    return (
      <div key={r.songId} style={s.card}>
        <div style={s.thumbWrap}>
          <img src={r.imageUrl} alt={r.title} style={s.thumb} />
          {isPremium && <div style={s.premium}>Premium</div>}
        </div>
        <div style={s.body}>
          <div style={s.titleRow}>
            <div style={s.title}>{r.title}</div>
            <div style={s.metaRow}>
              <span style={s.meta}>{r.bpm ? `${r.bpm} BPM` : '—'}</span>
              <span style={s.meta}>{r.key || 'Key —'}</span>
              <span style={s.meta}>{r.hasVocals ? 'Vocals' : 'Instrumental'}</span>
            </div>
          </div>
          {r.why && <div style={s.why}>{r.why}</div>}
          <div style={s.actions}>
            <button style={s.btn} onClick={() => handlePlayPause && handlePlayPause(songObj, [])}>
              {isCurrent && isPlaying ? 'Pause' : 'Play'}
            </button>
            <button style={{ ...s.btn, ...(isFav ? s.favOn : {}) }} onClick={() => handleToggleFavourite && handleToggleFavourite(r.songId)}>
              {isFav ? '★ Faved' : '☆ Fav'}
            </button>
            <button style={s.btn} onClick={() => handleDownload && handleDownload(songObj)}>
              Download
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.hLeft}>
          <h3 style={s.h3}>AI Suggestions</h3>
          <span style={s.desc}>Use the search text to get a tight list of matches</span>
        </div>
        <div style={s.hRight}>
          <label style={s.radioLabel}>
            <input type="radio" name="vocals" value="off" checked={vocals === 'off'} onChange={() => setVocals('off')} />
            Instrumental
          </label>
          <label style={s.radioLabel}>
            <input type="radio" name="vocals" value="on" checked={vocals === 'on'} onChange={() => setVocals('on')} />
            With vocals
          </label>
          <button style={s.cta} onClick={run} disabled={!queryText || loading}>
            {loading ? 'Finding…' : 'Get AI picks'}
          </button>
        </div>
      </div>

      {err && <div style={s.err}>❌ {err}</div>}

      {results.length > 0 && (
        <div style={s.grid}>
          {results.map(renderItem)}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { margin: '12px 0 16px', padding: '12px', border: '1px solid #2a2a2a', borderRadius: 10, background: '#131313' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 },
  hLeft: { display: 'flex', alignItems: 'baseline', gap: 8 },
  h3: { margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' },
  desc: { opacity: 0.8, fontSize: 13 },
  hRight: { display: 'flex', alignItems: 'center', gap: 10 },
  radioLabel: { cursor: 'pointer' },
  cta: { background: '#ebba2f', color: '#000', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  err: { marginTop: 8, color: '#ff6b6b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 8 },
  card: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  thumbWrap: { position: 'relative' },
  thumb: { width: '100%', height: 140, objectFit: 'cover', display: 'block' },
  premium: { position: 'absolute', top: 8, left: 8, background: '#ebba2f', color: '#000', fontWeight: 700, fontSize: 12, padding: '3px 7px', borderRadius: 6 },
  body: { padding: 10, display: 'flex', flexDirection: 'column', gap: 8 },
  titleRow: { display: 'flex', justifyContent: 'space-between', gap: 8 },
  title: { fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: '#fff' },
  metaRow: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  meta: { fontSize: 12, opacity: 0.85, background: '#1e1e1e', padding: '3px 6px', borderRadius: 6 },
  why: { fontSize: 12, opacity: 0.9 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  btn: { background: '#222', color: '#eee', border: '1px solid #333', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' },
  favOn: { background: '#ebba2f', color: '#000', border: '1px solid #c59b1a' }
};

export default AiSuggestPanel;
