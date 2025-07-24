// src/App.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { API_BASE_URL } from './config';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MusicContent from './components/MusicContent';
import MusicPlayer from './components/MusicPlayer';
import Footer from './components/Footer';
import SearchPage from './SearchPage';
import LoginPage from './LoginPage';
import PremiumPage from './PremiumPage';

function App() {
  // All state declarations remain the same
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState('main');
  const [searchTerm, setSearchTerm] = useState('');
  const [genres, setGenres] = useState([]);
  const [subGenres, setSubGenres] = useState([]);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [quickSearchSuggestions, setQuickSearchSuggestions] = useState([
    "vlog", "happy music", "documentary", "food", "finance", "tech", "comedy"
  ]);
  const searchInputRef = useRef(null);
  const quickSearchOverlayRef = useRef(null);
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [selectedGenreForSubgenres, setSelectedGenreForSubgenres] = useState(null);
  const [selectedSubgenreForSongs, setSelectedSubgenreForSongs] = useState(null);
  const [displayedSubgenreTitle, setDisplayedSubgenreTitle] = useState(null);
  const [displayedGenreTitle, setDisplayedGenreTitle] = useState(null);
  const [favouriteSongs, setFavouriteSongs] = useState(new Set());
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingContentTabs, setLoadingContentTabs] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const audioRef = useRef(new Audio());
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [searchHistory, setSearchHistory] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);

  // All other functions from your file remain here...
  const filteredSuggestions = useMemo(() => {
    if (searchTerm.trim() === '') return [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchedSongTitles = songs.filter(s => s.title.toLowerCase().includes(lowerCaseSearchTerm)).map(s => s.title);
    const matchedGenreNames = genres.filter(g => g.name.toLowerCase().includes(lowerCaseSearchTerm)).map(g => g.name);
    const matchedSubGenreNames = subGenres.filter(sg => sg.name.toLowerCase().includes(lowerCaseSearchTerm)).map(sg => sg.name);
    const allSuggestions = [...new Set([...matchedSongTitles, ...matchedGenreNames, ...matchedSubGenreNames])];
    return allSuggestions.slice(0, 10);
  }, [searchTerm, songs, genres, subGenres]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target) &&
          quickSearchOverlayRef.current && !quickSearchOverlayRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- FIX FOR PROBLEM 3: SCROLL TO TOP ---
  const handleSearchSubmit = useCallback((queryToSearch = searchTerm) => {
    if (queryToSearch.trim() !== '') {
      window.scrollTo(0, 0); // Scroll to top
      setCurrentSearchQuery(queryToSearch.trim());
      setShowSearchPage(true);
      setActiveTab('home'); // Keep home active conceptually for search
      setCurrentPage('main'); // Stay on the main page contextually
      setSelectedGenreForSubgenres(null);
      setSelectedSubgenreForSongs(null);
      setDisplayedSubgenreTitle(null);
      setDisplayedGenreTitle(null);
      setIsSearchFocused(false);
      setSearchHistory(null);
    }
  }, [searchTerm]);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  }, [handleSearchSubmit]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchTerm(suggestion);
    handleSearchSubmit(suggestion);
  }, [handleSearchSubmit]);

  const handleBackToMainApp = useCallback(() => {
    setShowSearchPage(false);
    setCurrentSearchQuery('');
    setSearchTerm('');
    setSearchHistory(null);
    setActiveTab('home'); // Return to home tab
  }, []);
  
  // All music player functions (handlePlayPause, etc.) remain unchanged...
  const handlePlayPause = useCallback((songToPlay = currentPlayingSong) => {
    const audio = audioRef.current;
    let currentSongList = [];
    if (showSearchPage) {
      currentSongList = songs.filter(song => {
        const query = currentSearchQuery.toLowerCase();
        return song.title.toLowerCase().includes(query) ||
               (song.genres && song.genres.some(g => g.name.toLowerCase().includes(query))) ||
               (song.subGenres && song.subGenres.some(sg => sg.name.toLowerCase().includes(query)));
      });
    } else if (selectedSubgenreForSongs) {
      currentSongList = songs.filter(song => song.subGenres.some(sg => sg._id === selectedSubgenreForSongs));
    } else if (activeTab === 'freesongs') {
      currentSongList = songs.filter(song => song.collectionType === 'free');
    } else if (activeTab === 'favourites') {
      currentSongList = songs.filter(song => favouriteSongs.has(song._id));
    } else {
      currentSongList = songs;
    }

    if (!songToPlay && !audio.src && currentSongList.length > 0) {
      songToPlay = currentSongList[0];
    }

    if (songToPlay) {
      setIsPlayerVisible(true);
      if (audio.src !== songToPlay.audioUrl) {
        setCurrentPlayingSong(songToPlay);
        audio.src = songToPlay.audioUrl;
        audio.play().then(() => setIsPlaying(true)).catch(e => console.error("Error playing new song:", e));
      } else if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(e => console.error("Error resuming song:", e));
      }
    } else if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentPlayingSong, songs, isPlaying, showSearchPage, currentSearchQuery, selectedSubgenreForSongs, activeTab, favouriteSongs]);

  const handleNextSong = useCallback(() => {
    if (!currentPlayingSong || songs.length === 0) return;
    let currentSongList = [];
    if (showSearchPage) {
      currentSongList = songs.filter(song => {
        const query = currentSearchQuery.toLowerCase();
        return song.title.toLowerCase().includes(query) || (song.genres && song.genres.some(g => g.name.toLowerCase().includes(query))) || (song.subGenres && song.subGenres.some(sg => sg.name.toLowerCase().includes(query)));
      });
    } else if (selectedSubgenreForSongs) {
      currentSongList = songs.filter(song => song.subGenres.some(sg => sg._id === selectedSubgenreForSongs));
    } else if (activeTab === 'freesongs') {
      currentSongList = songs.filter(song => song.collectionType === 'free');
    } else if (activeTab === 'favourites') {
      currentSongList = songs.filter(song => favouriteSongs.has(song._id));
    } else {
      currentSongList = songs;
    }
    if (currentSongList.length === 0) return;
    const currentIndex = currentSongList.findIndex(song => song._id === currentPlayingSong._id);
    const nextIndex = (currentIndex + 1) % currentSongList.length;
    handlePlayPause(currentSongList[nextIndex]);
  }, [currentPlayingSong, songs, handlePlayPause, showSearchPage, currentSearchQuery, selectedSubgenreForSongs, activeTab, favouriteSongs]);

  const handlePreviousSong = useCallback(() => {
    if (!currentPlayingSong || songs.length === 0) return;
    let currentSongList = [];
    if (showSearchPage) {
      currentSongList = songs.filter(song => {
        const query = currentSearchQuery.toLowerCase();
        return song.title.toLowerCase().includes(query) || (song.genres && song.genres.some(g => g.name.toLowerCase().includes(query))) || (song.subGenres && song.subGenres.some(sg => sg.name.toLowerCase().includes(query)));
      });
    } else if (selectedSubgenreForSongs) {
      currentSongList = songs.filter(song => song.subGenres.some(sg => sg._id === selectedSubgenreForSongs));
    } else if (activeTab === 'freesongs') {
      currentSongList = songs.filter(song => song.collectionType === 'free');
    } else if (activeTab === 'favourites') {
      currentSongList = songs.filter(song => favouriteSongs.has(song._id));
    } else {
      currentSongList = songs;
    }
    if (currentSongList.length === 0) return;
    const currentIndex = currentSongList.findIndex(song => song._id === currentPlayingSong._id);
    const prevIndex = (currentIndex - 1 + currentSongList.length) % currentSongList.length;
    handlePlayPause(currentSongList[prevIndex]);
  }, [currentPlayingSong, songs, handlePlayPause, showSearchPage, currentSearchQuery, selectedSubgenreForSongs, activeTab, favouriteSongs]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    handleNextSong();
  }, [handleNextSong]);

  const fetchData = useCallback(async () => {
    setError(null);
    setLoadingInitial(true);
    setLoadingContentTabs(true);
    setLoadingSongs(true);
    try {
      const [genresRes, subGenresRes, songsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/genres`),
        fetch(`${API_BASE_URL}/api/subgenres`),
        fetch(`${API_BASE_URL}/api/songs`)
      ]);
      const genresData = await genresRes.json();
      const subGenresData = await subGenresRes.json();
      const songsData = await songsRes.json();
      if (!genresRes.ok || !subGenresRes.ok || !songsRes.ok) throw new Error('Failed to fetch initial data.');
      setGenres(genresData);
      setSubGenres(subGenresData);
      setSongs(songsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoadingInitial(false);
      setLoadingContentTabs(false);
      setLoadingSongs(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const audio = audioRef.current;
    const setAudioData = () => {
      setDuration(audio.duration);
      setProgress(0);
      setCurrentTime(0);
    };
    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.volume = volume;
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume, handleEnded]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
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
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setIsPlayerVisible(false);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleToggleFavourite = useCallback((songId) => {
    setFavouriteSongs(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(songId)) newFavs.delete(songId);
      else newFavs.add(songId);
      return newFavs;
    });
  }, []);

  const handleDownload = useCallback((songUrl, songTitle) => {
    console.log(`Download: ${songTitle} from ${songUrl}`);
  }, []);
  
  // --- FIX FOR PROBLEM 3: SCROLL TO TOP ---
  const handleNavLinkClick = useCallback((tabName, sectionId) => {
    window.scrollTo(0, 0); // Scroll to top on any main navigation
    if (tabName === 'login' || tabName === 'premium') {
      setCurrentPage(tabName);
      setActiveTab(tabName);
      setShowSearchPage(false);
      setSelectedGenreForSubgenres(null);
      setSelectedSubgenreForSongs(null);
      return;
    }

    setCurrentPage('main');
    setActiveTab(tabName);
    setSelectedGenreForSubgenres(null);
    setSelectedSubgenreForSongs(null);
    setDisplayedSubgenreTitle(null);
    setDisplayedGenreTitle(null);
    setShowSearchPage(false);
    setCurrentSearchQuery('');
    setSearchTerm('');
    setIsSearchFocused(false);
    setSearchHistory(null);
    
    if (sectionId) {
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          window.scrollTo({ top: section.offsetTop - headerHeight, behavior: 'smooth' });
        }
      }, 0);
    }
  }, []);

  const handleExploreGenre = useCallback((genreId, origin = 'main') => {
    const genre = genres.find(g => g._id === genreId);
    if (genre) {
      if (origin === 'search') setSearchHistory(currentSearchQuery);
      else setSearchHistory(null);
      setSelectedGenreForSubgenres(genreId);
      setSelectedSubgenreForSongs(null);
      setDisplayedSubgenreTitle(null);
      setDisplayedGenreTitle(genre.name);
      setActiveTab('genres'); // Set active tab to genres
      setShowSearchPage(false);
      const section = document.getElementById('content-tabs-section');
      if (section) {
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          window.scrollTo({ top: section.offsetTop - headerHeight, behavior: 'smooth' });
      }
    }
  }, [genres, currentSearchQuery]);

  const handleExploreSubgenre = useCallback((subgenreId, origin = 'main') => {
    const subgenre = subGenres.find(sg => sg._id === subgenreId);
    if (subgenre) {
      if (origin === 'search') setSearchHistory(currentSearchQuery);
      else setSearchHistory(null);
      setSelectedSubgenreForSongs(subgenreId);
      setDisplayedSubgenreTitle(subgenre.name);
      // Keep the parent genre selected so we can go back to it
      if (subgenre.genre) {
        setSelectedGenreForSubgenres(subgenre.genre._id);
        setDisplayedGenreTitle(subgenre.genre.name);
      }
      setActiveTab('subgenres');
      setShowSearchPage(false);
      const section = document.getElementById('content-tabs-section');
      if (section) {
          const header = document.querySelector('.header');
          const headerHeight = header ? header.offsetHeight : 0;
          window.scrollTo({ top: section.offsetTop - headerHeight, behavior: 'smooth' });
      }
    }
  }, [subGenres, currentSearchQuery]);

  // --- FIX FOR PROBLEMS 1 & 2: BACK BUTTON LOGIC ---
  const handleBackButtonClick = useCallback(() => {
    // If we are viewing songs of a sub-genre...
    if (selectedSubgenreForSongs) {
      // ...go back to the list of sub-genres.
      setSelectedSubgenreForSongs(null);
      setDisplayedSubgenreTitle(null);
      // The parent genre title is already set, so it will show correctly.
      setActiveTab('genres'); // The view will show sub-genres for the selected genre
    } 
    // Else, if we are viewing sub-genres of a genre...
    else if (selectedGenreForSubgenres) {
      // ...go back to the main list of all genres.
      setSelectedGenreForSubgenres(null);
      setDisplayedGenreTitle(null);
      setActiveTab('genres');
    }
  }, [selectedSubgenreForSongs, selectedGenreForSubgenres]);
  
  const mainContentFilteredSongs = useMemo(() => songs.filter(song => {
    if (activeTab === 'home') return true;
    if (activeTab === 'freesongs') return song.collectionType === 'free';
    if (activeTab === 'favourites') return favouriteSongs.has(song._id);
    return false;
  }), [songs, activeTab, favouriteSongs]);

  const subgenresForSelectedGenre = useMemo(() => selectedGenreForSubgenres
    ? subGenres.filter(sg => sg.genre && sg.genre._id === selectedGenreForSubgenres)
    : [], [subGenres, selectedGenreForSubgenres]);

  const songsForSelectedSubgenre = useMemo(() => selectedSubgenreForSongs
    ? songs.filter(song => song.subGenres.some(sg => sg._id === selectedSubgenreForSongs))
    : [], [songs, selectedSubgenreForSongs]);
  
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'premium':
        return <PremiumPage />;
      case 'main':
      default:
        return showSearchPage ? (
          <SearchPage {...{searchQuery: currentSearchQuery, songs, genres, subGenres, onBack: handleBackToMainApp, handlePlayPause, currentPlayingSong, isPlaying, formatTime, favouriteSongs, handleToggleFavourite, handleDownload, loadingSongs, handleExploreGenre, handleExploreSubgenre}} />
        ) : (
          <>
            <HeroSection loadingInitial={loadingInitial} handleNavLinkClick={handleNavLinkClick} />
            <MusicContent {...{loadingContentTabs, activeTab, setActiveTab, setSelectedGenreForSubgenres, setSelectedSubgenreForSongs, setDisplayedSubgenreTitle, setDisplayedGenreTitle, selectedGenreForSubgenres, selectedSubgenreForSongs, loadingSongs, handleBackButtonClick, displayedGenreTitle, displayedSubgenreTitle, error, songsForSelectedSubgenre, handleExploreGenre, handleExploreSubgenre, handlePlayPause, currentPlayingSong, isPlaying, formatTime, favouriteSongs, handleToggleFavourite, handleDownload, subgenresForSelectedGenre, genres, subGenres, mainContentFilteredSongs}} />
          </>
        );
    }
  };

  return (
    <div className={currentPage === 'premium' ? 'app-wrapper premium-background' : 'app-wrapper'}>
      <Header {...{loadingInitial, currentPage, searchInputRef, searchTerm, setSearchTerm, handleSearchKeyDown, handleSearchSubmit, isSearchFocused, setIsSearchFocused, quickSearchOverlayRef, filteredSuggestions, quickSearchSuggestions, handleSuggestionClick, activeTab, showSearchPage, handleNavLinkClick}} />
      <main>
        {renderPage()}
      </main>
      {isPlayerVisible && (
        <MusicPlayer {...{loadingSongs, currentPlayingSong, isPlaying, progress, duration, currentTime, volume, handlePreviousSong, handlePlayPause, handleNextSong, handleSeek, handleVolumeChange, formatTime, toggleMute, handleClosePlayer}} />
      )}
      <Footer />
    </div>
  );
}

export default App;
