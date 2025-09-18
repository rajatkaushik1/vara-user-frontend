// src/components/MusicContent.jsx

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import ContentTabsSkeleton from '../skeletons/ContentTabsSkeleton.jsx';
import SongCardSkeleton from '../skeletons/SongCardSkeleton.jsx';
import GenreCardSkeleton from '../skeletons/GenreCardSkeleton.jsx';
import { ArrowLeftIcon, PlayIcon, PauseIcon, HeartIcon, DownloadIcon } from './Icons';
import premiumLotusIcon from '/premium-lotus-icon.png';
import Tooltip from './Tooltip';
import { TASTE_ENDPOINTS, SONGS_ENDPOINTS, ANALYTICS_ENDPOINTS } from '../config';
import SubGenreCarousel from './SubGenreCarousel';

const INSTRUMENT_PILL_STYLE = { backgroundColor: '#21c45d', color: '#ffffff' };
const MOOD_PILL_STYLE = { backgroundColor: '#8e44ad', color: '#ffffff' }; // NEW

// --- TrendingCarousel ---
const TrendingCarousel = ({
  trendingSongs,
  onPlayPause,
  currentPlayingSong,
  isPlaying,
  formatTime,
  onToggleFavourite,
  favouriteSongs,
  onDownload,
  onExploreGenre,
  onExploreSubgenre,
  onExploreInstrument,
  onExploreMood // NEW
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth;
      setHasOverflow(overflow);
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && trendingSongs.length > 0) {
      checkScrollability();
      scrollElement.addEventListener('scroll', checkScrollability);
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(scrollElement);
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollability);
        resizeObserver.unobserve(scrollElement);
      };
    }
  }, [trendingSongs, checkScrollability]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  if (!trendingSongs || trendingSongs.length === 0) return null;

  return (
    <div className="trending-carousel-container">
      <h3 className="trending-carousel-title">🔥 Trending this week</h3>
      <div
        className="trending-carousel-wrapper"
        style={!hasOverflow ? { paddingLeft: 0, paddingRight: 0 } : undefined}
      >
        <button
          className={`carousel-scroll-button left ${!canScrollLeft ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div
          className="trending-carousel-scroll-area"
          ref={scrollRef}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            width: '100%',
            overflowX: hasOverflow ? 'auto' : 'hidden',
            scrollSnapType: hasOverflow ? 'x mandatory' : 'none',
            margin: 0,
            padding: 0
          }}
        >
          {trendingSongs.map(song => (
            <div
              key={song._id}
              className="trending-song-card"
              style={!hasOverflow ? { marginLeft: 0, marginRight: 0 } : undefined}
            >
              {/* --- REPLACE IMAGE WITH OVERLAY PLAY BUTTON --- */}
              <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'}
                  alt={song.title}
                  className="trending-song-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }}
                />
                <button
                  className="cover-play-button"
                  onClick={() => onPlayPause(song, trendingSongs)}
                  aria-label="Play/Pause"
                  style={{ position: 'absolute', left: 10, bottom: 10 }}
                >
                  {currentPlayingSong?._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
              {(song.collectionType === 'premium' || song.collectionType === 'paid') && (
                <div className="trending-premium-indicator">
                  <Tooltip text={<span>Premium<br />song</span>}>
                    <img src={premiumLotusIcon} alt="Premium" className="trending-premium-indicator-icon" />
                  </Tooltip>
                </div>
              )}
              <div className="trending-song-card-info">
                <h4>{song.title}</h4>
                <div className="trending-genre-scroll-wrapper">
                  {song.genres?.length > 0 && (
                    <div className="trending-genre-pill-container">
                      {song.genres.map(g => (
                        <span key={g._id} className="trending-genre-pill" onClick={() => onExploreGenre(g._id)}>{g.name}</span>
                      ))}
                    </div>
                  )}
                  {song.subGenres?.length > 0 && (
                    <div className="trending-subgenre-pill-container">
                      {song.subGenres.map(sg => (
                        <span key={sg._id} className="trending-subgenre-pill" onClick={() => onExploreSubgenre(sg._id)}>{sg.name}</span>
                      ))}
                    </div>
                  )}
                  {song.instruments?.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.instruments.map(ins => (
                        <span
                          key={ins._id}
                          className="trending-genre-pill"
                          style={INSTRUMENT_PILL_STYLE}
                          onClick={() => onExploreInstrument && onExploreInstrument(ins._id)}
                        >
                          {ins.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* NEW mood pills */}
                  {song.moods?.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.moods.map(m => (
                        <span
                          key={m._id}
                          className="trending-genre-pill"
                          style={MOOD_PILL_STYLE}
                          onClick={() => onExploreMood && onExploreMood(m._id)}
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="trending-song-card-bottom-row-final">
                <div className="trending-metadata-grid">
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Beats Per Minute">
                        <span className="trending-metadata-item">{song.bpm || ''}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text="Download this song">
                        <button className="trending-icon-button" onClick={() => onDownload(song)} aria-label="Download song">
                          <DownloadIcon />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      <Tooltip text="Musical key">
                        <span className="trending-metadata-item">{song.key || ''}</span>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Song length">
                        <span className="trending-song-timestamp">{formatTime(song.duration)}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text={favouriteSongs.has(song._id) ? "Remove from favorites" : "Add to favorites"}>
                        <button className="trending-icon-button" onClick={() => onToggleFavourite(song._id)} aria-label="Add to favourites">
                          <HeartIcon filled={favouriteSongs.has(song._id)} />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      {song.hasVocals && (
                        <Tooltip text="Contains vocals">
                          <img src="/vocal-icon.png" alt="Vocals" className="trending-vocal-icon" title="This song contains vocals" />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                {/* --- REMOVE OLD BOTTOM-RIGHT PLAY BUTTON --- */}
                {/* <button className="trending-play-button" ...>...</button> */}
              </div>
            </div>
          ))}
        </div>
        <button
          className={`carousel-scroll-button right ${!canScrollRight ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
};

// --- TasteCarousel ---
const TasteCarousel = ({
  currentUser,
  onPlayPause,
  currentPlayingSong,
  isPlaying,
  formatTime,
  onToggleFavourite,
  favouriteSongs,
  onDownload,
  onExploreGenre,
  onExploreSubgenre,
  onExploreInstrument,
  onExploreMood // NEW
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasRecommendations, setHasRecommendations] = useState(false);

  // Debug flag for silencing logs
  const DEBUG = typeof window !== 'undefined' && window.__VARA_DEBUG__ === true;

  // Window-level cache for deduplication
  const w = typeof window !== 'undefined' ? window : {};
  if (!w.__VARA_TASTE_CACHE__) w.__VARA_TASTE_CACHE__ = {};
  const cacheKey = (currentUser && currentUser.email) ? currentUser.email : 'anon';

  const fetchRecommendations = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setHasRecommendations(false);
      setRecommendations([]);
      return;
    }

    // Use cached data if available
    const cache = w.__VARA_TASTE_CACHE__[cacheKey];
    if (cache && Array.isArray(cache.data)) {
      setRecommendations(cache.data);
      setHasRecommendations(cache.data.length >= 1);
      setLoading(false);
      return;
    }
    // If another mount is loading for this user, skip the duplicate call
    if (cache && cache.loading) {
      return;
    }

    // Mark as loading in cache
    w.__VARA_TASTE_CACHE__[cacheKey] = { loading: true, data: null };

    try {
      setLoading(true);

      // Step A: get taste profile from auth backend
      const tasteResponse = await fetch(TASTE_ENDPOINTS.getRecommendations(), { credentials: 'include' });
      if (!tasteResponse.ok) throw new Error('Failed to fetch taste profile');
      const tasteData = await tasteResponse.json();
      if (DEBUG) console.log('🎯 Taste profile data:', tasteData);

      if (!tasteData.hasRecommendations) {
        if (DEBUG) console.log('❌ No recommendations available:', tasteData.message);
        setHasRecommendations(false);
        setRecommendations([]);
        w.__VARA_TASTE_CACHE__[cacheKey] = { loading: false, data: [] };
        return;
      }

      // Step B: resolve songs by genres/subgenres on admin backend
      const genreIds = (tasteData.topGenres || []).map(g => g.id);
      const subGenreIds = (tasteData.topSubGenres || []).map(sg => sg.id);
      if (DEBUG) console.log('🔍 Fetching songs with:', { genreIds, subGenreIds });

      const base = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'https://vara-admin-backend.onrender.com';
      const songsResponse = await fetch(`${base}/api/songs/by-genres?genreIds=${genreIds.join(',')}&subGenreIds=${subGenreIds.join(',')}&limit=12`, { method: 'GET' });
      if (!songsResponse.ok) throw new Error('Failed to fetch recommended songs');
      const songs = await songsResponse.json();
      const list = Array.isArray(songs) ? songs : [];
      if (DEBUG) console.log('🎵 Fetched songs for taste:', list.length);

      setRecommendations(list);
      setHasRecommendations(list.length >= 1);

      // Cache final result for this user
      w.__VARA_TASTE_CACHE__[cacheKey] = { loading: false, data: list };
      if (DEBUG && list.length >= 1) console.log('✅ Taste section will be displayed with', list.length, 'songs');
      if (DEBUG && list.length === 0) console.log('❌ No songs found for taste profile');
    } catch (error) {
      if (DEBUG) console.error('Error fetching taste recommendations:', error);
      setHasRecommendations(false);
      setRecommendations([]);
      w.__VARA_TASTE_CACHE__[cacheKey] = { loading: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, [currentUser, cacheKey, DEBUG]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth;
      setHasOverflow(overflow);
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && recommendations.length > 0) {
      checkScrollability();
      scrollElement.addEventListener('scroll', checkScrollability);
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(scrollElement);
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollability);
        resizeObserver.unobserve(scrollElement);
      };
    }
  }, [recommendations, checkScrollability]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // FIXED: Show section with minimum 1 song instead of 5
  if (!currentUser || loading || !hasRecommendations || recommendations.length < 1) {
    if (DEBUG) {
      console.log('🚫 TasteCarousel not showing:', {
        hasUser: !!currentUser,
        loading,
        hasRecommendations,
        songsCount: recommendations.length
      });
    }
    return null;
  }

  if (DEBUG) console.log('✅ TasteCarousel will render with', recommendations.length, 'songs');

  return (
    <div className="trending-carousel-container">
      <h3 className="trending-carousel-title">💡 Based on Your Taste</h3>
      <div
        className="trending-carousel-wrapper"
        style={!hasOverflow ? { paddingLeft: 0, paddingRight: 0 } : undefined}
      >
        <button
          className={`carousel-scroll-button left ${!canScrollLeft ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div
          className="trending-carousel-scroll-area"
          ref={scrollRef}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            width: '100%',
            overflowX: hasOverflow ? 'auto' : 'hidden',
            scrollSnapType: hasOverflow ? 'x mandatory' : 'none',
            margin: 0,
            padding: 0
          }}
        >
          {recommendations.map(song => (
            <div
              key={song._id}
              className="trending-song-card"
              style={!hasOverflow ? { marginLeft: 0, marginRight: 0 } : undefined}
            >
              {/* --- REPLACE IMAGE WITH OVERLAY PLAY BUTTON --- */}
              <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'}
                  alt={song.title}
                  className="trending-song-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }}
                />
                <button
                  className="cover-play-button"
                  onClick={() => onPlayPause(song, recommendations)}
                  aria-label="Play/Pause"
                  style={{ position: 'absolute', left: 10, bottom: 10 }}
                >
                  {currentPlayingSong?._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
              {(song.collectionType === 'premium' || song.collectionType === 'paid') && (
                <div className="trending-premium-indicator">
                  <Tooltip text={<span>Premium<br />song</span>}>
                    <img src={premiumLotusIcon} alt="Premium" className="trending-premium-indicator-icon" />
                  </Tooltip>
                </div>
              )}
              <div className="trending-song-card-info">
                <h4>{song.title}</h4>
                {/* REPLACED ONLY THIS BLOCK WITH SAFE KEYS AND IDS */}
                <div className="trending-genre-scroll-wrapper">
                  {Array.isArray(song.genres) && song.genres.length > 0 && (
                    <div className="trending-genre-pill-container">
                      {song.genres.map((g, gi) => {
                        const gid = (g && (g._id || g.id)) ? (g._id || g.id) : (typeof g === 'string' ? g : gi);
                        const gname = g && g.name ? g.name : (typeof g === 'string' ? g : 'Genre');
                        return (
                          <span
                            key={`${song?._id || song?.id || 's'}-g-${gid}`}
                            className="trending-genre-pill"
                            onClick={() => onExploreGenre && onExploreGenre(gid)}
                          >
                            {gname}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(song.subGenres) && song.subGenres.length > 0 && (
                    <div className="trending-subgenre-pill-container">
                      {song.subGenres.map((sg, sgi) => {
                        const sid = (sg && (sg._id || sg.id)) ? (sg._id || sg.id) : (typeof sg === 'string' ? sg : sgi);
                        const sgName = sg && sg.name ? sg.name : (typeof sg === 'string' ? sg : 'Sub-genre');
                        return (
                          <span
                            key={`${song?._id || song?.id || 's'}-sg-${sid}`}
                            className="trending-subgenre-pill"
                            onClick={() => onExploreSubgenre && onExploreSubgenre(sid)}
                          >
                            {sgName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(song.instruments) && song.instruments.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.instruments.map((ins, ii) => {
                        const iid = (ins && (ins._id || ins.id)) ? (ins._id || ins.id) : (typeof ins === 'string' ? ins : ii);
                        const iName = ins && ins.name ? ins.name : (typeof ins === 'string' ? ins : 'Instrument');
                        return (
                          <span
                            key={`${song?._id || song?.id || 's'}-ins-${iid}`}
                            className="trending-genre-pill"
                            style={INSTRUMENT_PILL_STYLE}
                            onClick={() => onExploreInstrument && onExploreInstrument(iid)}
                          >
                            {iName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(song.moods) && song.moods.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.moods.map((m, mi) => {
                        const mid = (m && (m._id || m.id)) ? (m._id || m.id) : mi;
                        const mName = m && m.name ? m.name : (typeof m === 'string' ? m : 'Mood');
                        return (
                          <span
                            key={`${song?._id || song?.id || 's'}-m-${mid}`}
                            className="trending-genre-pill"
                            style={MOOD_PILL_STYLE}
                            onClick={() => onExploreMood && onExploreMood(mid)}
                          >
                            {mName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* END REPLACED BLOCK */}
              </div>

              <div className="trending-song-card-bottom-row_final">
                <div className="trending-metadata-grid">
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Beats Per Minute">
                        <span className="trending-metadata-item">{song.bpm || ''}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text="Download this song">
                        <button className="trending-icon-button" onClick={() => onDownload(song)} aria-label="Download song">
                          <DownloadIcon />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      <Tooltip text="Musical key">
                        <span className="trending-metadata-item">{song.key || ''}</span>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Song length">
                        <span className="trending-song-timestamp">{formatTime(song.duration)}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text={favouriteSongs.has(song._id) ? "Remove from favorites" : "Add to favorites"}>
                        <button className="trending-icon-button" onClick={() => onToggleFavourite(song._id)} aria-label="Add to favourites">
                          <HeartIcon filled={favouriteSongs.has(song._id)} />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      {song.hasVocals && (
                        <Tooltip text="Contains vocals">
                          <img src="/vocal-icon.png" alt="Vocals" className="trending-vocal-icon" title="This song contains vocals" />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                {/* --- REMOVE OLD BOTTOM-RIGHT PLAY BUTTON --- */}
                {/* <button className="trending-play-button" ...>...</button> */}
              </div>
            </div>
          ))}
        </div>
        <button
          className={`carousel-scroll-button right ${!canScrollRight ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
};

// --- NewCarousel ---
const NewCarousel = ({ currentUser, onPlayPause, currentPlayingSong, isPlaying, formatTime, onToggleFavourite, favouriteSongs, onDownload, onExploreGenre, onExploreSubgenre, onExploreInstrument, onExploreMood }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [newSongs, setNewSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Window-level cache to survive StrictMode re-mounts
  const w = typeof window !== 'undefined' ? window : {};
  const RAW_KEY = '__VARA_NEW_SONGS_RAW__';
  const PROMISE_KEY = '__VARA_NEW_SONGS_PROMISE__';

  // Track if this instance is mounted, to avoid setState after unmount
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const getPlayedSet = () => {
    try {
      const raw = localStorage.getItem('vara_played_song_ids');
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  };

  const reorderForUser = useCallback((rawList) => {
    if (!Array.isArray(rawList)) return [];
    if (!currentUser) return rawList;
    try {
      const played = getPlayedSet();
      const unplayed = rawList.filter(s => s && s._id && !played.has(s._id));
      // Prefer unplayed; fallback to raw order if none are unplayed
      return unplayed.length > 0 ? unplayed : rawList;
    } catch {
      return rawList;
    }
  }, [currentUser]);

  const fetchNewSongs = useCallback(async ({ force = false } = {}) => {
    // 1) If we already have raw data cached, use it and reorder locally
    if (!force && w[RAW_KEY]) {
      const processed = reorderForUser(w[RAW_KEY]);
      if (mountedRef.current) {
        setNewSongs(processed);
        setLoading(false);
      }
      return processed;
    }

    // 2) If a request is already in-flight, attach to it
    if (!force && w[PROMISE_KEY]) {
      setLoading(true);
      try {
        const raw = await w[PROMISE_KEY];
        const processed = reorderForUser(raw);
        if (mountedRef.current) {
          setNewSongs(processed);
          setLoading(false);
        }
        return processed;
      } catch (e) {
        if (mountedRef.current) {
          setLoading(false);
          console.error('Error fetching new songs:', e);
          setNewSongs([]);
        }
        return null;
      }
    }

    // 3) Start a brand new request (do NOT abort on unmount to avoid "failed" entries)
    setLoading(true);
    const p = (async () => {
      const res = await fetch(SONGS_ENDPOINTS.getNew(10, 12));
      if (!res.ok) throw new Error('Failed to fetch new songs');
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      // Cache the raw list globally; UI will reorder per user as needed
      w[RAW_KEY] = data;
      return data;
    })();

    // Cache the in-flight promise so StrictMode re-mount reuses it
    w[PROMISE_KEY] = p;

    try {
      const raw = await p;
      const processed = reorderForUser(raw);
      if (mountedRef.current) {
        setNewSongs(processed);
        setLoading(false);
      }
      return processed;
    } catch (e) {
      if (mountedRef.current) {
        setLoading(false);
        console.error('Error fetching new songs:', e);
        setNewSongs([]);
      }
      return null;
    } finally {
      // Clear the promise ref once settled; keep raw data cached
      w[PROMISE_KEY] = null;
    }
  }, [reorderForUser]);

  // Initial load
  useEffect(() => {
    fetchNewSongs();
  }, [fetchNewSongs]);

  // Reorder locally when login status changes (no network needed)
  useEffect(() => {
    const raw = w[RAW_KEY];
    if (raw && mountedRef.current) {
      const processed = reorderForUser(raw);
      setNewSongs(processed);
    }
  }, [currentUser, reorderForUser]);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth;
      setHasOverflow(overflow);
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && newSongs.length > 0) {
      checkScrollability();
      scrollElement.addEventListener('scroll', checkScrollability);
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(scrollElement);
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollability);
        resizeObserver.unobserve(scrollElement);
      };
    }
  }, [newSongs, checkScrollability]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  if (loading || !newSongs || newSongs.length === 0) return null;

  return (
    <div className="trending-carousel-container">
      <h3 className="trending-carousel-title">🆕 New in platform</h3>
      <div
        className="trending-carousel-wrapper"
        style={!hasOverflow ? { paddingLeft: 0, paddingRight: 0 } : undefined}
      >
        <button
          className={`carousel-scroll-button left ${!canScrollLeft ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        <div
          className="trending-carousel-scroll-area"
          ref={scrollRef}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            width: '100%',
            overflowX: hasOverflow ? 'auto' : 'hidden',
            scrollSnapType: hasOverflow ? 'x mandatory' : 'none',
            margin: 0,
            padding: 0
          }}
        >
          {newSongs.map(song => (
            <div
              key={song._id}
              className="trending-song-card"
              style={!hasOverflow ? { marginLeft: 0, marginRight: 0 } : undefined}
            >
              {/* --- REPLACE IMAGE WITH OVERLAY PLAY BUTTON --- */}
              <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'}
                  alt={song.title}
                  className="trending-song-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }}
                />
                <button
                  className="cover-play-button"
                  onClick={() => onPlayPause(song, newSongs)}
                  aria-label="Play/Pause"
                  style={{ position: 'absolute', left: 10, bottom: 10 }}
                >
                  {currentPlayingSong?._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
              {(song.collectionType === 'premium' || song.collectionType === 'paid') && (
                <div className="trending-premium-indicator">
                  <Tooltip text={<span>Premium<br />song</span>}>
                    <img src={premiumLotusIcon} alt="Premium" className="trending-premium-indicator-icon" />
                  </Tooltip>
                </div>
              )}
              <div className="trending-song-card-info">
                <h4>{song.title}</h4>
                <div className="trending-genre-scroll-wrapper">
                  {song.genres?.length > 0 && (
                    <div className="trending-genre-pill-container">
                      {song.genres.map(g => (
                        <span key={g._id} className="trending-genre-pill" onClick={() => onExploreGenre(g._id)}>{g.name}</span>
                      ))}
                    </div>
                  )}
                  {song.subGenres?.length > 0 && (
                    <div className="trending-subgenre-pill-container">
                      {song.subGenres.map(sg => (
                        <span key={sg._id} className="trending-subgenre-pill" onClick={() => onExploreSubgenre(sg._id)}>{sg.name}</span>
                      ))}
                    </div>
                  )}
                  {song.instruments?.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.instruments.map(ins => (
                        <span
                          key={ins._id}
                          className="trending-genre-pill"
                          style={INSTRUMENT_PILL_STYLE}
                          onClick={() => onExploreInstrument && onExploreInstrument(ins._id)}
                        >
                          {ins.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* NEW mood pills */}
                  {song.moods?.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.moods.map(m => (
                        <span
                          key={m._id}
                          className="trending-genre-pill"
                          style={MOOD_PILL_STYLE}
                          onClick={() => onExploreMood && onExploreMood(m._id)}
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="trending-song-card-bottom-row_final">
                <div className="trending-metadata-grid">
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Beats Per Minute">
                        <span className="trending-metadata-item">{song.bpm || ''}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text="Download this song">
                        <button className="trending-icon-button" onClick={() => onDownload(song)} aria-label="Download song">
                          <DownloadIcon />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      <Tooltip text="Musical key">
                        <span className="trending-metadata-item">{song.key || ''}</span>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Song length">
                        <span className="trending-song-timestamp">{formatTime(song.duration)}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text={favouriteSongs.has(song._id) ? "Remove from favorites" : "Add to favorites"}>
                        <button className="trending-icon-button" onClick={() => onToggleFavourite(song._id)} aria-label="Add to favourites">
                          <HeartIcon filled={favouriteSongs.has(song._id)} />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      {song.hasVocals && (
                        <Tooltip text="Contains vocals">
                          <img src="/vocal-icon.png" alt="Vocals" className="trending-vocal-icon" title="This song contains vocals" />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                {/* --- REMOVE OLD BOTTOM-RIGHT PLAY BUTTON --- */}
                {/* <button className="trending-play-button" ...>...</button> */}
              </div>
            </div>
          ))}
        </div>
        <button
          className={`carousel-scroll-button right ${!canScrollRight ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
};

// --- New: Listen Again Carousel
const ListenAgainCarousel = ({ currentUser, onPlayPause, currentPlayingSong, isPlaying, formatTime, onToggleFavourite, favouriteSongs, onDownload, onExploreGenre, onExploreSubgenre, onExploreInstrument, onExploreMood }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Deduplication cache (per-email) for Listen Again ----
  const w = typeof window !== 'undefined' ? window : {};
  if (!w.__VARA_LISTEN_CACHE__) w.__VARA_LISTEN_CACHE__ = {};
  const emailKey = (currentUser && currentUser.email) ? String(currentUser.email).toLowerCase() : 'anon';
  const TTL_MS = 60000; // 1 minute TTL; adjust if you want longer cache

  const fetchListenAgain = useCallback(async ({ force = false } = {}) => {
    // No user → nothing to fetch
    if (!currentUser?.email) {
      setSongs([]);
      setLoading(false);
      // clear any cache entry for anon
      if (!w.__VARA_LISTEN_CACHE__[emailKey]) {
        w.__VARA_LISTEN_CACHE__[emailKey] = { loading: false, data: [], timestamp: 0 };
      }
      return;
    }

    const now = Date.now();
    const cached = w.__VARA_LISTEN_CACHE__[emailKey];

    // 1) Serve fresh-enough cache
    if (!force && cached && Array.isArray(cached.data) && (now - (cached.timestamp || 0) < TTL_MS)) {
      setSongs(cached.data);
      setLoading(false);
      return;
    }

    // 2) Another mount is already fetching → do nothing; state will update when it finishes
    if (!force && cached && cached.loading) {
      return;
    }

    // 3) Start a new request and mark as loading in cache
    w.__VARA_LISTEN_CACHE__[emailKey] = { loading: true, data: (cached?.data || []), timestamp: cached?.timestamp || 0 };
    setLoading(true);

    try {
      const res = await fetch(ANALYTICS_ENDPOINTS.getListenAgain(currentUser.email, 20), { credentials: 'omit' });
      if (!res.ok) throw new Error('Failed to fetch listen again');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      setSongs(list);
      w.__VARA_LISTEN_CACHE__[emailKey] = { loading: false, data: list, timestamp: now };
    } catch (e) {
      console.error('Error fetching listen again:', e);
      setSongs([]);
      w.__VARA_LISTEN_CACHE__[emailKey] = { loading: false, data: [], timestamp: now };
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  useEffect(() => { fetchListenAgain(); }, [fetchListenAgain]);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth;
      setHasOverflow(overflow);
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && songs.length > 0) {
      checkScrollability();
      scrollElement.addEventListener('scroll', checkScrollability);
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(scrollElement);
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollability);
        resizeObserver.unobserve(scrollElement);
      };
    }
  }, [songs, checkScrollability]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // Login required
  if (!currentUser || loading || !songs || songs.length === 0) return null;

  return (
    <div className="trending-carousel-container">
      <h3 className="trending-carousel-title">🔁 Listen Again</h3>
      <div
        className="trending-carousel-wrapper"
        style={!hasOverflow ? { paddingLeft: 0, paddingRight: 0 } : undefined}
      >
        <button
          className={`carousel-scroll-button left ${!canScrollLeft ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        <div
          className="trending-carousel-scroll-area"
          ref={scrollRef}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            width: '100%',
            overflowX: hasOverflow ? 'auto' : 'hidden',
            scrollSnapType: hasOverflow ? 'x mandatory' : 'none',
            margin: 0,
            padding: 0
          }}
        >
          {songs.map(song => (
            <div
              key={song._id}
              className="trending-song-card"
              style={!hasOverflow ? { marginLeft: 0, marginRight: 0 } : undefined}
            >
              {/* --- REPLACE IMAGE WITH OVERLAY PLAY BUTTON --- */}
              <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'}
                  alt={song.title}
                  className="trending-song-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }}
                />
                <button
                  className="cover-play-button"
                  onClick={() => onPlayPause(song, songs)}
                  aria-label="Play/Pause"
                  style={{ position: 'absolute', left: 10, bottom: 10 }}
                >
                  {currentPlayingSong?._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
              {(song.collectionType === 'premium' || song.collectionType === 'paid') && (
                <div className="trending-premium-indicator">
                  <Tooltip text={<span>Premium<br />song</span>}>
                    <img src={premiumLotusIcon} alt="Premium" className="trending-premium-indicator-icon" />
                  </Tooltip>
                </div>
              )}
              <div className="trending-song-card-info">
                <h4>{song.title}</h4>
                <div className="trending-genre-scroll-wrapper">
                  {song.genres?.length > 0 && (
                    <div className="trending-genre-pill-container">
                      {song.genres.map(g => (
                        <span key={g._id} className="trending-genre-pill" onClick={() => onExploreGenre(g._id)}>{g.name}</span>
                      ))}
                    </div>
                  )}
                  {song.subGenres?.length > 0 && (
                    <div className="trending-subgenre-pill-container">
                      {song.subGenres.map(sg => (
                        <span key={sg._id} className="trending-subgenre-pill" onClick={() => onExploreSubgenre(sg._id)}>{sg.name}</span>
                      ))}
                    </div>
                  )}
                  {song.instruments?.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.instruments.map(ins => (
                        <span
                          key={ins._id}
                          className="trending-genre-pill"
                          style={INSTRUMENT_PILL_STYLE}
                          onClick={() => onExploreInstrument && onExploreInstrument(ins._id)}
                        >
                          {ins.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* NEW mood pills */}
                  {song.moods?.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.moods.map(m => (
                        <span
                          key={m._id}
                          className="trending-genre-pill"
                          style={MOOD_PILL_STYLE}
                          onClick={() => onExploreMood && onExploreMood(m._id)}
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="trending-song-card-bottom-row_final">
                <div className="trending-metadata-grid">
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Beats Per Minute">
                        <span className="trending-metadata-item">{song.bpm || ''}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text="Download this song">
                        <button className="trending-icon-button" onClick={() => onDownload(song)} aria-label="Download song">
                          <DownloadIcon />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      <Tooltip text="Musical key">
                        <span className="trending-metadata-item">{song.key || ''}</span>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Song length">
                        <span className="trending-song-timestamp">{formatTime(song.duration)}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text={favouriteSongs.has(song._id) ? "Remove from favorites" : "Add to favorites"}>
                        <button className="trending-icon-button" onClick={() => onToggleFavourite(song._id)} aria-label="Add to favourites">
                          <HeartIcon filled={favouriteSongs.has(song._id)} />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      {song.hasVocals && (
                        <Tooltip text="Contains vocals">
                          <img src="/vocal-icon.png" alt="Vocals" className="trending-vocal-icon" title="This song contains vocals" />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                {/* --- REMOVE OLD BOTTOM-RIGHT PLAY BUTTON --- */}
                {/* <button className="trending-play-button" ...>...</button> */}
              </div>
            </div>
          ))}
        </div>
        <button
          className={`carousel-scroll-button right ${!canScrollRight ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
};

// --- New: Weekly Recommendations Carousel
const WeeklyRecommendationsCarousel = ({
  onPlayPause, currentPlayingSong, isPlaying, formatTime,
  onToggleFavourite, favouriteSongs, onDownload,
  onExploreGenre, onExploreSubgenre, onExploreInstrument, onExploreMood,
  instruments = [], // NEW
  moods = []        // NEW
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Window-level cache for weekly recommendations
  const w = typeof window !== 'undefined' ? window : {};
  if (!w.__VARA_WEEKLY_STATE__) {
    w.__VARA_WEEKLY_STATE__ = { fetched: false, loading: false, songs: [] };
  }

  const fetchWeeklyRecommendations = useCallback(async () => {
    // Use cache if we have it
    if (w.__VARA_WEEKLY_STATE__.fetched) {
      setSongs(Array.isArray(w.__VARA_WEEKLY_STATE__.songs) ? w.__VARA_WEEKLY_STATE__.songs : []);
      setLoading(false);
      return;
    }
    // If another mount already started fetching, skip
    if (w.__VARA_WEEKLY_STATE__.loading) {
      return;
    }

    w.__VARA_WEEKLY_STATE__.loading = true;
    setLoading(true);
    try {
      const res = await fetch(ANALYTICS_ENDPOINTS.getWeeklyRecommendations(15));
      if (!res.ok) throw new Error('Failed to fetch weekly recommendations');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // Update cache
      w.__VARA_WEEKLY_STATE__.songs = list;
      w.__VARA_WEEKLY_STATE__.fetched = true;
      w.__VARA_WEEKLY_STATE__.loading = false;

      setSongs(list);
    } catch (e) {
      console.error('Error fetching weekly recommendations:', e);
      setSongs([]);
      w.__VARA_WEEKLY_STATE__.loading = false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWeeklyRecommendations(); }, [fetchWeeklyRecommendations]);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth;
      setHasOverflow(overflow);
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && songs.length > 0) {
      checkScrollability();
      scrollElement.addEventListener('scroll', checkScrollability);
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(scrollElement);
      return () => {
        scrollElement.removeEventListener('scroll', checkScrollability);
        resizeObserver.unobserve(scrollElement);
      };
    }
  }, [songs, checkScrollability]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  if (loading || !songs || songs.length === 0) return null;

  return (
    <div className="trending-carousel-container">
      <h3 className="trending-carousel-title">🎁 Weekly Recommendations</h3>
      <div
        className="trending-carousel-wrapper"
        style={!hasOverflow ? { paddingLeft: 0, paddingRight: 0 } : undefined}
      >
        <button
          className={`carousel-scroll-button left ${!canScrollLeft ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div
          className="trending-carousel-scroll-area"
          ref={scrollRef}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            width: '100%',
            overflowX: hasOverflow ? 'auto' : 'hidden',
            scrollSnapType: hasOverflow ? 'x mandatory' : 'none',
            margin: 0,
            padding: 0
          }}
        >
          {songs.map((song, sIdx) => (
            <div
              key={`${song?._id || song?.id || song?.title || 'noid'}-${sIdx}`}
              className="trending-song-card"
              style={!hasOverflow ? { marginLeft: 0, marginRight: 0 } : undefined}
            >
              <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'}
                  alt={song.title}
                  className="trending-song-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }}
                />
                <button
                  className="cover-play-button"
                  onClick={() => onPlayPause(song, songs)}
                  aria-label="Play/Pause"
                  style={{ position: 'absolute', left: 10, bottom: 10 }}
                >
                  {currentPlayingSong?._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
              {(song.collectionType === 'premium' || song.collectionType === 'paid') && (
                <div className="trending-premium-indicator">
                  <Tooltip text={<span>Premium<br />song</span>}>
                    <img src={premiumLotusIcon} alt="Premium" className="trending-premium-indicator-icon" />
                  </Tooltip>
                </div>
              )}
              <div className="trending-song-card-info">
                <h4>{song.title}</h4>
                {/* REPLACED ONLY THIS BLOCK WITH SAFE KEYS AND IDS */}
                <div className="trending-genre-scroll-wrapper">
                  {Array.isArray(song.genres) && song.genres.length > 0 && (
                    <div className="trending-genre-pill-container">
                      {song.genres.map((g, gi) => {
                        const gid = (g && (g._id || g.id)) ? (g._id || g.id) : (typeof g === 'string' ? g : gi);
                        const gname = g && g.name ? g.name : (typeof g === 'string' ? g : 'Genre');
                        return (
                          <span
                            key={`${song?._id || song?.id || 's'}-g-${gid}`}
                            className="trending-genre-pill"
                            onClick={() => onExploreGenre && onExploreGenre(gid)}
                          >
                            {gname}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(song.subGenres) && song.subGenres.length > 0 && (
                    <div className="trending-subgenre-pill-container">
                      {song.subGenres.map((sg, sgi) => {
                        const sid = (sg && (sg._id || sg.id)) ? (sg._id || sg.id) : (typeof sg === 'string' ? sg : sgi);
                        const sgName = sg && sg.name ? sg.name : (typeof sg === 'string' ? sg : 'Sub-genre');
                        return (
                          <span
                            key={`${song?._id || song?.id || 's'}-sg-${sid}`}
                            className="trending-subgenre-pill"
                            onClick={() => onExploreSubgenre && onExploreSubgenre(sid)}
                          >
                            {sgName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(song.instruments) && song.instruments.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.instruments.map((ins, ii) => {
                        const iid = (ins && (ins._id || ins.id)) ? (ins._id || ins.id) : (typeof ins === 'string' ? ins : ii);
                        const iName = ins && ins.name ? ins.name : (typeof ins === 'string' ? ins : 'Instrument');
                        return (
                          <span
                            key={`${song?._id || song?.id || 's'}-ins-${iid}`}
                            className="trending-genre-pill"
                            style={INSTRUMENT_PILL_STYLE}
                            onClick={() => onExploreInstrument && onExploreInstrument(iid)}
                          >
                            {iName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(song.moods) && song.moods.length > 0 && (
                    <div className="trending-instrument-pill-container">
                      {song.moods.map((m, mi) => {
                        const mid = (m && (m._id || m.id)) ? (m._id || m.id) : mi;
                        const mName = m && m.name ? m.name : (typeof m === 'string' ? m : 'Mood');
                        return (
                          <span
                            key={`${song?._id || song?.id || 's'}-m-${mid}`}
                            className="trending-genre-pill"
                            style={MOOD_PILL_STYLE}
                            onClick={() => onExploreMood && onExploreMood(mid)}
                          >
                            {mName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* END REPLACED BLOCK */}
              </div>

              <div className="trending-song-card-bottom-row_final">
                <div className="trending-metadata-grid">
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Beats Per Minute">
                        <span className="trending-metadata-item">{song.bpm || ''}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text="Download this song">
                        <button className="trending-icon-button" onClick={() => onDownload(song)} aria-label="Download song">
                          <DownloadIcon />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      <Tooltip text="Musical key">
                        <span className="trending-metadata-item">{song.key || ''}</span>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="trending-card-row">
                    <div className="trending-card-column left">
                      <Tooltip text="Song length">
                        <span className="trending-song-timestamp">{formatTime(song.duration)}</span>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column center">
                      <Tooltip text={favouriteSongs.has(song._id) ? "Remove from favorites" : "Add to favorites"}>
                        <button className="trending-icon-button" onClick={() => onToggleFavourite(song._id)} aria-label="Add to favourites">
                          <HeartIcon filled={favouriteSongs.has(song._id)} />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="trending-card-column right">
                      {song.hasVocals && (
                        <Tooltip text="Contains vocals">
                          <img src="/vocal-icon.png" alt="Vocals" className="trending-vocal-icon" title="This song contains vocals" />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                {/* --- REMOVE OLD BOTTOM-RIGHT PLAY BUTTON --- */}
                {/* <button className="trending-play-button" ...>...</button> */}
              </div>
            </div>
          ))}
        </div>
        <button
          className={`carousel-scroll-button right ${!canScrollRight ? 'hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  );
};

const SongCard = ({ song, onPlayPause, songList, currentPlayingSong, isPlaying, formatTime, onToggleFavourite, favouriteSongs, onDownload, onExploreGenre, onExploreSubgenre, onExploreInstrument, onExploreMood }) => (
  <div className="song-card">
    {/* Positioning wrapper ONLY; DOES NOT set width/height. Image sizing stays controlled by CSS class .song-card-image */}
    <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <img
        src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'}
        alt={song.title}
        className="song-card-image"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }}
      />
      {/* New: 48px circular overlay button at bottom-left of the image */}
      <button
        className="cover-play-button"
        onClick={() => onPlayPause(song, songList)}
        aria-label="Play/Pause"
        style={{
          position: 'absolute',
          left: 10,
          bottom: 10
        }}
      >
        {currentPlayingSong?._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
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
        <div className="genre-scroll-wrapper">
          {song.genres?.length > 0 && (
            <div className="genre-pill-container">
              {song.genres.map(g => (
                <span key={g._id} className="genre-pill" onClick={() => onExploreGenre(g._id)}>{g.name}</span>
              ))}
            </div>
          )}
          {song.subGenres?.length > 0 && (
            <div className="subgenre-pill-container">
              {song.subGenres.map(sg => (
                <span key={sg._id} className="subgenre-pill" onClick={() => onExploreSubgenre(sg._id)}>{sg.name}</span>
              ))}
            </div>
          )}
          {song.instruments?.length > 0 && (
            <div className="instrument-pill-container">
              {song.instruments.map(ins => (
                <span
                  key={ins._id}
                  className="subgenre-pill"
                  style={INSTRUMENT_PILL_STYLE}
                  onClick={() => onExploreInstrument && onExploreInstrument(ins._id)}
                >
                  {ins.name}
                </span>
              ))}
            </div>
          )}
          {/* NEW mood pills */}
          {song.moods?.length > 0 && (
            <div className="instrument-pill-container">
              {song.moods.map(m => (
                <span
                  key={m._id}
                  className="subgenre-pill"
                  style={MOOD_PILL_STYLE}
                  onClick={() => onExploreMood && onExploreMood(m._id)}
                >
                  {m.name}
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
                <button className="icon-button" onClick={() => onDownload(song)} aria-label="Download song">
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
                <span className="song-timestamp">{formatTime(song.duration)}</span>
              </Tooltip>
            </div>
            <div className="card-column center">
              <Tooltip text={favouriteSongs.has(song._id) ? "Remove from favorites" : "Add to favorites"}>
                <button className="icon-button" onClick={() => onToggleFavourite(song._id)} aria-label="Add to favourites">
                  <HeartIcon filled={favouriteSongs.has(song._id)} />
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
);

const GenreCard = ({ genre, onExplore, type }) => {
  const isSubGenre = type === 'Sub-Genre';

  const handleNavigate = () => {
    if (onExplore && genre && genre._id) onExplore(genre._id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      className="genre-card clickable"
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      aria-label={`${type}: ${genre?.name || ''}`}
    >
      {/* Image wrapper to support red parent-genre pill overlap */}
      <div className="genre-card-image-wrap">
        <img
          src={genre.imageUrl || `https://placehold.co/200x200/333/FFF?text=${type}+Image`}
          alt={genre.name}
          className="genre-card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/200x200/333/FFF?text=${type}+Image`;
          }}
          draggable={false}
        />

        {/* Red parent-genre pill for Sub-Genre cards (overlaps image bottom) */}
        {isSubGenre && genre?.genre?.name && (
          <span
            className="subgenre-parent-pill"
            aria-label={`Parent genre: ${genre.genre.name}`}
          >
            {(genre.genre.name || '').toUpperCase()}
          </span>
        )}
      </div>

      <div className="genre-card-content">
        <h5 className="genre-card-name">{genre.name}</h5>

        {/* Description area: stop navigation so users can scroll/read */}
        <div
          className="genre-card-description-wrapper"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="region"
          aria-label={`${type} description`}
        >
          <p className="genre-card-description">{genre.description}</p>
        </div>
      </div>
    </div>
  );
};

const MusicContent = ({
    loadingMusicContent,
    loadingSongs,
    loadingGenres,
    loadingSubGenres,
    trendingSongs,
    loadingTrending,
    error,
    currentView,
    showBackButton,
    onBackButtonClick,
    onTabClick,
    onExploreGenre,
    onExploreSubgenre,
    onExploreInstrument,
    onExploreMood, // NEW
    songs,
    genres,
    subGenres,
    instruments,
    moods,           // NEW
    loadingInstruments,
    loadingMoods,    // NEW
    favouriteSongs,
    currentPlayingSong,
    isPlaying,
    onPlayPause,
    onToggleFavourite,
    onDownload,
    formatTime,
    currentUser,
    autoScrollTabs = false,
    clearAutoScrollTabs = () => {}
}) => {
    // 1. Add a ref for the tab section
    const tabSectionRef = useRef(null);

    const contentToDisplay = useMemo(() => {
        switch (currentView.view) {
            case 'for-you':
                return {
                    type: 'songs-with-trending',
                    trending: trendingSongs || [],
                    regular: songs
                };
            case 'free-songs': return { type: 'songs', data: songs.filter(s => s.collectionType === 'free') };
            case 'favourites': return { type: 'songs', data: songs.filter(s => favouriteSongs.has(s._id)) };
            case 'all-genres': return { type: 'genres', data: genres };
            case 'all-sub-genres': return { type: 'sub-genres', data: subGenres };
            case 'sub-genres-by-genre': return { type: 'sub-genres', data: subGenres.filter(sg => sg.genre?._id === currentView.genreId) };
            case 'songs-by-sub-genre': return { type: 'songs', data: songs.filter(s => s.subGenres?.some(sg => sg._id === currentView.subGenreId)) };
            case 'all-instruments': return { type: 'instruments', data: instruments };
            case 'songs-by-instrument': return { type: 'songs', data: songs.filter(s => s.instruments?.some(i => i._id === currentView.instrumentId)) };
            case 'all-moods':
              return { type: 'moods', data: moods }; // NEW
            case 'songs-by-mood':
              return { type: 'songs', data: songs.filter(s => s.moods?.some(m => m._id === currentView.moodId)) }; // NEW
            default: return { type: 'none', data: [] };
        }
    }, [currentView, songs, genres, subGenres, instruments, favouriteSongs, trendingSongs /* moods omitted intentionally to minimize changes */]);

    // 2. Wrap the explore handlers to scroll to the tab section after navigation
    // Wrapper handlers that only signal the parent to change view
    const handleExploreGenre = useCallback((genreId) => {
      // pass `fromExplore=true` to parent handler
      if (onExploreGenre) onExploreGenre(genreId, true);
    }, [onExploreGenre]);

    const handleExploreSubgenre = useCallback((subGenreId) => {
      if (onExploreSubgenre) onExploreSubgenre(subGenreId, true); // true means fromExplore
    }, [onExploreSubgenre]);

    const handleExploreInstrument = useCallback((instrumentId) => {
      if (onExploreInstrument) onExploreInstrument(instrumentId, true);
    }, [onExploreInstrument]);

    // NEW: mood explore wrapper
    const handleExploreMood = useCallback((moodId) => {
      if (onExploreMood) onExploreMood(moodId, true); // true marks "fromExplore"
    }, [onExploreMood]);

    // ───────── Scroll to tabs AFTER the view changed and MusicContent finished loading ─────────
    useEffect(() => {
      if (loadingMusicContent) return; // don't scroll while content is loading

      const view = currentView && currentView.view ? currentView.view : '';
      const shouldScrollToTab = view && (
        view.includes('genre') ||
        view.includes('sub-genre') ||
        view.includes('songs-by-sub-genre') ||
        view.includes('sub-genres-by-genre') ||
        view === 'free-songs' ||
        view.includes('favourite') ||
        view.includes('instrument') ||
        view.includes('songs-by-instrument') ||
        view === 'all-instruments' ||
        // NEW mood conditions
        view.includes('mood') ||
        view.includes('songs-by-mood') ||
        view === 'all-moods' ||
        (view === 'for-you' && autoScrollTabs)
      );

      if (!shouldScrollToTab) return;

      // small delay so the tab header finishes rendering
      const timer = setTimeout(() => {
        const el = tabSectionRef.current || document.getElementById('content-tabs-section') || document.getElementById('main-tab-section');
        if (el) {
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }

        // clear the flag in parent so we don't auto-scroll again
        if (autoScrollTabs && typeof clearAutoScrollTabs === 'function') {
          clearAutoScrollTabs();
        }
      }, 120);

      return () => clearTimeout(timer);
    }, [currentView && currentView.view, loadingMusicContent, autoScrollTabs, clearAutoScrollTabs]);
    // ────────────────────────────────────────────────────────────────────────────────────────

    const renderContent = () => {
        let isLoading = false;
        if (contentToDisplay.type === 'songs' || contentToDisplay.type === 'songs-with-trending') {
            isLoading = loadingSongs;
        } else if (contentToDisplay.type === 'genres') {
            isLoading = loadingGenres;
        } else if (contentToDisplay.type === 'sub-genres') {
            isLoading = loadingSubGenres;
        } else if (contentToDisplay.type === 'instruments') {
            isLoading = loadingInstruments;
        } else if (contentToDisplay.type === 'moods') {
            isLoading = loadingMoods; // NEW
        }

        if (isLoading) {
            const isGenreView =
              contentToDisplay.type === 'genres' ||
              contentToDisplay.type === 'sub-genres' ||
              contentToDisplay.type === 'instruments' ||
              contentToDisplay.type === 'moods'; // NEW
            return isGenreView
                ? Array.from({ length: 8 }).map((_, index) => <GenreCardSkeleton key={index} />)
                : Array.from({ length: 9 }).map((_, index) => <SongCardSkeleton key={index} />);
        }

        if (error) return <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ff6b6b', fontSize: '1.2em' }}>{error}</p>;

        // NEW: Handle "FOR YOU" with trending and taste sections
        if (contentToDisplay.type === 'songs-with-trending') {
            return (
                <>
                  {/* Trending Section */}
                            {!loadingTrending && trendingSongs && trendingSongs.length > 0 && (
                              <div className="full-width-section">
                                <TrendingCarousel
                                  trendingSongs={trendingSongs}
                                  onPlayPause={onPlayPause}
                                  currentPlayingSong={currentPlayingSong}
                                  isPlaying={isPlaying}
                                  formatTime={formatTime}
                                  onToggleFavourite={onToggleFavourite}
                                  favouriteSongs={favouriteSongs}
                                  onDownload={onDownload}
                                  onExploreGenre={onExploreGenre}
                                  onExploreSubgenre={onExploreSubgenre}
                                  onExploreInstrument={onExploreInstrument}
                                  onExploreMood={onExploreMood} // NEW
                                />
                              </div>
                            )}

                            {/* ✅ NEW: Taste-Based Recommendations Section: ONLY render if TasteCarousel returns non-null */}
                            {/* TasteCarousel itself already returns null if no recommendations, so just call it directly */}
                            <div className="full-width-section">
                              <TasteCarousel
                                currentUser={currentUser}
                                onPlayPause={onPlayPause}
                                currentPlayingSong={currentPlayingSong}
                                isPlaying={isPlaying}
                                formatTime={formatTime}
                                onToggleFavourite={onToggleFavourite}
                                favouriteSongs={favouriteSongs}
                                onDownload={onDownload}
                                onExploreGenre={onExploreGenre}
                                onExploreSubgenre={onExploreSubgenre}
                                onExploreInstrument={onExploreInstrument}
                                onExploreMood={onExploreMood} // NEW
                              />
                            </div>

                            {/* ✅ NEW: "New in platform" Section (after Taste) */}
                            <div className="full-width-section">
                              <NewCarousel
                                currentUser={currentUser}
                                onPlayPause={onPlayPause}
                                currentPlayingSong={currentPlayingSong}
                                isPlaying={isPlaying}
                                formatTime={formatTime}
                                onToggleFavourite={onToggleFavourite}
                                favouriteSongs={favouriteSongs}
                                onDownload={onDownload}
                                onExploreGenre={onExploreGenre}
                                onExploreSubgenre={onExploreSubgenre}
                                onExploreInstrument={onExploreInstrument}
                                onExploreMood={onExploreMood} // NEW
                              />
                            </div>

                            {/* NEW: Listen Again (after New) */}
                            <div className="full-width-section">
                              <ListenAgainCarousel
                                currentUser={currentUser}
                                onPlayPause={onPlayPause}
                                currentPlayingSong={currentPlayingSong}
                                isPlaying={isPlaying}
                                formatTime={formatTime}
                                onToggleFavourite={onToggleFavourite}
                                favouriteSongs={favouriteSongs}
                                onDownload={onDownload}
                                onExploreGenre={onExploreGenre}
                                onExploreSubgenre={onExploreSubgenre}
                                onExploreInstrument={onExploreInstrument}
                                onExploreMood={onExploreMood} // NEW
                              />
                            </div>

                            {/* NEW: Weekly Recommendations (after Listen Again) */}
                            <div className="full-width-section">
                              <WeeklyRecommendationsCarousel
                                onPlayPause={onPlayPause}
                                currentPlayingSong={currentPlayingSong}
                                isPlaying={isPlaying}
                                formatTime={formatTime}
                                onToggleFavourite={onToggleFavourite}
                                favouriteSongs={favouriteSongs}
                                onDownload={onDownload}
                                onExploreGenre={onExploreGenre}
                                onExploreSubgenre={onExploreSubgenre}
                                onExploreInstrument={onExploreInstrument}
                                onExploreMood={onExploreMood}
                                instruments={instruments}  // NEW
                                moods={moods}              // NEW
                              />
                            </div>

                  {/* Raw Library Section */}
                  <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                    <h3 className="raw-library-title">Raw Library</h3>
                  </div>
                  
                  {/* All Songs */}
                  {contentToDisplay.regular.length > 0 ? (
                    contentToDisplay.regular.map(song => (
                      <SongCard
                        key={song._id}
                        song={song}
                        songList={contentToDisplay.regular}
                        {...{ onPlayPause, currentPlayingSong, isPlaying, formatTime, onToggleFavourite, favouriteSongs, onDownload, onExploreGenre, onExploreSubgenre, onExploreInstrument }}
                      />
                    ))
                  ) : (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>No songs found.</p>
                  )}
                </>
            );
        }

        // Existing logic for other content types
        if (contentToDisplay.data && contentToDisplay.data.length === 0) {
            return <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>No content found.</p>;
        }

        if (contentToDisplay.type === 'songs') {
            return contentToDisplay.data.map(song => (
                <SongCard
                    key={song._id}
                    song={song}
                    songList={contentToDisplay.data}
                    {...{ onPlayPause, currentPlayingSong, isPlaying, formatTime, onToggleFavourite, favouriteSongs, onDownload, onExploreGenre, onExploreSubgenre, onExploreInstrument }}
                />
            ));
        }
        if (contentToDisplay.type === 'genres') {
            return contentToDisplay.data.map(genre => (
                <GenreCard key={genre._id} genre={genre} onExplore={onExploreGenre} type="Genre" />
            ));
        }
        if (contentToDisplay.type === 'sub-genres') {
          // Group sub-genres by parent genre, then render one carousel per genre (A→Z)
          const groupsMap = new Map();
          for (const sg of Array.isArray(contentToDisplay.data) ? contentToDisplay.data : []) {
            const gId = sg?.genre?._id || 'unknown';
            const gName = sg?.genre?.name || 'Untitled';
            if (!groupsMap.has(gId)) {
              groupsMap.set(gId, { genreId: gId, genreName: gName, items: [] });
            }
            groupsMap.get(gId).items.push(sg);
          }

          // Build sorted groups (genres A→Z, sub-genres A→Z within each)
          const groups = Array.from(groupsMap.values())
            .sort((a, b) => String(a.genreName).localeCompare(String(b.genreName)))
            .map(group => ({
              ...group,
              items: group.items.slice().sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')))
            }));

          // NEW: determine if we are already within a specific genre's sub-genres view
          const isByGenreView = currentView?.view === 'sub-genres-by-genre';

          // Render a full-width carousel section for each genre
          return (
            <>
              {groups.map(group => (
                <div key={`sgcar-${group.genreId}`} className="full-width-section">
                  <SubGenreCarousel
                    title={`Sub genres from ${group.genreName}`}
                    items={group.items}
                    onExploreSubgenre={(id) => handleExploreSubgenre(id)}
                    hideHeader={isByGenreView}
                    isLoading={false}
                  />
                </div>
              ))}
            </>
          );
        }
        if (contentToDisplay.type === 'instruments') {
            if (!contentToDisplay.data || contentToDisplay.data.length === 0) {
                return <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>No instruments found.</p>;
            }
            return contentToDisplay.data.map(inst => (
                <GenreCard key={inst._id} genre={inst} onExplore={handleExploreInstrument} type="Instrument" />
            ));
        }

        // NEW: All moods grid
        if (contentToDisplay.type === 'moods') {
          return contentToDisplay.data.map(mood => (
            <GenreCard key={mood._id} genre={mood} onExplore={handleExploreMood} type="Mood" />
          ));
        }

        return null;
    };
    
    const getActiveTab = () => {
        if (currentView.view.includes('sub-genre')) return 'sub-genres';
        if (currentView.view.includes('genre')) return 'genres';
        if (currentView.view.includes('instrument')) return 'instruments';
        if (currentView.view.includes('mood')) return 'moods'; // NEW
        if (currentView.view.includes('free')) return 'freesongs';
        if (currentView.view.includes('favourite')) return 'favourites';
        return 'home';
    };
    const activeTab = getActiveTab();

    const isGenreGrid =
      contentToDisplay.type === 'genres' ||
      contentToDisplay.type === 'sub-genres' ||
      contentToDisplay.type === 'instruments' ||
      contentToDisplay.type === 'moods'; // NEW

    const shouldShowTitle =
      currentView.view === 'sub-genres-by-genre' ||
      currentView.view === 'songs-by-sub-genre' ||
      currentView.view === 'songs-by-instrument' ||
      currentView.view === 'songs-by-mood'; // NEW

    return (
        <section className="music-content" id="music-content-section">
            {loadingMusicContent ? <ContentTabsSkeleton /> : (
                <div id="content-tabs-section" className="content-tabs" ref={tabSectionRef}>
                    <button className={`tab-button ${activeTab === 'home' ? 'active' : ''}`} onClick={() => onTabClick('for-you')}>FOR YOU</button>
                    <button className={`tab-button ${activeTab === 'genres' ? 'active' : ''}`} onClick={() => onTabClick('genres')}>GENRES</button>
                    <button className={`tab-button ${activeTab === 'sub-genres' ? 'active' : ''}`} onClick={() => onTabClick('sub-genres')}>SUB GENRES</button>
                    <button className={`tab-button ${activeTab === 'instruments' ? 'active' : ''}`} onClick={() => onTabClick('instruments')}>INSTRUMENTS</button>
                    <button className={`tab-button ${activeTab === 'moods' ? 'active' : ''}`} onClick={() => onTabClick('moods')}>MOODS</button> {/* NEW */}
                    <button className={`tab-button ${activeTab === 'freesongs' ? 'active' : ''}`} onClick={() => onTabClick('free-songs')}>FREE SONGS</button>
                    <button className={`tab-button ${activeTab === 'favourites' ? 'active' : ''}`} onClick={() => onTabClick('favourites')}>FAVOURITES</button>
                </div>
            )}
            {!loadingMusicContent && (
                <>
                    <div className="content-header">
                        <div className="back-button-container">
                            {showBackButton && (
                                <button className="back-button" onClick={onBackButtonClick}>
                                    <ArrowLeftIcon /> Back
                                </button>
                            )}
                        </div>
                        {shouldShowTitle && (<h2 className="content-display-title">{currentView.title}</h2>)}
                        <div className="back-button-container spacer"></div>
                    </div>
                    <div className={`content-grid ${isGenreGrid ? 'genres-grid' : ''}`}>
                        {renderContent({
                            onExploreGenre: handleExploreGenre,
                            onExploreSubgenre: handleExploreSubgenre,
                            onExploreInstrument: handleExploreInstrument,
                            onExploreMood: handleExploreMood, // NEW
                        })}
                    </div>
                </>
            )}
        </section>
    );
};

export default MusicContent;