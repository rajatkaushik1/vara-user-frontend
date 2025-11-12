// src/App.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { API_BASE_URL, TASTE_ENDPOINTS } from './config';
import { CONTENT_VERSION_URL, withVersion } from './config';
import { useContentVersion } from './hooks/useContentVersion';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MusicContent from './components/MusicContent';
import MusicPlayer from './components/MusicPlayer';
import Footer from './components/Footer';
import SearchPage from './SearchPage';
import LoginPage from './LoginPage';
import PremiumPage from './PremiumPage';
import FAQ from './pages/Footer/FAQ.jsx';
import AboutUs from './pages/Footer/AboutUs.jsx';
import PrivacyPolicyPage from './pages/Footer/PrivacyPolicyPage.jsx';
import TermsOfService from './pages/Footer/TermsOfService.jsx';
import LicenseAgreement from './pages/Footer/LicenseAgreement.jsx';
import LicenseVerificationPage from './pages/LicenseVerificationPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import AssistantPage from './pages/AssistantPage.jsx';
import TeamPage from './pages/TeamPage.jsx'
import LicenseModal from './components/LicenseModal';
import GoToTopButton from './components/GoToTopButton';
import GlobalLoaderOverlay from './components/GlobalLoaderOverlay';

// Updated Notification Component with Yellow Theme
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#ebba2f', color: '#000' }; // Yellow theme
      case 'favorite':
        return { backgroundColor: '#ebba2f', color: '#000' }; // Yellow theme for favorites
      case 'warning':
        return { backgroundColor: '#ff9800', color: '#fff' }; // Orange for warnings
      case 'error':
        return { backgroundColor: '#f44336', color: '#fff' }; // Red for errors
      default:
        return { backgroundColor: '#ebba2f', color: '#000' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none'
    }}>
      <div
        className="notification"
        style={{
          ...getNotificationStyle(),
          position: 'relative',
          padding: '12px 48px 12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '300px',
          transform: 'translateX(0)',
          animation: 'slideIn 0.3s ease-out',
          pointerEvents: 'auto'
        }}
      >
        {/* Close button inside notification, top-right */}
        <button
          className="notification-close-btn"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
        {message}
        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

// The initial state for our navigation history when a new tab is selected.
const initialNavigationState = {
  view: 'for-you',
  genreId: null,
  subGenreId: null,
  title: 'For You',
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  // Loader helpers (global overlay events)
  const showLoader = (timeoutMs) => window.dispatchEvent(new CustomEvent('vara:loader:show', { detail: { timeoutMs } }));
  const hideLoader = () => window.dispatchEvent(new CustomEvent('vara:loader:hide'));
  const flashLoader = (ms = 550) => window.dispatchEvent(new CustomEvent('vara:loader:flash', { detail: { ms } }));
  // --- Data & Loading States ---
  const [genres, setGenres] = useState([]);
  const [subGenres, setSubGenres] = useState([]);
  const [songs, setSongs] = useState([]);
  // ✅ NEW: Add trending songs state
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [error, setError] = useState(null);
  
  // NEW: Progressive loading states
  const [loadingHeader, setLoadingHeader] = useState(true);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingMusicContent, setLoadingMusicContent] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingSubGenres, setLoadingSubGenres] = useState(false);
  // --- Instruments ---
  const [instruments, setInstruments] = useState([]);
  const [loadingInstruments, setLoadingInstruments] = useState(false);
  const [instrumentsLoaded, setInstrumentsLoaded] = useState(false);

  // --- Moods (NEW) ---
  const [moods, setMoods] = useState([]);
  const [loadingMoods, setLoadingMoods] = useState(false);
  const [moodsLoaded, setMoodsLoaded] = useState(false);
  
  // Track which data has been loaded
  const [songsLoaded, setSongsLoaded] = useState(false);
  const [genresLoaded, setGenresLoaded] = useState(false);
  const [subGenresLoaded, setSubGenresLoaded] = useState(false);
  // ✅ NEW: Track trending data loading
  const [trendingLoaded, setTrendingLoaded] = useState(false);

  // --- UI & Page State ---
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState('main');
  const [navigationHistory, setNavigationHistory] = useState([initialNavigationState]);
  const [returnToAiOnce, setReturnToAiOnce] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({ message: '', type: '' });

  // NEW: Track if user came from premium page
  const [cameFromPremium, setCameFromPremium] = useState(false);

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const quickSearchOverlayRef = useRef(null);
  const suppressHomeResetRef = useRef(false);
  const quickSearchSuggestions = useMemo(() => ["vlog", "happy music", "documentary", "food", "finance", "tech", "comedy"], []);

  // --- Music Player State ---
  const audioRef = useRef(new Audio());
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null);
  const [playQueue, setPlayQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  // ADD:
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // --- User State ---
  const [favouriteSongs, setFavouriteSongs] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSongId, setCurrentSongId] = useState(null); // <-- Add state for currentSongId

  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseModalData, setLicenseModalData] = useState(null);

  // --- Auto-scroll flag for tabs when navigation comes from "Explore" / "Try Audio"
  const [autoScrollTabs, setAutoScrollTabs] = useState(false);
  const clearAutoScrollTabs = useCallback(() => setAutoScrollTabs(false), []);

  // --- FIXED: Correct Premium Song Detection ---
  const isPremiumSong = (song) => {
    const t = song?.collectionType;
    return t === 'paid' || t === 'premium';
  };

  // --- Backend URL Helper Functions ---
  const getAuthBackendUrl = () => {
    const authUrl = import.meta.env.VITE_REACT_APP_AUTH_BACKEND_URL;
    return authUrl && authUrl.trim() !== '' ? authUrl : null;
  };

  const getDataBackendUrl = () => {
    return import.meta.env.VITE_REACT_APP_BACKEND_URL || 'https://vara-admin-backend.onrender.com';
  };

  // Build a share URL for copying (forced domain)
  const getForcedShareUrl = useCallback((songId) => {
    return `https://varamusic.com/home?track=${encodeURIComponent(String(songId))}`;
  }, []);

  // Update the address bar to add/replace the 'track' query param (preserve current path)
  const setUrlTrackParam = useCallback((songId) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('track', String(songId));
      // Keep current pathname (don’t navigate the SPA), replace state to avoid history spam
      window.history.replaceState({}, document.title, url.toString());
    } catch {}
  }, []);

  // Remove the 'track' query param from the address bar
  const clearUrlTrackParam = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('track');
      window.history.replaceState({}, document.title, url.toString());
    } catch {}
  }, []);

  // --- Memoized Derived State ---
  const currentView = useMemo(() => navigationHistory[navigationHistory.length - 1], [navigationHistory]);

  // --- UPDATED: Instruments-first search suggestions ---
  const filteredSuggestions = useMemo(() => {
    if (searchTerm.trim() === '') return [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Instruments first (max 5)
    const matchedInstrumentNames = (instruments || [])
      .filter(i => i?.name && i.name.toLowerCase().includes(lowerCaseSearchTerm))
      .map(i => i.name)
      .slice(0, 5);

    // Moods (max 4)
    const matchedMoodNames = (moods || [])
      .filter(m => m?.name && m.name.toLowerCase().includes(lowerCaseSearchTerm))
      .map(m => m.name)
      .slice(0, 4);

    // Songs (max 4)
    const matchedSongTitles = songs
      .filter(s => s.title && s.title.toLowerCase().includes(lowerCaseSearchTerm))
      .map(s => s.title)
      .slice(0, 4);

    // Genres (max 3)
    const matchedGenreNames = genres
      .filter(g => g.name && g.name.toLowerCase().includes(lowerCaseSearchTerm))
      .map(g => g.name)
      .slice(0, 3);

    // Sub-genres (max 3)
    const matchedSubGenreNames = subGenres
      .filter(sg => sg.name && sg.name.toLowerCase().includes(lowerCaseSearchTerm))
      .map(sg => sg.name)
      .slice(0, 3);

    const allSuggestions = [...new Set([
      ...matchedInstrumentNames,
      ...matchedMoodNames,     // NEW
      ...matchedSongTitles,
      ...matchedGenreNames,
      ...matchedSubGenreNames
    ])];

    return allSuggestions.slice(0, 10);
  }, [searchTerm, songs, genres, subGenres, instruments, moods]);

  // --- FIXED: Database-based Favorites using AUTH BACKEND ---
  const fetchUserFavorites = useCallback(async () => {
    if (!currentUser) {
      setFavouriteSongs(new Set());
      return;
    }

    try {
      // FIXED: Use AUTH backend for user favorites
      const favoritesResponse = await fetch(`${getAuthBackendUrl()}/api/user/favorites`, {
        credentials: 'include'
      });

      if (favoritesResponse.ok) {
        const favoriteIds = await favoritesResponse.json();
        setFavouriteSongs(new Set(favoriteIds));
      } else if (favoritesResponse.status === 401) {
        // User not authenticated, clear favorites
        setFavouriteSongs(new Set());
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavouriteSongs(new Set());
    }
  }, [currentUser]);

  // ADD: StrictMode-safe current user fetch helper
  const fetchCurrentUser = useCallback(async () => {
    const authBackendUrl = getAuthBackendUrl();
    if (!authBackendUrl) {
      console.log('ℹ️ Auth backend not configured - running in demo mode');
      setCurrentUser(null);
      return null;
    }
    try {
      console.log('🔍 Checking auth status at:', `${authBackendUrl}/api/user`);
      const response = await fetch(`${authBackendUrl}/api/user`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        console.log('✅ User logged in:', userData);
        return userData;
      } else if (response.status === 401) {
        console.log('ℹ️ No user logged in (401) - Auth backend running but no active session');
        setCurrentUser(null);
        return null;
      } else {
        console.log(`⚠️ Auth check failed with status: ${response.status}`);
        setCurrentUser(null);
        return null;
      }
    } catch (error) {
      console.log('⚠️ Auth backend not available - running without authentication:', error.message);
      setCurrentUser(null);
      return null;
    }
  }, [getAuthBackendUrl]);

  // FIXED: Check auth status using AUTH BACKEND (StrictMode-safe, run once per page load)
  useEffect(() => {
    // Guard StrictMode re-mount in development by using a global flag
    if (typeof window !== 'undefined' && window.__VARA_AUTH_INIT__ === true) {
      return;
    }
    if (typeof window !== 'undefined') {
      window.__VARA_AUTH_INIT__ = true;
    }

    // Read URL params exactly once at startup
    const urlParams = new URLSearchParams(window.location.search);

    // Handle "came from premium" marker
    const fromPremium = urlParams.get('from') === 'premium';
    if (fromPremium) {
      setCameFromPremium(true);
      setNotification({
        message: 'Please log in to access premium features and unlock your music journey! 🎵',
        type: 'warning'
      });
    }

    // Handle post-login redirect
    if (urlParams.get('login') === 'success') {
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      if (fromPremium || cameFromPremium) {
        // If we came from premium, go back to premium page with a success toast
        setCameFromPremium(false);
        setCurrentPage('premium');
        setActiveTab('premium');
        setNotification({
          message: '✅ Successfully logged in! Welcome to premium features.',
          type: 'success'
        });
        navigate('/premium', { replace: true });
      } else {
        setNotification({
          message: '✅ Successfully logged in!',
          type: 'success'
        });
        navigate('/home', { replace: true });
      }
    }

    // Fetch current user once
    fetchCurrentUser();
  }, []); // Do not add dependencies; global flag ensures single run

  // Fetch favorites when user changes
  useEffect(() => {
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  // --- Data Fetching using DATA BACKEND ---
  // In-flight promise guards to dedupe parallel fetches
  const songsPromiseRef = useRef(null);
  const genresPromiseRef = useRef(null);
  const subGenresPromiseRef = useRef(null);
  const trendingPromiseRef = useRef(null);
  const instrumentsPromiseRef = useRef(null);
  const moodsPromiseRef = useRef(null);

  const fetchSongs = useCallback(async () => {
    // If a request is already in-flight, return it
    if (songsPromiseRef.current) return songsPromiseRef.current;
    // If already loaded, do not fetch again
    if (songsLoaded) return null;

    setLoadingSongs(true);
    const backendUrl = getDataBackendUrl();

    const p = (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/songs`);
        if (!res.ok) throw new Error('Failed to fetch songs from the server.');
        const data = await res.json();
        setSongs(data);
        setSongsLoaded(true);
        return data;
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load songs. Please check your connection and try again.');
        throw err;
      } finally {
        setLoadingSongs(false);
        songsPromiseRef.current = null;
      }
    })();

    songsPromiseRef.current = p;
    return p;
  }, [songsLoaded, getDataBackendUrl]);

  // Add initial autoplay ref for track deep-linking
  const initialTrackAutoplayRef = useRef(false);

  const fetchGenres = useCallback(async () => {
    if (genresPromiseRef.current) return genresPromiseRef.current;
    if (genresLoaded) return null;

    setLoadingGenres(true);
    const backendUrl = getDataBackendUrl();

    const p = (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/genres`);
        if (!res.ok) throw new Error('Failed to fetch genres from the server.');
        const data = await res.json();
        setGenres(data);
        setGenresLoaded(true);
        return data;
      } catch (err) {
        console.error('❌ Error fetching genres:', err);
        setError('Failed to load genres. Please check your connection and try again.');
        throw err;
      } finally {
        setLoadingGenres(false);
        genresPromiseRef.current = null;
      }
    })();

    genresPromiseRef.current = p;
    return p;
  }, [genresLoaded, getDataBackendUrl]);

  const fetchSubGenres = useCallback(async () => {
    if (subGenresPromiseRef.current) return subGenresPromiseRef.current;
    if (subGenresLoaded) return null;

    setLoadingSubGenres(true);
    const backendUrl = getDataBackendUrl();

    const p = (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/subgenres`);
        if (!res.ok) throw new Error('Failed to fetch subgenres from the server.');
        const data = await res.json();
        setSubGenres(data);
        setSubGenresLoaded(true);
        return data;
      } catch (err) {
        console.error('❌ Error fetching subgenres:', err);
        setError('Failed to load subgenres. Please check your connection and try again.');
        throw err;
      } finally {
        setLoadingSubGenres(false);
        subGenresPromiseRef.current = null;
      }
    })();

    subGenresPromiseRef.current = p;
    return p;
  }, [subGenresLoaded, getDataBackendUrl]);

  const fetchTrendingSongs = useCallback(async () => {
    if (trendingPromiseRef.current) return trendingPromiseRef.current;
    if (trendingLoaded) return null;

    setLoadingTrending(true);
    const backendUrl = getDataBackendUrl();

    const p = (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/songs/trending?limit=15`);
        if (!res.ok) throw new Error('Failed to fetch trending songs from the server.');
        const data = await res.json();
        setTrendingSongs(data);
        setTrendingLoaded(true);
        return data;
      } catch (err) {
        console.error('❌ Error fetching trending songs:', err);
        setTrendingSongs([]);
        throw err;
      } finally {
        setLoadingTrending(false);
        trendingPromiseRef.current = null;
      }
    })();

    trendingPromiseRef.current = p;
    return p;
  }, [trendingLoaded, getDataBackendUrl]);

  const fetchInstruments = useCallback(async () => {
    if (instrumentsPromiseRef.current) return instrumentsPromiseRef.current;
    if (instrumentsLoaded) return null;

    setLoadingInstruments(true);
    const backendUrl = getDataBackendUrl();

    const p = (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/instruments`);
        if (!res.ok) throw new Error('Failed to fetch instruments from the server.');
        const data = await res.json();
        setInstruments(Array.isArray(data) ? data : []);
        setInstrumentsLoaded(true);
        return data;
      } catch (err) {
        console.error('❌ Error fetching instruments:', err);
        throw err;
      } finally {
        setLoadingInstruments(false);
        instrumentsPromiseRef.current = null;
      }
    })();

    instrumentsPromiseRef.current = p;
    return p;
  }, [instrumentsLoaded, getDataBackendUrl]);

  // NEW: Fetch moods (mirrors fetchInstruments)
  const fetchMoods = useCallback(async () => {
    if (moodsPromiseRef.current) return moodsPromiseRef.current;
    if (moodsLoaded) return null;

    setLoadingMoods(true);
    const backendUrl = getDataBackendUrl();

    const p = (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/moods`);
        if (!res.ok) throw new Error('Failed to fetch moods from the server.');
        const data = await res.json();
        setMoods(Array.isArray(data) ? data : []);
        setMoodsLoaded(true);
        return data;
      } catch (err) {
        console.error('❌ Error fetching moods:', err);
        throw err;
      } finally {
        setLoadingMoods(false);
        moodsPromiseRef.current = null;
      }
    })();

    moodsPromiseRef.current = p;
    return p;
  }, [moodsLoaded, getDataBackendUrl]);

  // Refetch ONLY core lists (songs, genres, sub-genres) when content version changes.
  const refetchCoreLists = useCallback(async (v) => {
    try {
      const backendUrl = getDataBackendUrl();
      const [songsRes, genresRes, subGenresRes, moodsRes] = await Promise.all([
        fetch(withVersion(`${backendUrl}/api/songs`, v)),
        fetch(withVersion(`${backendUrl}/api/genres`, v)),
        fetch(withVersion(`${backendUrl}/api/subgenres`, v)),
        fetch(withVersion(`${backendUrl}/api/moods`, v)), // NEW
      ]);

      const [songsData, genresData, subData, moodsData] = await Promise.all([
        songsRes.ok ? songsRes.json() : Promise.resolve(songs),
        genresRes.ok ? genresRes.json() : Promise.resolve(genres),
        subGenresRes.ok ? subGenresRes.json() : Promise.resolve(subGenres),
        moodsRes.ok ? moodsRes.json() : Promise.resolve(moods),
      ]);

      setSongs(Array.isArray(songsData) ? songsData : []);
      setGenres(Array.isArray(genresData) ? genresData : []);
      setSubGenres(Array.isArray(subData) ? subData : []);
      setMoods(Array.isArray(moodsData) ? moodsData : []);
    } catch (e) {
      console.error('Content-version refresh failed:', e?.message || e);
    }
  }, [getDataBackendUrl, songs, genres, subGenres, moods]);

  // Watch the content version from admin backend and refresh core lists when it changes.
  useContentVersion({
    versionUrl: CONTENT_VERSION_URL,
    onChange: (newV /*, payload */) => {
      // Refresh ONLY core lists (songs, genres, sub-genres) with a versioned URL.
      refetchCoreLists(newV);
    },
    intervalMs: 15000 // ~15s polling; also re-checks on window focus/visibility
  });

  // --- Auto-fetch user favorites on mount ---
  useEffect(() => {
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  // --- Data Fetching - INITIAL LOAD ---
  // In-flight promise guards to dedupe parallel fetches
  const initialLoadPromiseRef = useRef(null);

  const startProgressiveLoading = useCallback(async () => {
    // If an initial load is already in progress, return it
    if (initialLoadPromiseRef.current) return initialLoadPromiseRef.current;

    setError(null);
    
    // Step 1: Load Header
    setLoadingHeader(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    setLoadingHeader(false);
    
    // Step 2: Load Hero Section
    setLoadingHero(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    setLoadingHero(false);
    
    // Step 3: Load Music Content Section
    setLoadingMusicContent(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    setLoadingMusicContent(false);
    
    // Step 4: Load ALL data in parallel for instant access
    const p = (async () => {
      try {
        await Promise.all([
          fetchSongs(),
          fetchGenres(),
          fetchSubGenres(),
          fetchTrendingSongs(),
          fetchInstruments(),
          fetchMoods(), // NEW
        ]);
      } catch (e) {
        console.error('Error during initial data load:', e);
        setError('Failed to load initial data. Please refresh the page.');
      }
    })();

    initialLoadPromiseRef.current = p;
    return p;
  }, [fetchSongs, fetchGenres, fetchSubGenres, fetchTrendingSongs, fetchInstruments, fetchMoods]);

  // Replace old fetchData with progressive loading (StrictMode-safe: run once per page load)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__VARA_DATA_INIT__ === true) {
      return;
    }
    if (typeof window !== 'undefined') {
      window.__VARA_DATA_INIT__ = true;
    }
    startProgressiveLoading();
  }, [startProgressiveLoading]);

  const handleLoginSuccess = useCallback((userData) => {
    setCurrentUser(userData);
    setNotification({ message: '✅ Successfully logged in!', type: 'success' });
  }, []);

  // FIXED: handleLogout using AUTH BACKEND
  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${getAuthBackendUrl()}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setCurrentUser(null);
      setFavouriteSongs(new Set()); // Clear favorites on logout
      setCurrentPage('main');
      setActiveTab('home');
      
      setNotification({ message: '✅ You have been logged out', type: 'success' });
      
    } catch (error) {
      console.error('Logout error:', error);
      setNotification({ message: '❌ Logout failed', type: 'error' });
    }
  }, []);

  // --- Core Navigation Logic ---
  const scrollToSection = useCallback((sectionId = 'content-tabs-section') => {
    setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const y = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, 0);
  }, []);

  const navigateTo = useCallback((newView) => {
    // mark music content loading while view transitions
    setLoadingMusicContent(true);
    setNavigationHistory(prevHistory => [...prevHistory, newView]);

    // IMPORTANT: DO NOT call scrollToSection() here.
    // MusicContent will scroll itself once it has finished rendering the tabs.
    setTimeout(() => {
      setLoadingMusicContent(false);
    }, 300);
  }, []);

  const handleBackButtonClick = useCallback(() => {
    // One-time return path to AI with restored results
    if (returnToAiOnce) {
      setReturnToAiOnce(false);

      // Signal AI page to restore the last snapshot ONLY for this Back navigation.
      try { if (typeof window !== 'undefined') window.__VARA_AI_RESTORE_ON_BACK__ = true; } catch {}

      navigate('/ai');
      setCurrentPage('ai');
      setActiveTab('ai');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Default: step back within Home's view stack
    if (navigationHistory.length > 1) {
      setNavigationHistory(prevHistory => prevHistory.slice(0, -1));
    }
  }, [returnToAiOnce, navigationHistory.length, navigate]);

  const handleTabClick = useCallback((viewType) => {
    flashLoader(550);
    let newInitialState;
    let newActiveTab;
    switch (viewType) {
        case 'genres': 
            newInitialState = { view: 'all-genres', title: 'Genres' }; 
            newActiveTab = 'home';
            // Data already loaded - no need to fetch
            break;
        case 'sub-genres': 
            newInitialState = { view: 'all-sub-genres', title: 'Sub-Genres' }; 
            newActiveTab = 'home';
            // Data already loaded - no need to fetch
            break;
        case 'instruments':
            newInitialState = { view: 'all-instruments', title: 'Instruments' };
            newActiveTab = 'home';
            break;
        case 'moods':
            newInitialState = { view: 'all-moods', title: 'Moods' };
            newActiveTab = 'home';
            break;
        case 'free-songs': 
            newInitialState = { view: 'free-songs', title: 'Free Songs' }; 
            newActiveTab = 'home';
            break;
        case 'favourites': 
            newInitialState = { view: 'favourites', title: 'Favourites' }; 
            newActiveTab = 'favourites';
            break;
        default: 
            newInitialState = { view: 'for-you', title: 'For You' }; 
            newActiveTab = 'home';
            break;
    }
    
    setLoadingMusicContent(true);
    setNavigationHistory([newInitialState]);
    setActiveTab(newActiveTab);
    scrollToSection();
    setTimeout(() => setLoadingMusicContent(false), 300);
  }, [scrollToSection]);

  const handleExploreGenre = useCallback((genreId, fromExplore = false) => {
    flashLoader(550);
    console.log('🔍 Exploring genre:', genreId);
    const genre = genres.find(g => g._id === genreId);
    if (genre) {
      console.log('✅ Genre found:', genre.name);
      if (fromExplore) setAutoScrollTabs(true);
      navigateTo({ view: 'sub-genres-by-genre', genreId: genre._id, title: genre.name });
    } else {
      console.error('❌ Genre not found:', genreId);
      setNotification({ message: '❌ Genre not found', type: 'error' });
    }
  }, [genres, navigateTo]);

  const handleExploreSubgenre = useCallback((subGenreId, fromExplore = false) => {
    flashLoader(550);
    console.log('🔍 Exploring subgenre:', subGenreId);
    const subGenre = subGenres.find(sg => sg._id === subGenreId);
    if (subGenre) {
      console.log('✅ SubGenre found:', subGenre.name);
      if (fromExplore) setAutoScrollTabs(true);
      navigateTo({ view: 'songs-by-sub-genre', subGenreId: subGenre._id, title: subGenre.name });
    } else {
      console.error('❌ SubGenre not found:', subGenreId);
      setNotification({ message: '❌ Sub-genre not found', type: 'error' });
    }
  }, [subGenres, navigateTo]);

  // --- Explore instrument handler ---
  const handleExploreInstrument = useCallback((instrumentId, fromExplore = false) => {
    flashLoader(550);
    console.log('🔍 Exploring instrument:', instrumentId);
    const inst = instruments.find(i => i._id === instrumentId);
    if (inst) {
      console.log('✅ Instrument found:', inst.name);
      if (fromExplore) setAutoScrollTabs(true);
      navigateTo({ view: 'songs-by-instrument', instrumentId: inst._id, title: inst.name });
    } else {
      console.error('❌ Instrument not found:', instrumentId);
      setNotification({ message: '❌ Instrument not found', type: 'error' });
    }
  }, [instruments, navigateTo]);

  // NEW: Explore mood handler
  const handleExploreMood = useCallback((moodId, fromExplore = false) => {
    flashLoader(550);
    console.log('🔍 Exploring mood:', moodId);
    const m = moods.find(i => i._id === moodId);
    if (m) {
      console.log('✅ Mood found:', m.name);
      if (fromExplore) setAutoScrollTabs(true);
      navigateTo({ view: 'songs-by-mood', moodId: m._id, title: m.name });
    } else {
      console.error('❌ Mood not found:', moodId);
      setNotification({ message: '❌ Mood not found', type: 'error' });
    }
  }, [moods, navigateTo]);

  const handleNavLinkClick = useCallback((tabName, sectionId, fromExplore = false) => {
    flashLoader(550);
    if (tabName === 'login' || tabName === 'premium') {
      setCurrentPage(tabName);
      setActiveTab(tabName);
      setShowSearchPage(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate('/' + tabName);
      return;
    }
    navigate('/home');
    setCurrentPage('main');
    setActiveTab(tabName);
    setShowSearchPage(false);
    setSearchTerm('');
    if (tabName === 'home') {
        // Clear any previous AI restore intent when clicking HOME
        try { if (typeof window !== 'undefined') window.__VARA_AI_RESTORE_ON_BACK__ = false; } catch {}
        
        setNavigationHistory([initialNavigationState]);
        // If this was triggered from the hero/TRY AUDIO button, mark auto-scroll allowed
        if (fromExplore && sectionId) {
            setAutoScrollTabs(true);
            scrollToSection(sectionId);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else if (tabName === 'favourites') {
        handleTabClick('favourites');
    }
  }, [handleTabClick, scrollToSection]);

  // NEW: Handle premium page navigation with login check
  const handlePremiumAccess = useCallback(() => {
    if (!currentUser) {
      // User not logged in - redirect to login with premium flag
      setCurrentPage('login');
      setActiveTab('login');
      setCameFromPremium(true);
      setNotification({ message: 'Please log in to access premium features and unlock your music journey! 🎵', type: 'warning' });
      navigate('/login?from=premium');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false; // Indicate that premium access was denied
    }
    return true; // User is logged in, allow premium access
  }, [currentUser]);

  // NEW: Handle search focus - data already loaded
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    // No need to fetch - data already loaded
  }, []);

  const handleSearchSubmit = useCallback((queryToSearch = searchTerm) => {
    const query = queryToSearch.trim();
    if (query) {
      window.scrollTo(0, 0);
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setCurrentSearchQuery(query);
      setShowSearchPage(true);
      setActiveTab('home');
      setCurrentPage('main');
      setIsSearchFocused(false);
      setActiveSuggestionIndex(-1);
    }
  }, [searchTerm]);

  const handleSearchKeyDown = useCallback((e) => {
    const suggestions = filteredSuggestions.length > 0 ? filteredSuggestions : quickSearchSuggestions;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex > -1) handleSearchSubmit(suggestions[activeSuggestionIndex]);
      else handleSearchSubmit();
    }
  }, [activeSuggestionIndex, filteredSuggestions, quickSearchSuggestions, handleSearchSubmit]);

  useEffect(() => { setActiveSuggestionIndex(-1); }, [searchTerm]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchTerm(suggestion);
    handleSearchSubmit(suggestion);
  }, [handleSearchSubmit]);

  const handleBackToMainApp = useCallback(() => {
    setShowSearchPage(false);
    setCurrentSearchQuery('');
    setSearchTerm('');
    navigate('/home'); // keep URL in sync when leaving search
  }, [navigate]);

  const handleExploreFromSearch = useCallback((type, id) => {
    flashLoader(550);
    // Mark that we navigated to Home from AI/Search and we want the Home "Back" button to return to AI once.
    setReturnToAiOnce(true);

    // Prevent the /home URL→state effect from resetting us to "For You"
    suppressHomeResetRef.current = true;

    // Explicitly switch the app to Home page so header highlights 'HOME' and the search bar is visible.
    setCurrentPage('main');
    setActiveTab('home');

    // Now navigate to home and trigger the specific explore action shortly after.
    handleBackToMainApp(); // navigates('/home') and closes search UI
    setTimeout(() => {
      if (type === 'genre') handleExploreGenre(id);
      else if (type === 'subGenre') handleExploreSubgenre(id);
      else if (type === 'instrument') handleExploreInstrument(id);
      else if (type === 'mood') handleExploreMood(id);
    }, 50);
  }, [handleBackToMainApp, handleExploreGenre, handleExploreSubgenre, handleExploreInstrument, handleExploreMood]);

  // --- Music Player Logic ---
  // NEW: Track song interactions
  const trackSongInteraction = useCallback(async (songId, interactionType, additionalData = {}) => {
    try {
      const trackingData = {
        interactionType,
        userId: currentUser?.email || 'anonymous',
        userEmail: currentUser?.email,
        ...additionalData
      };

      const response = await fetch(`${getDataBackendUrl()}/api/songs/track/${songId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });

      if (response.ok) {
        console.log(`✅ Tracked ${interactionType} for song ${songId}`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to track ${interactionType}:`, error);
    }
  }, [currentUser]);

  // NEW: Track song interactions for taste profile
  const trackTasteInteraction = useCallback(async (song, interactionType, additionalData = {}) => {
    // Only track for logged-in users
    if (!currentUser) return;

    try {
      const trackingData = {
        songId: song._id,
        interactionType,
        genres: song.genres || [],
        subGenres: song.subGenres || [],
        ...additionalData
      };

      const response = await fetch(TASTE_ENDPOINTS.trackInteraction(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(trackingData)
      });

      if (response.ok) {
        console.log(`✅ Taste interaction tracked: ${interactionType} for song ${song.title}`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to track taste interaction:`, error);
    }
  }, [currentUser]);

  const playSong = useCallback((song) => {
    const audio = audioRef.current;
    // ADD:
    setIsAudioLoading(true);
    setCurrentPlayingSong(song);
    // Update URL to reflect current track (deep-link)
    try { setUrlTrackParam(song._id); } catch {}
    setCurrentSongId(song._id); // <-- Set currentSongId when a song is played
    setIsPlayerVisible(true);
    audio.src = song.audioUrl;
    audio.play().then(() => {
      setIsPlaying(true);
      
      // Track play interaction for both analytics and taste
      trackSongInteraction(song._id, 'play', {
        startTime: 0,
        duration: song.duration || 0
      });
      
      // Track for taste profile
      trackTasteInteraction(song, 'play');
    }).catch(e => console.error("Error playing song:", e));
  }, [trackSongInteraction, trackTasteInteraction]);

  const handlePlayPause = useCallback((songToPlay, queue = []) => {
    const audio = audioRef.current;
    if (songToPlay) {
      if (currentPlayingSong?._id === songToPlay._id) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play().then(() => setIsPlaying(true));
        }
      } else {
        setPlayQueue(queue);
        setCurrentSongId(songToPlay._id); // <-- Set currentSongId when play is triggered from SearchPage
        playSong(songToPlay);
      }
    } else if (currentPlayingSong) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true));
      }
    }
  }, [currentPlayingSong, isPlaying, playSong]);

  const handleNextSong = useCallback(() => {
    if (playQueue.length === 0) return;
    const currentIndex = playQueue.findIndex(song => song._id === currentPlayingSong?._id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % playQueue.length;
    playSong(playQueue[nextIndex]);
  }, [playQueue, currentPlayingSong, playSong]);

  const handlePreviousSong = useCallback(() => {
    if (playQueue.length === 0) return;
    const currentIndex = playQueue.findIndex(song => song._id === currentPlayingSong?._id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + playQueue.length) % playQueue.length;
    playSong(playQueue[prevIndex]);
  }, [playQueue, currentPlayingSong, playSong]);

  const handleEnded = useCallback(() => {
    handleNextSong();
  }, [handleNextSong]);
  
  useEffect(() => {
    const audio = audioRef.current;
    // ADD:
    const handleCanPlay = () => {
      setIsAudioLoading(false);
      setDuration(audio.duration);
    };
    const handlePlaying = () => {
      setIsAudioLoading(false);
    };
    const setAudioData = () => { setDuration(audio.duration); };
    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.volume = volume;
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [volume, handleEnded]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio.duration) {
        const seekTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = seekTime;
        setProgress(e.target.value);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (newVolume > 0) setPreviousVolume(newVolume);
  };

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
      audioRef.current.volume = 0;
    } else {
      const newVolume = previousVolume > 0 ? previousVolume : 0.7;
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
    }
  }, [volume, previousVolume]);

  const handleClosePlayer = useCallback(() => {
    // ADD:
    setIsAudioLoading(false);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setIsPlayerVisible(false);
    setCurrentPlayingSong(null);
    // Clear track param from URL when player is closed
    try { clearUrlTrackParam(); } catch {}
  }, [isPlaying]);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // UPDATED: Enhanced download handling with taste tracking
  const handleDownload = useCallback(async (song) => {
    try {
      // 0) Basic validation
      if (!song || !(song._id || song.id)) {
        setNotification({ message: '❌ Invalid song data. Please try again.', type: 'error' });
        return;
      }

      const authBase = (typeof getAuthBackendUrl === 'function')
        ? getAuthBackendUrl()
        : ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_REACT_APP_AUTH_BACKEND_URL) || 'http://localhost:5000');
      const authRoot = String(authBase).replace(/\/+$/, '');

      const safeSongId = song._id || song.id;
      const safeTitle = song.title || song.name || 'Track';
      const songUrl = song?.audioUrl || song?.url || song?.cloudinaryUrl || song?.fileUrl || null;

      // 1) Login required
      if (!currentUser) {
        setNotification({ message: '🔒 Please login to download songs', type: 'warning' });
        return;
      }

      // 2) Premium gating BEFORE any server tracking
      const premium = isPremiumSong(song);
      if (premium && !currentUser.is_premium) {
        setNotification({
          message: '🎵 This is a premium track. Upgrade to Vara Premium to download paid songs and unlock the full library.',
          type: 'warning'
        });
        return;
      }

      // 3) Monthly limit pre-check
      try {
        const limitsRes = await fetch(`${authRoot}/api/user/limits`, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' }
        });
        if (limitsRes.ok) {
          const limits = await limitsRes.json();
          if ((limits?.remaining ?? 0) <= 0) {
            const plan = limits?.plan === 'premium' ? 'premium' : 'free';
            const msg = plan === 'premium'
              ? 'You’ve reached your monthly limit of 50 downloads on this account. To get more downloads right now, sign in with a different Google account and upgrade there.'
              : 'You’ve reached your monthly download limit on the Free plan. Upgrade to Premium to unlock up to 50 downloads per month.';
            setNotification({ message: msg, type: 'warning' });
            return;
          }
        }
      } catch {
        // If the pre-check fails unexpectedly, we stop (safer than decrementing incorrectly)
        setNotification({ message: '⚠️ Could not verify your download limit. Please try again.', type: 'error' });
        return;
      }

      // 4) Track the download on the server (authoritative)
      showLoader(15000);
      const trackRes = await fetch(`${authRoot}/api/user/track-download`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ songId: safeSongId, songTitle: safeTitle })
      });

      if (trackRes.status === 429) {
        let body = {};
        try { body = await trackRes.json(); } catch {}
        const plan = body?.plan === 'premium' ? 'premium' : 'free';
        const msg = plan === 'premium'
          ? 'You’ve reached your monthly limit of 50 downloads on this account. To get more downloads right now, sign in with a different Google account and upgrade there.'
          : 'You’ve reached your monthly download limit on the Free plan. Upgrade to Premium to unlock up to 50 downloads per month.';
        setNotification({ message: msg, type: 'warning' });
        window.dispatchEvent(new CustomEvent('vara:download-recorded', { detail: { remaining: typeof body?.remaining === 'number' ? body.remaining : undefined } }));
        hideLoader();
        return;
      }
      if (!trackRes.ok) {
        setNotification({ message: 'We couldn’t verify your download. Please try again in a moment.', type: 'error' });
        hideLoader();
        return;
      }

      // --- License modal integration (do not modify other logic) ---
      let payload = {};
      try { payload = await trackRes.json(); } catch {}

      // Notify the header badge; update immediately then revalidate
      window.dispatchEvent(new CustomEvent('vara:download-recorded', {
        detail: {
          remaining: typeof payload?.remaining === 'number' ? payload.remaining : undefined,
          optimisticDelta: (typeof payload?.remaining === 'number') ? undefined : -1
        }
      }));

      // Seed modal with immediate data
      setLicenseModalData({
        licenseId: payload?.licenseId,
        issuedToEmail: payload?.issuedToEmail,
        subscriptionStatus: payload?.subscriptionStatus || (payload?.plan === 'premium' ? 'Active' : 'Inactive'),
        validFor: payload?.validFor || 'Use on YouTube & Social Platforms',
        songTitle: (song?.title || song?.name || 'Track'),
        issuedAtUtcIso: null, // will be filled after verify
        remaining: typeof payload?.remaining === 'number' ? payload.remaining : undefined
      });
      setLicenseModalOpen(true);
      hideLoader();

      // Enrich with verify call (to get issuedAt)
      try {
        const verifyRes = await fetch(`${authRoot}/api/license/verify?id=${encodeURIComponent(payload?.licenseId)}`, { method: 'GET' });
        if (verifyRes.ok) {
          const v = await verifyRes.json();
          setLicenseModalData((d) => d ? ({
            ...d,
            issuedAtUtcIso: v?.issuedAtUtcIso || d.issuedAtUtcIso,
            subscriptionStatus: v?.subscriptionStatus || d.subscriptionStatus,
            validFor: v?.validFor || d.validFor,
            songTitle: v?.songTitle || d.songTitle
          }) : d);
        }
      } catch {}
      // --- end License modal integration ---

      // Keep badge in sync
      window.dispatchEvent(new CustomEvent('vara:download-recorded'));

      // 5) Now actually download the file via backend proxy (no CORS issues)
      if (!songUrl) {
        setNotification({ message: '❌ Download link is missing for this track.', type: 'error' });
        return;
      }

      setNotification({ message: `⬇️ Preparing "${safeTitle}" for download...`, type: 'success' });

      // Build a safe custom filename
      const sanitizedTitle = safeTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toUpperCase();
      const customFilename = `${sanitizedTitle}-VARAMUSIC.COM.mp3`;

      // Build proxy URL on AUTH backend
      const proxyUrl = `${authRoot}/api/files/song/${encodeURIComponent(safeSongId)}?filename=${encodeURIComponent(customFilename)}`;

      try {
        const resp = await fetch(proxyUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: { Accept: 'audio/*' },
          cache: 'no-store'
        });

        if (!resp.ok) {
          setNotification({ message: `❌ Download failed (${resp.status}). Please try again.`, type: 'error' });
        } else {
          const blob = await resp.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = customFilename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

          setNotification({ message: `✅ "${safeTitle}" downloaded successfully!`, type: 'success' });
        }
      } catch (e) {
        console.error('❌ Proxy download error:', e);
        setNotification({ message: '❌ Download failed. Please try again.', type: 'error' });
      }

      // Optional analytics/taste tracking (non-blocking)
      try {
        trackSongInteraction(safeSongId, 'download');
        trackTasteInteraction(song, 'download');
      } catch {}

    } catch (error) {
      console.error('❌ Download error:', error);
      hideLoader();
      setNotification({ message: '❌ Download failed. Please try again.', type: 'error' });
    }
  }, [currentUser, isPremiumSong, trackSongInteraction, trackTasteInteraction, getAuthBackendUrl]);

  // FIXED: Database-based favorite handling with taste tracking
  const handleToggleFavourite = useCallback(async (songId) => {
    // Check if user is logged in
    if (!currentUser) {
      setNotification({ message: '❤️ Please login to add songs to favorites', type: 'warning' });
      return;
    }

    const isCurrentlyFavorite = favouriteSongs.has(songId);
    const song = songs.find(s => s._id === songId);

    // Track the interaction
    trackSongInteraction(songId, isCurrentlyFavorite ? 'unfavorite' : 'favorite');
    
    // Track for taste profile
    if (song) {
      trackTasteInteraction(song, isCurrentlyFavorite ? 'unfavorite' : 'favorite');
    }

    try {
        showLoader(6000);
      const response = await fetch(`${getAuthBackendUrl()}/api/user/favorites${isCurrentlyFavorite ? `/${songId}` : ''}`, {
        method: isCurrentlyFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: isCurrentlyFavorite ? undefined : JSON.stringify({ songId })
      });

      if (response.ok) {
        setFavouriteSongs(prev => {
          const newFavs = new Set(prev);
          if (isCurrentlyFavorite) {
            newFavs.delete(songId);
          } else {
            newFavs.add(songId);
            setNotification({ message: '💛 This song is added to Favourites', type: 'favorite' });
          }
          return newFavs;
        });
          hideLoader();
      } else {
          hideLoader();
        throw new Error('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
        hideLoader();
      setNotification({ message: '❌ Failed to update favorites', type: 'error' });
    }
  }, [currentUser, favouriteSongs, songs, trackSongInteraction, trackTasteInteraction, getAuthBackendUrl]);

  // REPLACE: refreshUserData to use fetchCurrentUser
  const refreshUserData = async () => {
    console.log('🔄 Manually refreshing user data...');
    await fetchCurrentUser();
  };

  // Add scrollToTabs function for smooth scroll to tab section
  const scrollToTabs = () => {
    const tabSection = document.getElementById('main-tab-section');
    if (tabSection) {
      tabSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login': return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'premium': return <PremiumPage currentUser={currentUser} onPremiumAccess={handlePremiumAccess} />;
      default:
        if (showSearchPage) {
          return (
            <SearchPage
              searchQuery={currentSearchQuery} songs={songs} genres={genres} subGenres={subGenres}
              onBack={handleBackToMainApp}
              handlePlayPause={handlePlayPause}
              currentPlayingSong={currentPlayingSong} isPlaying={isPlaying} formatTime={formatTime}
              favouriteSongs={favouriteSongs} handleToggleFavourite={handleToggleFavourite}
              handleDownload={handleDownload} loadingSongs={loadingSongs} onExplore={handleExploreFromSearch}
              currentUser={currentUser}
              currentSongId={currentSongId}
              instruments={instruments}
              moods={moods}
            />
          );
        }
        return (
          <>
            <HeroSection loadingHeader={loadingHeader} loadingHero={loadingHero} handleNavLinkClick={handleNavLinkClick} currentUser={currentUser} />
            <MusicContent
                loadingMusicContent={loadingMusicContent}
                loadingSongs={loadingSongs}
                loadingGenres={loadingGenres} 
                loadingSubGenres={loadingSubGenres}
                trendingSongs={trendingSongs}
                loadingTrending={loadingTrending}
                error={error}
                currentView={currentView}
                showBackButton={navigationHistory.length > 1}
                onBackButtonClick={handleBackButtonClick}
                onTabClick={handleTabClick}
                onExploreGenre={handleExploreGenre}
                onExploreSubgenre={handleExploreSubgenre}
                // --- Pass instruments props ---
                instruments={instruments}
                loadingInstruments={loadingInstruments}
                onExploreInstrument={handleExploreInstrument}
                // --- NEW: Pass moods props ---
                moods={moods}
                loadingMoods={loadingMoods}
                onExploreMood={handleExploreMood}
                songs={songs}
                genres={genres}
                subGenres={subGenres}
                favouriteSongs={favouriteSongs}
                currentPlayingSong={currentPlayingSong}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onToggleFavourite={handleToggleFavourite}
                onDownload={handleDownload}
                formatTime={formatTime}
                currentUser={currentUser}
                autoScrollTabs={autoScrollTabs}
                clearAutoScrollTabs={clearAutoScrollTabs}
            />
          </>
        );
    }
  };

  // URL → state sync effect
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') {
      // Skip one-time reset when transitioning from /search to a specific view.
      if (suppressHomeResetRef.current) {
        suppressHomeResetRef.current = false; // consume the flag
        return; // do NOT reset to "For You" — let navigateTo(...) from explore run
      }
      setCurrentPage('main');
      setActiveTab('home');
      setShowSearchPage(false);
      setSearchTerm('');
      setNavigationHistory([initialNavigationState]);
    } else if (path === '/login') {
      setCurrentPage('login');
      setActiveTab('login');
      setShowSearchPage(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/premium') {
      setCurrentPage('premium');
      setActiveTab('premium');
      setShowSearchPage(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/ai') {
      // Ensure AI tab is active, search hidden, and scroll to top
      setCurrentPage('ai');
      setActiveTab('ai');
      setShowSearchPage(false);
      setSearchTerm('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Dedicated effect for /search deep link handling
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search || '');
      const q = params.get('q') || '';
      setCurrentPage('main');
      setActiveTab('home');
      setShowSearchPage(true);
      setCurrentSearchQuery(q);
      setSearchTerm(q);
      setIsSearchFocused(false);
      setActiveSuggestionIndex(-1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.search]);

  // Autoplay when a shared link is opened: check ?track=<id> once songs are loaded
  useEffect(() => {
    // Only run once when songs are ready
    if (initialTrackAutoplayRef.current) return;
    if (!songsLoaded || !Array.isArray(songs) || songs.length === 0) return;

    try {
      const url = new URL(window.location.href);
      const trackId = url.searchParams.get('track');
      if (trackId) {
        const s = songs.find(x => String(x?._id) === String(trackId));
        if (s) {
          // Open the player and autoplay (YouTube-like behaviour)
          // Do not force navigation; keep the current page and just play.
          playSong(s);
          initialTrackAutoplayRef.current = true;
        }
      }
    } catch {}
  }, [songsLoaded, songs, playSong]);

  return (
    <Routes>
      <Route path="/faq" element={<FAQ />} />
      <Route path="/about" element={<React.Fragment><AboutUs /></React.Fragment>} />
      <Route path="/privacy-policy" element={<React.Fragment><PrivacyPolicyPage /></React.Fragment>} />
      <Route path="/terms" element={<React.Fragment><TermsOfService /></React.Fragment>} />
      <Route path="/license" element={<React.Fragment><LicenseAgreement /></React.Fragment>} />
      <Route path="/license-verification" element={<LicenseVerificationPage />} />
      <Route
        path="*"
        element={
          <>
            <div className={currentPage === 'premium' ? 'app-wrapper premium-background' : 'app-wrapper'}>
              <Header
                loadingHeader={loadingHeader}
                currentPage={currentPage} activeTab={activeTab}
                searchInputRef={searchInputRef} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                handleSearchKeyDown={handleSearchKeyDown} handleSearchSubmit={handleSearchSubmit}
                isSearchFocused={isSearchFocused} setIsSearchFocused={setIsSearchFocused}
                handleSearchFocus={handleSearchFocus}
                quickSearchOverlayRef={quickSearchOverlayRef}
                filteredSuggestions={filteredSuggestions}
                quickSearchSuggestions={quickSearchSuggestions}
                handleSuggestionClick={handleSuggestionClick}
                activeSuggestionIndex={activeSuggestionIndex}
                showSearchPage={showSearchPage}
                handleNavLinkClick={handleNavLinkClick}
                currentUser={currentUser}
                onLogout={handleLogout}
                setCurrentUser={setCurrentUser}
                onUserUpdate={refreshUserData} // ✅ Pass the refresh function
              />
              <GlobalLoaderOverlay />
              {/* Notification component with yellow theme */}
              <Notification 
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
              />
              <LicenseModal
                open={licenseModalOpen}
                onClose={() => setLicenseModalOpen(false)}
                data={licenseModalData}
              />
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={renderPage()} />
                <Route
                  path="/search"
                  element={
                    <SearchPage
                      searchQuery={currentSearchQuery}
                      songs={songs}
                      genres={genres}
                      subGenres={subGenres}
                      onBack={handleBackToMainApp}
                      handlePlayPause={handlePlayPause}
                      currentPlayingSong={currentPlayingSong}
                      isPlaying={isPlaying}
                      formatTime={formatTime}
                      favouriteSongs={favouriteSongs}
                      handleToggleFavourite={handleToggleFavourite}
                      handleDownload={handleDownload}
                      loadingSongs={loadingSongs}
                      onExplore={handleExploreFromSearch}
                      currentUser={currentUser}
                      currentSongId={currentSongId}
                      instruments={instruments}
                      moods={moods}
                    />
                  }
                />
                <Route
                  path="/ai"
                  element={
                    <AssistantPage
                      currentUser={currentUser}
                      handlePlayPause={handlePlayPause}
                      currentPlayingSong={currentPlayingSong}
                      isPlaying={isPlaying}
                      formatTime={formatTime}
                      favouriteSongs={favouriteSongs}
                      handleToggleFavourite={handleToggleFavourite}
                      handleDownload={handleDownload}
                      currentSongId={currentSongId}
                      onExplore={handleExploreFromSearch}   // NEW: use the same handler as Search
                    />
                  }
                />
                <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/premium" element={<PremiumPage currentUser={currentUser} onPremiumAccess={handlePremiumAccess} />} />
                <Route path="/feedback" element={<FeedbackPage currentUser={currentUser} />} />
                {/* Keep any other routes here unchanged */}
                <Route path="/team" element={<TeamPage />} />
              </Routes>

              <GoToTopButton
                show={currentPage === 'main' && (activeTab === 'home' || activeTab === 'favourites') && !showSearchPage}
                onGoTop={() => scrollToSection('content-tabs-section')}
                bottomOffset={isPlayerVisible ? 96 : 24}
                showOnMobile={true}
              />
              <MusicPlayer
                isPlayerVisible={isPlayerVisible}
                toggleMute={toggleMute} handleClosePlayer={handleClosePlayer}
                handleSeek={handleSeek} handleVolumeChange={handleVolumeChange} formatTime={formatTime}
                handlePreviousSong={handlePreviousSong} handlePlayPause={handlePlayPause} handleNextSong={handleNextSong}
                progress={progress} duration={duration} currentTime={currentTime} volume={volume}
                loadingSongs={loadingSongs} currentPlayingSong={currentPlayingSong} isPlaying={isPlaying}
                // --- NEW PROPS ---
                handleToggleFavourite={handleToggleFavourite}
                handleDownload={handleDownload}
                favouriteSongs={favouriteSongs}
                currentUser={currentUser}
                // ADD:
                isAudioLoading={isAudioLoading}
              />
              <Footer
                onPremiumClick={() => {
                  flashLoader(550);
                  setCurrentPage('premium');
                  setActiveTab('premium');
                  navigate('/premium');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </>
        }
      />
    </Routes>
  );
}

export default App;
