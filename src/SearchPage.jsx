// src/SearchPage.jsx

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import SongCardSkeleton from './skeletons/SongCardSkeleton.jsx';
import GenreCardSkeleton from './skeletons/GenreCardSkeleton.jsx';
import premiumLotusIcon from '/premium-lotus-icon.png';
import Tooltip from './components/Tooltip';
import { PlayIcon, PauseIcon, HeartIcon, DownloadIcon } from './components/Icons.jsx';

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
  // --- Instrument-aware search logic ---
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    const meta = { isInstrument: false, instrumentName: null, instrumentId: null };

    // Helper: dedupe an array of docs by stable id
    const uniqById = (arr) => {
      const map = new Map();
      for (const item of Array.isArray(arr) ? arr : []) {
        const stableId = String(item?._id || item?.id || item || '');
        if (!stableId) continue;
        if (!map.has(stableId)) map.set(stableId, item);
      }
      return Array.from(map.values());
    };

    // --- NEW: instrumentMatches (case-insensitive, exact first) ---
    const instrumentArray = Array.isArray(instruments) ? instruments : [];
    let instrumentMatches = instrumentArray.filter(inst => (inst?.name || '').toLowerCase().includes(q));
    const exactInstrument = instrumentArray.find(inst => (inst?.name || '').toLowerCase() === q);
    if (exactInstrument && !instrumentMatches.some(x => String(x?._id) === String(exactInstrument?._id))) {
      instrumentMatches.unshift(exactInstrument);
    }

    // --- NEW: moodMatches (case-insensitive, exact first) ---
    let moodMatches = Array.isArray(moods)
      ? moods.filter(m => (m?.name || '').toLowerCase().includes(q))
      : [];
    const exactMood = Array.isArray(moods)
      ? moods.find(m => (m?.name || '').toLowerCase() === q)
      : null;
    if (exactMood && !moodMatches.some(x => String(x?._id) === String(exactMood?._id))) {
      moodMatches.unshift(exactMood);
    }

    // Always include arrays in empty-query return
    if (!q) return { music: [], genres: [], subGenres: [], meta, moodMatches: [], instrumentMatches: [] };

    const list = Array.isArray(instruments) ? instruments : [];

    // Lookup for mood names by ID to support songs that store mood IDs
    const moodArray = Array.isArray(moods) ? moods : [];
    const moodNameById = (id) => {
      const m = moodArray.find(x => String(x?._id) === String(id));
      return m?.name || null;
    };

    // Remove generic words like "instrument" to allow queries such as "rock instrument"
    const STOPWORDS = new Set([
      'instrument','instruments','instr','inst','music','musics','song','songs','related','to','your','search'
    ]);

    const normalize = (s) => (s || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')    // strip punctuation
      .split(/\s+/)
      .filter(Boolean)
      .filter(tok => !STOPWORDS.has(tok))
      .join(' ')
      .trim();

    const sanitized = normalize(q);
    const tokens = sanitized.split(/\s+/).filter(Boolean).sort((a,b) => b.length - a.length);

    // Build candidate terms to try (exact first, then unique partial):
    // 1) full raw query
    // 2) sanitized query (stopwords removed)
    // 3) individual tokens (longest first)
    const candidates = [];
    if (q) candidates.push(q);
    if (sanitized && sanitized !== q) candidates.push(sanitized);
    for (const t of tokens) if (t && !candidates.includes(t)) candidates.push(t);

    const byName = (i) => (i?.name || '').toLowerCase();

    let matchedInstrument = null;
    let matchedMood = null;

    // Try exact matches across candidates
    for (const term of candidates) {
      if (!term) continue;
      matchedInstrument = list.find(i => byName(i) === term);
      if (matchedInstrument) break;
    }

    // If no exact match, allow a single unique partial match
    if (!matchedInstrument) {
      for (const term of candidates) {
        if (!term) continue;
        const partial = list.filter(i => byName(i).includes(term));
        if (partial.length === 1) {
          matchedInstrument = partial[0];
          break;
        }
      }
    }

    // Instrument mode: only show songs featuring this instrument
    if (matchedInstrument) {
      meta.isInstrument = true;
      meta.instrumentName = matchedInstrument.name;
      meta.instrumentId = matchedInstrument._id;

      const music = (songs || []).filter(s =>
        Array.isArray(s?.instruments) &&
        s.instruments.some(ins => {
          const insId = ins?._id || ins;
          const insName = (ins?.name || '').toLowerCase();
          return (insId && insId === matchedInstrument._id) ||
                 (!!insName && insName === matchedInstrument.name.toLowerCase());
        })
      );

      // Top genres by count
      const genreCounts = new Map();
      for (const s of music) {
        for (const g of (s.genres || [])) {
          const id = g?._id || g;
          if (id) genreCounts.set(id, (genreCounts.get(id) || 0) + 1);
        }
      }
      const sortedGenreIds = [...genreCounts.entries()].sort((a,b) => b[1] - a[1]).map(([id]) => id);
      const genreMap = new Map((genres || []).map(g => [g._id, g]));
      const relatedGenres = sortedGenreIds.map(id => genreMap.get(id)).filter(Boolean).slice(0, 8);

      // Top sub-genres by count
      const subCounts = new Map();
      for (const s of music) {
        for (const sg of (s.subGenres || [])) {
          const id = sg?._id || sg;
          if (id) subCounts.set(id, (subCounts.get(id) || 0) + 1);
        }
      }
      const sortedSubIds = [...subCounts.entries()].sort((a,b) => b[1] - a[1]).map(([id]) => id);
      const subMap = new Map((subGenres || []).map(sg => [sg._id, sg]));
      const relatedSubGenres = sortedSubIds.map(id => subMap.get(id)).filter(Boolean).slice(0, 12);

      // --- NEW: co-occurrence moods from songs that feature this instrument ---
      const moodById = new Map((Array.isArray(moods) ? moods : []).map(m => [String(m?._id || ''), m]));
      const moodByName = new Map((Array.isArray(moods) ? moods : []).map(m => [(m?.name || '').toLowerCase(), m]));

      const coOccurCounts = new Map(); // key: moodId, val: count
      for (const s of music) {
        const mlist = Array.isArray(s?.moods) ? s.moods : [];
        for (const mm of mlist) {
          const idRaw = mm?._id || mm?.id || mm; // objectId string or object
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
      const coOccurMoodIds = Array.from(coOccurCounts.entries()).sort((a,b) => b[1] - a[1]).map(([id]) => id);
      const moodMatchesCoOccur = coOccurMoodIds.map(id => moodById.get(id)).filter(Boolean);

      // Merge co-occurrence (priority) with text matches, de-duped by _id
      const mergedMoodMap = new Map();
      for (const m of [...moodMatchesCoOccur, ...moodMatches]) {
        if (!m) continue;
        mergedMoodMap.set(String(m?._id), m);
      }
      moodMatches = Array.from(mergedMoodMap.values());

      // Ensure the matched instrument is included at the front
      if (!instrumentMatches.some(x => String(x?._id) === String(matchedInstrument?._id))) {
        instrumentMatches.unshift(matchedInstrument);
      }

      // Dedupe to prevent duplicate keys
      const musicUnique = uniqById(music);
      const relatedGenresUnique = uniqById(relatedGenres);
      const relatedSubGenresUnique = uniqById(relatedSubGenres);
      moodMatches = uniqById(moodMatches);
      instrumentMatches = uniqById(instrumentMatches);

      // Return the deduped arrays
      return { music: musicUnique, genres: relatedGenresUnique, subGenres: relatedSubGenresUnique, meta, moodMatches, instrumentMatches };
    }

    // Fallback: keep your existing (non-instrument) behavior unchanged
    const matchedSong = songs.find(s => s.title?.toLowerCase() === q);
    const matchedGenre = genres.find(g => g.name?.toLowerCase() === q);
    const matchedSubGenre = subGenres.find(sg => sg.name?.toLowerCase() === q);

    let music = [];
    let relatedGenres = [];
    let relatedSubGenres = [];

    if (matchedSong) {
      const songGenres = (matchedSong.genres || []).map(g => g._id);
      const songSubGenres = (matchedSong.subGenres || []).map(sg => sg._id);
      const relatedSongs = songs.filter(s =>
        s._id !== matchedSong._id &&
        ((s.genres || []).some(g => songGenres.includes(g._id)) ||
         (s.subGenres || []).some(sg => songSubGenres.includes(sg._id)))
      );
      music = [matchedSong, ...relatedSongs];
      relatedGenres = matchedSong.genres || [];
      const parentGenreIds = new Set((matchedSong.genres || []).map(g => g._id));
      const siblingSubGenres = subGenres.filter(sg => parentGenreIds.has(sg.genre?._id) && !songSubGenres.includes(sg._id));
      relatedSubGenres = [...(matchedSong.subGenres || []), ...siblingSubGenres];
    } else if (matchedGenre) {
      const genreId = matchedGenre._id;
      const subGenresInGenre = subGenres.filter(sg => sg.genre?._id === genreId);
      const songsBySubGenre = subGenresInGenre.map(sg => songs.filter(s => (s.subGenres || []).some(s_sg => s_sg._id === sg._id)));
      let interleaved = [];
      let i = 0;
      let songsLeft = true;
      while (songsLeft) {
        songsLeft = false;
        songsBySubGenre.forEach(list => {
          if (list[i]) { interleaved.push(list[i]); songsLeft = true; }
        });
        i++;
      }
      music = interleaved;
      relatedGenres = [matchedGenre];
      relatedSubGenres = subGenresInGenre;
    } else if (matchedSubGenre) {
      const subGenreName = matchedSubGenre.name;
      const allMatchingSubGenres = subGenres.filter(sg => sg.name?.toLowerCase() === subGenreName.toLowerCase());
      const matchingSubGenreIds = allMatchingSubGenres.map(sg => sg._id);
      const songsByGenre = {};
      songs.forEach(song => {
        if ((song.subGenres || []).some(sg => matchingSubGenreIds.includes(sg._id))) {
          const parentGenre = (song.genres || [])[0];
          if (parentGenre) {
            if (!songsByGenre[parentGenre.name]) songsByGenre[parentGenre.name] = [];
            songsByGenre[parentGenre.name].push(song);
          }
        }
      });
      let interleaved = [];
      let i = 0;
      let songsLeft = true;
      const songLists = Object.values(songsByGenre);
      while (songsLeft) {
        songsLeft = false;
        songLists.forEach(list => {
          if (list[i]) { interleaved.push(list[i]); songsLeft = true; }
        });
        i++;
      }
      music = interleaved;
      relatedGenres = genres.filter(g => allMatchingSubGenres.some(sg => sg.genre?._id === g._id));
      relatedSubGenres = allMatchingSubGenres;
    } else {
      const qq = q;
      music = songs.filter(song =>
        song.title?.toLowerCase().includes(qq) ||
        ((song.genres || []).some(g => g.name?.toLowerCase().includes(qq))) ||
        ((song.subGenres || []).some(sg => sg.name?.toLowerCase().includes(qq)))
      );
      relatedGenres = genres.filter(g => (g?.name || '').toLowerCase().includes(qq));
      relatedSubGenres = subGenres.filter(sg => (sg?.name || '').toLowerCase().includes(qq));
    }

    // Instrument mode early return
    if (matchedInstrument) {
      // Ensure the matched instrument is included at the front
      if (!instrumentMatches.some(x => String(x?._id) === String(matchedInstrument?._id))) {
        instrumentMatches.unshift(matchedInstrument);
      }
      return { music, genres: relatedGenres, subGenres: relatedSubGenres, meta, moodMatches, instrumentMatches };
    }

    // RIGHT BEFORE creating packedMusic, dedupe raw lists
    const musicUnique = uniqById(music);
    const relatedGenresUnique = uniqById(relatedGenres);
    const relatedSubGenresUnique = uniqById(relatedSubGenres);
    moodMatches = uniqById(moodMatches);
    instrumentMatches = uniqById(instrumentMatches);

    // Then build packedMusic from musicUnique (not music)
    const packedMusic = musicUnique.map((song) => {
      const {
        _id, title, duration, bpm, key, hasVocals,
        genres, subGenres, instruments, moods
      } = song;

      // Preserve these fields so Search cards can render covers, premium badge, and play/download correctly
      const collectionType = song?.collectionType || '';
      const audioUrl = song?.audioUrl || '';

      // Preserve all possible image sources (the card’s cover resolver will use these)
      const imageUrl = song?.imageUrl || '';
      const image = song?.image || null;            // may be object or string
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
        // normalize nested refs for pills
        genres: (genres || []).map(g => ({
          _id: g._id, name: g.name, imageUrl: g.imageUrl, description: g.description
        })),
        subGenres: (subGenres || []).map(sg => ({
          _id: sg._id, name: sg.name, imageUrl: sg.imageUrl, description: sg.description
        })),
        instruments: (instruments || []).map(ins => ({
          _id: ins._id, name: ins.name
        })),
        moods: (moods || []).map(m => ({
          _id: m._id, name: m.name, imageUrl: m.imageUrl, description: m.description
        })),
      };
    });

    // Final return: use the deduped arrays
    return {
      music: packedMusic,
      genres: relatedGenresUnique,
      subGenres: relatedSubGenresUnique,
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

  return ( 
    <section className="search-results-section" id="search-results-section"> 
      <div className="back-button-container"> 
        <button className="back-button" onClick={onBack}> 
          <ArrowLeftIcon /> Back to Main 
        </button> 
      </div> 
      <h2 className="search-results-title">Search Results for: "{searchQuery}"</h2> 

      {(loadingSongs || (searchResults.music && searchResults.music.length > 0)) && (
        <Carousel title={musicTitle} isLoading={loadingSongs} skeletonType="song">
          {searchResults.music.map((song) => {
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
              <div key={`song-${song._id}`} style={{ flex: '0 0 450px', width: '450px' }}>
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
          })} 
        </Carousel>
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