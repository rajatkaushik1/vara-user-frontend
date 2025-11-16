// src/SearchPage.jsx

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import SongCardSkeleton from './skeletons/SongCardSkeleton.jsx';
import GenreCardSkeleton from './skeletons/GenreCardSkeleton.jsx';
import premiumLotusIcon from '/premium-lotus-icon.png';
import Tooltip from './components/Tooltip';
import { PlayIcon, PauseIcon, HeartIcon, DownloadIcon } from './components/Icons.jsx';
import SharePopover from './components/SharePopover.jsx';

// --- Icons --- 
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

const ScrollRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ScrollLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// Safe id + stable key builder for pills
const getSafeId = (item, idx) => {
  if (item && (item._id || item.id)) return item._id || item.id;
  if (typeof item === 'string') return item;
  return String(idx);
};
const makePillKey = (song, prefix, item, idx) => {
  const sid = song?._id || song?.id || 's';
  const iid = getSafeId(item, idx);
  return `${sid}-${prefix}-${iid}-${idx}`;
};

// --- Reusable Carousel Component ---
const Carousel = ({ title, children, isLoading, skeletonType }) => { 
  const scrollRef = useRef(null); 
  const [canScrollLeft, setCanScrollLeft] = useState(false); 
  const [canScrollRight, setCanScrollRight] = useState(false); 
  const [hasOverflow, setHasOverflow] = useState(false);

  // Helper: is first card fully visible
  function isFirstCardFullyVisible() {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return true;
    const areaRect = el.getBoundingClientRect();
    const firstRect = el.firstElementChild.getBoundingClientRect();
    // Allow 2px leeway for subpixel rendering
    return firstRect.left >= areaRect.left - 2;
  }

  const checkScrollability = useCallback(() => { 
    const el = scrollRef.current; 
    if (el) { 
      const overflow = el.scrollWidth > el.clientWidth; 
      setHasOverflow(overflow);
      setCanScrollLeft(!isFirstCardFullyVisible());
      setCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1); 
    } 
  }, []); 

  useEffect(() => { 
    const scrollElement = scrollRef.current; 
    if (scrollElement) { 
      checkScrollability(); 
      scrollElement.addEventListener('scroll', checkScrollability); 
      const resizeObserver = new ResizeObserver(checkScrollability); 
      resizeObserver.observe(scrollElement); 
      return () => { 
        scrollElement.removeEventListener('scroll', checkScrollability); 
        resizeObserver.unobserve(scrollElement); 
      }; 
    } 
  }, [children, isLoading, checkScrollability]);

  const handleScroll = (direction) => { 
    if (scrollRef.current) { 
      const scrollAmount = scrollRef.current.offsetWidth * 0.8; 
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount 
        : scrollRef.current.scrollLeft + scrollAmount; 
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' }); 
      setTimeout(checkScrollability, 300);
    } 
  };

  useEffect(() => {
    const timer = setTimeout(checkScrollability, 50);
    return () => clearTimeout(timer);
  }, [children, isLoading, checkScrollability]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        checkScrollability();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, children, checkScrollability]);

  const Skeleton = skeletonType === 'song' ? SongCardSkeleton : GenreCardSkeleton; 
  const skeletonCount = 4; 

  // Force stable outer gutter: left 40px, right 60px, bottom 20px
  const gutterStyle = {
    padding: '0 40px 20px 40px',
    width: '100%',
    boxSizing: 'border-box'
  };

  // Inner scroll area: no left padding (so the outer gutter controls the gap)
  const scrollStyle = {
    padding: '0 0 0 0',
    ...( !hasOverflow ? { marginLeft: 0, overflowX: 'hidden', scrollSnapType: 'none' } : {} )
  };

  return ( 
    <div className="search-carousel-container"> 
      <h3 className="search-carousel-title">{title}</h3> 
      <div className="carousel-wrapper"> 
        <button
          className={`carousel-scroll-button left${!canScrollLeft ? ' hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        > 
          <ScrollLeftIcon /> 
        </button>

        <div className="carousel-gutter" style={gutterStyle}>
          <div
            className="carousel-scroll-area"
            ref={scrollRef}
            style={scrollStyle}
          > 
            {isLoading ? ( 
              Array.from({ length: skeletonCount }).map((_, index) => <Skeleton key={index} />) 
            ) : children.length > 0 ? ( 
              children 
            ) : ( 
              <p className="no-results-text">No items found in this category.</p> 
            )} 
          </div>
        </div>

        <button
          className={`carousel-scroll-button right${!canScrollRight ? ' hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        > 
          <ScrollRightIcon /> 
        </button>
      </div> 
    </div> 
  ); 
}; 

// Define purple pill styling for moods
const MOOD_PILL_STYLE = { backgroundColor: '#8e44ad', color: '#ffffff' };

const SearchPage = ({ 
  searchQuery, songs, genres, subGenres, 
  onBack, handlePlayPause, currentPlayingSong, isPlaying, formatTime, 
  favouriteSongs, handleToggleFavourite, handleDownload, loadingSongs, 
  onExplore, currentUser, currentSongId, instruments,
  moods,
}) => { 
  const [shareOpenFor, setShareOpenFor] = useState(null);      // songId currently showing popover
  const shareBtnRefs = useRef({});                              // anchor refs per song id

  // --- Instrument-aware search logic ---
  const searchResults = useMemo(() => {
    const rawQuery = String(searchQuery || '').trim();
    const q = rawQuery.toLowerCase();
    const meta = { isInstrument: false, instrumentName: null, instrumentId: null };

    const songList = Array.isArray(songs) ? songs : [];
    const genreList = Array.isArray(genres) ? genres : [];
    const subGenreList = Array.isArray(subGenres) ? subGenres : [];
    const instrumentList = Array.isArray(instruments) ? instruments : [];
    const moodList = Array.isArray(moods) ? moods : [];

    const uniqById = (arr) => {
      const map = new Map();
      for (const item of Array.isArray(arr) ? arr : []) {
        const stableId = String(item?._id || item?.id || item || '');
        if (!stableId) continue;
        if (!map.has(stableId)) map.set(stableId, item);
      }
      return Array.from(map.values());
    };

    const STOPWORDS = new Set([
      'instrument', 'instruments', 'instr', 'inst', 'music', 'musics', 'song', 'songs', 'related', 'to', 'your', 'search', 'and', 'the', 'a', 'an'
    ]);

    const normalize = (value = '') => String(value || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const normalizeWithoutStopwords = (value = '') => normalize(value)
      .split(' ')
      .filter(Boolean)
      .filter(token => !STOPWORDS.has(token))
      .join(' ')
      .trim();

    const tokenize = (value = '') => normalizeWithoutStopwords(value)
      .split(' ')
      .filter(Boolean);

    const plainNormalized = normalize(rawQuery);
    const sanitized = normalizeWithoutStopwords(rawQuery);
    const tokens = tokenize(rawQuery);
    const wordTokens = tokens.filter(token => !/^\d+$/.test(token));
    const numericTokens = tokens
      .map(token => Number(token))
      .filter(num => Number.isFinite(num));

    const wantsInstrumental = /\binstrumental\b|no vocals|without vocals|ambient only/.test(q);
    const wantsVocals = /\bvocal|\bsinger|\blyric|\bvoice/.test(q);

    // --- instrument + mood match buckets used for carousels ---
    let instrumentMatches = instrumentList.filter(inst => (inst?.name || '').toLowerCase().includes(q));
    const exactInstrument = instrumentList.find(inst => (inst?.name || '').toLowerCase() === q);
    if (exactInstrument && !instrumentMatches.some(x => String(x?._id) === String(exactInstrument?._id))) {
      instrumentMatches.unshift(exactInstrument);
    }

    let moodMatches = moodList.filter(m => (m?.name || '').toLowerCase().includes(q));
    const exactMood = moodList.find(m => (m?.name || '').toLowerCase() === q);
    if (exactMood && !moodMatches.some(x => String(x?._id) === String(exactMood?._id))) {
      moodMatches.unshift(exactMood);
    }

    const emptyPayload = { music: [], genres: [], subGenres: [], meta, moodMatches: [], instrumentMatches: [] };
    if (!q) return emptyPayload;

    const candidates = [];
    if (q) candidates.push(q);
    if (sanitized && sanitized !== q) candidates.push(sanitized);
    for (const token of tokens.sort((a, b) => b.length - a.length)) {
      if (token && !candidates.includes(token)) candidates.push(token);
    }

    const byName = (i) => (i?.name || '').toLowerCase();
    let matchedInstrument = null;

    for (const term of candidates) {
      if (!term) continue;
      matchedInstrument = instrumentList.find(i => byName(i) === term);
      if (matchedInstrument) break;
    }

    if (!matchedInstrument) {
      for (const term of candidates) {
        if (!term) continue;
        const partial = instrumentList.filter(i => byName(i).includes(term));
        if (partial.length === 1) {
          matchedInstrument = partial[0];
          break;
        }
      }
    }

    if (matchedInstrument) {
      meta.isInstrument = true;
      meta.instrumentName = matchedInstrument.name;
      meta.instrumentId = matchedInstrument._id;

      const music = songList.filter(s =>
        Array.isArray(s?.instruments) &&
        s.instruments.some(ins => {
          const insId = ins?._id || ins;
          const insName = (ins?.name || '').toLowerCase();
          return (insId && insId === matchedInstrument._id) || (!!insName && insName === matchedInstrument.name.toLowerCase());
        })
      );

      const genreCounts = new Map();
      for (const s of music) {
        for (const g of (s.genres || [])) {
          const id = g?._id || g;
          if (id) genreCounts.set(id, (genreCounts.get(id) || 0) + 1);
        }
      }
      const sortedGenreIds = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
      const genreMap = new Map(genreList.map(g => [g._id, g]));
      const relatedGenres = sortedGenreIds.map(id => genreMap.get(id)).filter(Boolean).slice(0, 8);

      const subCounts = new Map();
      for (const s of music) {
        for (const sg of (s.subGenres || [])) {
          const id = sg?._id || sg;
          if (id) subCounts.set(id, (subCounts.get(id) || 0) + 1);
        }
      }
      const sortedSubIds = [...subCounts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
      const subMap = new Map(subGenreList.map(sg => [sg._id, sg]));
      const relatedSubGenres = sortedSubIds.map(id => subMap.get(id)).filter(Boolean).slice(0, 12);

      const moodById = new Map(moodList.map(m => [String(m?._id || ''), m]));
      const moodByName = new Map(moodList.map(m => [(m?.name || '').toLowerCase(), m]));

      const coOccurCounts = new Map();
      for (const s of music) {
        const mlist = Array.isArray(s?.moods) ? s.moods : [];
        for (const mm of mlist) {
          const idRaw = mm?._id || mm?.id || mm;
          const idStr = idRaw ? String(idRaw) : '';
          const nameStr = (mm?.name || '').toLowerCase();

          if (idStr && moodById.has(idStr)) {
            coOccurCounts.set(idStr, (coOccurCounts.get(idStr) || 0) + 1);
          } else if (nameStr && moodByName.has(nameStr)) {
            const doc = moodByName.get(nameStr);
            const resolvedId = String(doc?._id || '');
            if (resolvedId) coOccurCounts.set(resolvedId, (coOccurCounts.get(resolvedId) || 0) + 1);
          }
        }
      }
      const coOccurMoodIds = Array.from(coOccurCounts.entries()).sort((a, b) => b[1] - a[1]).map(([id]) => id);
      const moodMatchesCoOccur = coOccurMoodIds.map(id => moodById.get(id)).filter(Boolean);

      const mergedMoodMap = new Map();
      for (const m of [...moodMatchesCoOccur, ...moodMatches]) {
        if (!m) continue;
        mergedMoodMap.set(String(m?._id || m?.id), m);
      }
      moodMatches = Array.from(mergedMoodMap.values());

      if (!instrumentMatches.some(x => String(x?._id) === String(matchedInstrument?._id))) {
        instrumentMatches.unshift(matchedInstrument);
      }

      const musicUnique = uniqById(music);
      const relatedGenresUnique = uniqById(relatedGenres);
      const relatedSubGenresUnique = uniqById(relatedSubGenres);
      moodMatches = uniqById(moodMatches);
      instrumentMatches = uniqById(instrumentMatches);

      return { music: musicUnique, genres: relatedGenresUnique, subGenres: relatedSubGenresUnique, meta, moodMatches, instrumentMatches };
    }

    const computeTextScore = (value, weights) => {
      const text = normalize(value);
      if (!text) return 0;
      let score = 0;
      if (weights.exact && text === plainNormalized) score += weights.exact;
      if (weights.prefix && plainNormalized.length >= 3 && text.startsWith(plainNormalized)) score += weights.prefix;
      if (weights.tokens && wordTokens.length) {
        for (const token of wordTokens) {
          if (text.includes(token)) score += weights.tokens;
        }
      }
      if (weights.full && sanitized && text.includes(sanitized)) score += weights.full;
      return score;
    };

    const scoreCollection = (collection, weights) => {
      if (!Array.isArray(collection) || !collection.length) return 0;
      return collection.reduce((acc, entry) => acc + computeTextScore(entry?.name || entry, weights), 0);
    };

    const scoredEntries = songList.map((song) => {
      let score = 0;

      score += computeTextScore(song?.title, { exact: 170, prefix: 110, tokens: 28, full: 45 });
      score += scoreCollection(song?.genres, { exact: 85, prefix: 45, tokens: 22 });
      score += scoreCollection(song?.subGenres, { exact: 70, prefix: 35, tokens: 18 });
      score += scoreCollection(song?.instruments, { exact: 90, prefix: 40, tokens: 20 });
      score += scoreCollection(song?.moods, { exact: 70, prefix: 30, tokens: 16 });
      score += computeTextScore(song?.description, { tokens: 8, full: 18 });

      if (song?.collectionType && /premium|exclusive/.test(song.collectionType.toLowerCase()) && /premium|exclusive/.test(q)) {
        score += 40;
      }

      if (song?.bpm && numericTokens.length) {
        const bpmValue = Number(song.bpm);
        if (Number.isFinite(bpmValue)) {
          const closest = Math.min(...numericTokens.map(num => Math.abs(num - bpmValue)));
          if (closest === 0) score += 90;
          else if (closest <= 3) score += 55;
          else if (closest <= 6) score += 35;
        }
      }

      if (song?.key) {
        const keyNormalized = normalize(song.key).replace('key', '').trim();
        if (keyNormalized && plainNormalized.includes(keyNormalized)) {
          score += 60;
        }
        for (const token of wordTokens) {
          if (token.length > 1 && keyNormalized.includes(token)) {
            score += 20;
          }
        }
      }

      if (wantsVocals && song?.hasVocals) score += 50;
      if (wantsInstrumental && song && song.hasVocals === false) score += 50;

      return { song, score };
    }).filter(entry => entry.score > 0);

    let rankedEntries = scoredEntries.sort((a, b) => {
      if (b.score === a.score) {
        const titleA = (a.song?.title || '').toLowerCase();
        const titleB = (b.song?.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      }
      return b.score - a.score;
    });

    if (!rankedEntries.length) {
      const fallbackMusic = songList.filter(song => {
        const title = (song?.title || '').toLowerCase();
        const genreHit = (song?.genres || []).some(g => (g?.name || '').toLowerCase().includes(q));
        const subHit = (song?.subGenres || []).some(sg => (sg?.name || '').toLowerCase().includes(q));
        return title.includes(q) || genreHit || subHit;
      }).map(song => ({ song, score: 1 }));

      rankedEntries = fallbackMusic.sort((a, b) => {
        const titleA = (a.song?.title || '').toLowerCase();
        const titleB = (b.song?.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });
    }

    const weightingStore = (limit) => {
      const store = new Map();
      return {
        add(doc, weight = 1) {
          if (!doc) return;
          const key = String(doc?._id || doc?.id || doc?.name || '');
          if (!key) return;
          const existing = store.get(key);
          if (existing) existing.weight += weight;
          else store.set(key, { doc, weight });
        },
        toArray(max = limit) {
          return Array.from(store.values())
            .sort((a, b) => b.weight - a.weight)
            .map(entry => entry.doc)
            .slice(0, max);
        }
      };
    };

    const topGenreStore = weightingStore(12);
    const topSubGenreStore = weightingStore(16);

    rankedEntries.slice(0, 60).forEach(({ song, score }, index) => {
      const weight = score + Math.max(0, 60 - index);
      (song?.genres || []).forEach(g => topGenreStore.add(g, weight));
      (song?.subGenres || []).forEach(sg => topSubGenreStore.add(sg, weight));
    });

    genreList.forEach((genre) => {
      if (normalize(genre?.name).includes(sanitized)) {
        topGenreStore.add(genre, 120);
      }
    });
    subGenreList.forEach((subGenre) => {
      if (normalize(subGenre?.name).includes(sanitized)) {
        topSubGenreStore.add(subGenre, 90);
      }
    });

    let music = rankedEntries.map(entry => entry.song);
    music = uniqById(music);

    const packSong = (song) => {
      const { _id, title, duration, bpm, key, hasVocals, genres: g = [], subGenres: sg = [], instruments: ins = [], moods: md = [] } = song;
      const collectionType = song?.collectionType || '';
      const audioUrl = song?.audioUrl || '';
      const imageUrl = song?.imageUrl || '';
      const image = song?.image || null;
      const coverUrl = song?.coverUrl || '';
      const images = Array.isArray(song?.images) ? song.images : [];

      return {
        _id, title, duration, bpm, key, hasVocals,
        collectionType,
        audioUrl,
        imageUrl,
        image,
        coverUrl,
        images,
        genres: (g || []).map((item) => ({
          _id: item?._id, name: item?.name, imageUrl: item?.imageUrl, description: item?.description
        })),
        subGenres: (sg || []).map((item) => ({
          _id: item?._id, name: item?.name, imageUrl: item?.imageUrl, description: item?.description
        })),
        instruments: (ins || []).map((item) => ({
          _id: item?._id, name: item?.name
        })),
        moods: (md || []).map((item) => ({
          _id: item?._id, name: item?.name, imageUrl: item?.imageUrl, description: item?.description
        })),
      };
    };

    const packedMusic = music.map(packSong);

    moodMatches = uniqById(moodMatches);
    instrumentMatches = uniqById(instrumentMatches);

    return {
      music: packedMusic,
      genres: uniqById(topGenreStore.toArray(12)),
      subGenres: uniqById(topSubGenreStore.toArray(16)),
      meta,
      moodMatches,
      instrumentMatches
    };
  }, [searchQuery, songs, genres, subGenres, instruments, moods]);

  // --- Carousel titles (instrument mode aware) ---
  const musicTitle = searchResults.meta?.isInstrument
    ? `Songs featuring '${searchResults.meta.instrumentName}'`
    : 'music/song related to your search';

  const genresTitle = searchResults.meta?.isInstrument
    ? `Top genres featuring '${searchResults.meta.instrumentName}'`
    : 'Genres related to your search';

  const subGenresTitle = searchResults.meta?.isInstrument
    ? `Top sub-genres featuring '${searchResults.meta.instrumentName}'`
    : 'Sub-Genre related to your search';

  // --- Global "no results" banner flag ---
  const showNoResultsBanner =
    !loadingSongs &&
    String(searchQuery || '').trim().length > 0 &&
    (!Array.isArray(searchResults.music) || searchResults.music.length === 0) &&
    (!Array.isArray(searchResults.genres) || searchResults.genres.length === 0) &&
    (!Array.isArray(searchResults.subGenres) || searchResults.subGenres.length === 0) &&
    (!Array.isArray(searchResults.moodMatches) || searchResults.moodMatches.length === 0) &&
    (!Array.isArray(searchResults.instrumentMatches) || searchResults.instrumentMatches.length === 0);

  // === Search songs carousel (trending-style) state/refs ===
  const songsScrollRef = useRef(null);
  const [songsCanScrollLeft, setSongsCanScrollLeft] = useState(false);
  const [songsCanScrollRight, setSongsCanScrollRight] = useState(false);
  const [songsHasOverflow, setSongsHasOverflow] = useState(false);

  const checkSongsScrollability = useCallback(() => {
    const el = songsScrollRef.current;
    if (el) {
      const overflow = el.scrollWidth > el.clientWidth;
      setSongsHasOverflow(overflow);
      setSongsCanScrollLeft(el.scrollLeft > 0);
      setSongsCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const el = songsScrollRef.current;
    if (!el) return;
    // Re-evaluate whenever the list changes
    checkSongsScrollability();
    el.addEventListener('scroll', checkSongsScrollability);
    const ro = new ResizeObserver(checkSongsScrollability);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkSongsScrollability);
      ro.disconnect();
    };
  }, [searchResults?.music, checkSongsScrollability]);

  const handleSongsScroll = (direction) => {
    const el = songsScrollRef.current;
    if (!el) return;
    const scrollAmount = el.offsetWidth * 0.8;
    const next = direction === 'left' ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;
    el.scrollTo({ left: next, behavior: 'smooth' });
  };

  return ( 
    <section className="search-results-section" id="search-results-section"> 
      <div className="back-button-container"> 
        <button className="back-button" onClick={onBack}> 
          <ArrowLeftIcon /> Back to Main 
        </button> 
      </div> 
      <h2 className="search-results-title">Search Results for: "{searchQuery}"</h2> 

      {(loadingSongs || (searchResults.music && searchResults.music.length > 0)) && (
        <div className="trending-carousel-container">
          <h3 className="trending-carousel-title">{musicTitle}</h3>

          <div
            className="trending-carousel-wrapper"
            style={!songsHasOverflow ? { paddingLeft: 0, paddingRight: 0 } : undefined}
          >
            {/* Left scroll button (hidden when not needed) */}
            <button
              className={`carousel-scroll-button left ${!songsCanScrollLeft ? 'hidden' : ''}`}
              style={!songsHasOverflow ? { display: 'none' } : undefined}
              onClick={() => handleSongsScroll('left')}
              aria-label="Scroll left"
            >
              <ScrollLeftIcon />
            </button>

            {/* Scroll area identical to Home/For You */}
            <div
              className="trending-carousel-scroll-area"
              ref={songsScrollRef}
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                width: '100%',
                overflowX: songsHasOverflow ? 'auto' : 'hidden',
                scrollSnapType: songsHasOverflow ? 'x mandatory' : 'none',
                margin: 0
              }}
            >
              {/* Loading skeletons (match card slots) */}
              {loadingSongs ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`ssk-${i}`}>
                    <SongCardSkeleton />
                  </div>
                ))
              ) : (
                (searchResults.music || []).map((song) => {
                  // SAFE cover resolver: only use non-empty strings; extract from object if needed
                  const coverFromImageObj = (song && song.image && typeof song.image === 'object')
                    ? (song.image.url || song.image.secure_url || song.image.path || null)
                    : null;

                  const coverSrc =
                    [
                      song?.imageUrl,
                      coverFromImageObj,
                      (typeof song?.image === 'string' ? song.image : null),
                      song?.coverUrl,
                      ...(Array.isArray(song?.images) ? song.images : [])
                    ].find(v => typeof v === 'string' && v.trim().length > 0)
                    || 'https://placehold.co/200x200/333/FFF?text=VARA';

                  return (
                    <div key={`song-${song._id}`}>
                      <div className="song-card">
                        {/* Image + overlay play */}
                        <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={coverSrc}
                            alt={song.title}
                            className="song-card-image"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/200x200/333/FFF?text=VARA'; }}
                            draggable={false}
                          />

                          {/* Share icon button (top-left) */}
                          <button
                            ref={(el) => { if (el) shareBtnRefs.current[song._id] = el; }}
                            type="button"
                            aria-label="Share song"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareOpenFor(prev => prev === song._id ? null : song._id);
                            }}
                            style={{
                              position: 'absolute',
                              left: 10,
                              top: 10,
                              width: 32,
                              height: 32,
                              borderRadius: 9999,
                              border: 'none',
                              background: '#ebba2f',
                              color: '#1a1a1a',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 6px 14px rgba(0,0,0,0.35)',
                              cursor: 'pointer',
                              zIndex: 3
                            }}
                          >
                            {/* Share (external arrow) icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M14 3h7v7" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 14L21 3" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>

                          {/* Share popover */}
                          <SharePopover
                            isOpen={shareOpenFor === song._id}
                            anchorRef={{ current: shareBtnRefs.current[song._id] }}
                            link={`https://varamusic.com/home?track=${encodeURIComponent(String(song._id))}`}
                            onClose={() => setShareOpenFor(null)}
                            onCopy={() => {
                              window.dispatchEvent(new CustomEvent('vara:notify', {
                                detail: { message: '✅ Link copied', type: 'success' }
                              }));
                            }}
                            enableNativeShare={true}
                            align="left"
                            title="Share this song"
                          />

                          {/* Play button */}
                          <button
                            className="cover-play-button"
                            onClick={() => handlePlayPause && handlePlayPause(song, searchResults.music)}
                            aria-label="Play/Pause"
                            style={{ position: 'absolute', left: 10, bottom: 10 }}
                          >
                            {currentPlayingSong?._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                          </button>
                        </div>

                        {/* Premium badge (same class as grid) */}
                        {(song.collectionType === 'premium' || song.collectionType === 'paid') && (
                          <div className="premium-indicator">
                            <Tooltip text={<span>Premium<br />song</span>}>
                              <img src={premiumLotusIcon} alt="Premium" className="premium-indicator-icon" />
                            </Tooltip>
                          </div>
                        )}

                        {/* Text + pills + actions (SongCard layout) */}
                        <div className="song-text-and-button-wrapper">
                          <div className="song-card-info">
                            <h4>{song.title}</h4>

                            <div className="genre-scroll-wrapper">
                              {Array.isArray(song.genres) && song.genres.length > 0 && (
                                <div className="genre-pill-container">
                                  {song.genres.map((g, gi) => (
                                    <span
                                      key={makePillKey(song, 'g', g, gi)}
                                      className="genre-pill"
                                      onClick={() => onExplore && onExplore('genre', getSafeId(g, gi))}
                                    >
                                      {g?.name || (typeof g === 'string' ? g : 'Genre')}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {Array.isArray(song.subGenres) && song.subGenres.length > 0 && (
                                <div className="subgenre-pill-container">
                                  {song.subGenres.map((sg, sgi) => (
                                    <span
                                      key={makePillKey(song, 'sg', sg, sgi)}
                                      className="subgenre-pill"
                                      onClick={() => onExplore && onExplore('subGenre', getSafeId(sg, sgi))}
                                    >
                                      {sg?.name || (typeof sg === 'string' ? sg : 'Sub-genre')}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {Array.isArray(song.instruments) && song.instruments.length > 0 && (
                                <div className="instrument-pill-container">
                                  {song.instruments.map((ins, ii) => (
                                    <span
                                      key={makePillKey(song, 'ins', ins, ii)}
                                      className="subgenre-pill"
                                      style={{ backgroundColor: '#21c45d', color: '#ffffff' }}
                                      onClick={() => onExplore && onExplore('instrument', getSafeId(ins, ii))}
                                    >
                                      {ins?.name || (typeof ins === 'string' ? String(ins) : 'Instrument')}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {Array.isArray(song.moods) && song.moods.length > 0 && (
                                <div className="instrument-pill-container">
                                  {song.moods.map((m, mi) => (
                                    <span
                                      key={makePillKey(song, 'm', m, mi)}
                                      className="subgenre-pill"
                                      style={{ backgroundColor: '#8e44ad', color: '#ffffff' }}
                                      onClick={() => onExplore && onExplore('mood', getSafeId(m, mi))}
                                    >
                                      {m?.name || (typeof m === 'string' ? String(m) : 'Mood')}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bottom metadata/actions (same as SongCard) */}
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
                                    <span className="song-timestamp">{formatTime ? formatTime(song.duration) : ''}</span>
                                  </Tooltip>
                                </div>
                                <div className="card-column center">
                                  <Tooltip text={favouriteSongs?.has(song._id) ? "Remove from favorites" : "Add to favorites"}>
                                    <button className="icon-button" onClick={() => handleToggleFavourite && handleToggleFavourite(song._id)} aria-label="Add to favourites">
                                      <HeartIcon filled={favouriteSongs?.has(song._id)} />
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
                  );
                })
              )}
            </div>

            {/* Right scroll button */}
            <button
              className={`carousel-scroll-button right ${!songsCanScrollRight ? 'hidden' : ''}`}
              style={!songsHasOverflow ? { display: 'none' } : undefined}
              onClick={() => handleSongsScroll('right')}
              aria-label="Scroll right"
            >
              <ScrollRightIcon />
            </button>
          </div>
        </div>
      )}

      {(loadingSongs || (searchResults.genres && searchResults.genres.length > 0)) && (
        <Carousel title={genresTitle} isLoading={loadingSongs} skeletonType="genre"> 
          {searchResults.genres && searchResults.genres.map(genre => (
            <div
              key={`genre-${genre._id}`}
              className="genre-card clickable"
              role="button"
              tabIndex={0}
              onClick={() => onExplore('genre', genre._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onExplore('genre', genre._id);
                }
              }}
            >
              <div className="genre-card-image-wrap">
                <img
                  src={genre.imageUrl || 'https://placehold.co/200x200/333/FFF?text=VARA'}
                  alt={genre.name}
                  className="genre-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=VARA'; }}
                  draggable={false}
                />
               
              </div>

              <div className="genre-card-content">
                <h5 className="genre-card-name">{genre.name}</h5>
                <div className="genre-card-description-wrapper">
                  <p className="genre-card-description">{genre.description}</p>
                </div>
              </div>
            </div>
          ))} 
        </Carousel>
      )}

      {(loadingSongs || (searchResults.subGenres && searchResults.subGenres.length > 0)) && (
        <Carousel title={subGenresTitle} isLoading={loadingSongs} skeletonType="genre"> 
          {searchResults.subGenres && searchResults.subGenres.map(subGenre => (
            <div
              key={`sub-${subGenre._id}`}
              className="genre-card clickable"
              role="button"
              tabIndex={0}
              onClick={() => onExplore('subGenre', subGenre._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onExplore('subGenre', subGenre._id);
                }
              }}
            >
              <div className="genre-card-image-wrap">
                <img
                  src={subGenre.imageUrl || 'https://placehold.co/200x200/333/FFF?text=VARA'}
                  alt={subGenre.name}
                  className="genre-card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=VARA'; }}
                  draggable={false}
                />
                {subGenre.genre && (
                  <span className="subgenre-parent-pill">
                    {(subGenre.genre.name || '').toUpperCase()}
                  </span>
                )}
                
              </div>

              <div className="genre-card-content">
                <h5 className="genre-card-name">{subGenre.name}</h5>
                <div className="genre-card-description-wrapper">
                  <p className="genre-card-description">{subGenre.description}</p>
                </div>
              </div>
            </div>
          ))} 
        </Carousel>
      )}

      {(loadingSongs || (searchResults.moodMatches && searchResults.moodMatches.length > 0)) && (
        <Carousel title="Moods related to your search" isLoading={loadingSongs} skeletonType="genre">
          {(searchResults.moodMatches || []).map((mood) => (
            <div
              key={`mood-${mood._id}`}
              className="genre-card clickable"
              role="button"
              tabIndex={0}
              onClick={() => onExplore && onExplore('mood', mood._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onExplore && onExplore('mood', mood._id);
                }
              }}
            >
              <div className="genre-card-image-wrap">
                <img
                  src={mood.imageUrl || 'https://placehold.co/200x200/333/FFF?text=Mood'}
                  alt={mood.name || 'Mood'}
                  className="genre-card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x200/333/FFF?text=Mood';
                  }}
                  draggable={false}
                />
              </div>
              <div className="genre-card-content">
                <h5 className="genre-card-name">{mood.name}</h5>
                <div className="genre-card-description-wrapper">
                  <p className="genre-card-description">{mood.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      )}

      {(loadingSongs || (searchResults.instrumentMatches && searchResults.instrumentMatches.length > 0)) && (
        <Carousel title="Instruments related to your search" isLoading={loadingSongs} skeletonType="genre">
          {(searchResults.instrumentMatches || []).map((inst) => (
            <div
              key={`inst-${inst._id}`}
              className="genre-card clickable"
              role="button"
              tabIndex={0}
              onClick={() => onExplore && onExplore('instrument', inst._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onExplore && onExplore('instrument', inst._id);
                }
              }}
            >
              <div className="genre-card-image-wrap">
                <img
                  src={inst.imageUrl || 'https://placehold.co/200x200/333/FFF?text=Instrument'}
                  alt={inst.name || 'Instrument'}
                  className="genre-card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x200/333/FFF?text=Instrument';
                  }}
                  draggable={false}
                />
              </div>
              <div className="genre-card-content">
                <h5 className="genre-card-name">{inst.name}</h5>
                <div className="genre-card-description-wrapper">
                  <p className="genre-card-description">{inst.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      )}

      {showNoResultsBanner && (
        <p className="no-results-text">
          We couldn’t find any results for “{searchQuery}”. We’ve noted your interest and will work to add it soon.
        </p>
      )}
    </section> 
  ); 
}; 

export default SearchPage;
