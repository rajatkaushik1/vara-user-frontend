// src/components/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import HeaderSkeleton from '../skeletons/HeaderSkeleton';
import './ProfileDropdown.css'; 
import './Header.css';
import logo from '/logo.png'; 
import premiumLotusIcon from '/premium-lotus-icon.png';
import { API_BASE_URL } from '../config.js';
import DownloadBadge from './DownloadBadge';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

// --- ADD: Bold TickIcon ---
const TickIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
    className={`tick-icon ${props.className || ''}`}
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ProfileDropdown = ({ currentUser, onLogout, setCurrentUser }) => {
  const [youtubeLink, setYoutubeLink] = useState(currentUser?.youtube_channel_link || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const normalizeProfileImageUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    let s = url.trim();

    // Ensure https://
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s.replace(/^\/+/, '');

    try {
      const u = new URL(s);

      // Google avatar domain tweak: ensure a sensible size param
      if (u.hostname.includes('googleusercontent.com')) {
        // If no size param present, add one
        if (!u.search || (!u.searchParams.has('sz') && !/s\d+-c/.test(u.search))) {
          u.searchParams.set('sz', '128');
        }
        return u.toString();
      }

      // Any other host — just return normalized URL
      return u.toString();
    } catch {
      return null;
    }
  };

  // Compute normalized profile image URL
  const profileImageUrl = normalizeProfileImageUrl(currentUser?.picture);

  // ✅ FIX: Better YouTube username extraction with debugging
  const extractYouTubeUsername = (url) => {
    console.log('Original URL:', url); // Debug log
    
    try {
      // Handle URLs without protocol
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
      }
      
      const urlObj = new URL(fullUrl);
      console.log('Parsed URL pathname:', urlObj.pathname); // Debug log
      
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        
        // Handle @username format (most common now)
        if (urlObj.pathname.includes('/@')) {
          const username = urlObj.pathname.split('/@')[1].split('/')[0];
          const result = `@${username}`;
          console.log('Extracted username:', result); // Debug log
          return result;
        }
        
        // Handle /c/ format
        if (urlObj.pathname.includes('/c/')) {
          const channelName = urlObj.pathname.split('/c/')[1].split('/')[0];
          const result = `@${channelName}`;
          console.log('Extracted from /c/:', result); // Debug log
          return result;
        }
        
        // Handle /user/ format  
        if (urlObj.pathname.includes('/user/')) {
          const userName = urlObj.pathname.split('/user/')[1].split('/')[0];
          const result = `@${userName}`;
          console.log('Extracted from /user/:', result); // Debug log
          return result;
        }
        
        // Handle /channel/ format - extract and shorten
        if (urlObj.pathname.includes('/channel/')) {
          const channelId = urlObj.pathname.split('/channel/')[1].split('/')[0];
          const result = `@${channelId.substring(0, 20)}`; // Show first 20 chars
          console.log('Extracted from /channel/:', result); // Debug log
          return result;
        }
        
        console.log('No matching pattern found, using fallback'); // Debug log
        return '@Channel' // Fallback
      }
      
      console.log('Not a YouTube URL'); // Debug log
      return null;
    } catch (error) {
      console.error('Error extracting username:', error); // Debug log
      return null;
    }
  };

  const isValidYouTubeURL = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  };

  const handleAddYouTubeLink = async () => {
    if (youtubeLink.trim() === '') {
      setMessage({ text: '❌ Please enter a YouTube channel link', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      return;
    }

    if (!isValidYouTubeURL(youtubeLink)) {
      setMessage({ text: '❌ YouTube channel link is not valid! Recheck the link.', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const username = extractYouTubeUsername(youtubeLink);
      
      const authBackendUrl = import.meta.env.VITE_REACT_APP_AUTH_BACKEND_URL || 'http://localhost:5000';
      const requestUrl = `${authBackendUrl}/api/user/youtube-link`;
      
      console.log('🔍 Making request to:', requestUrl);
      // ✅ FIX: Send both the original URL and extracted username
      console.log('🔍 Request body:', { 
        youtubeLink: youtubeLink,  // Send original URL for storage
        youtube_channel_link: youtubeLink, 
        youtube_channel_name: username 
      });
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          youtubeLink: youtubeLink,  // ✅ FIX: Send original URL
          youtube_channel_link: youtubeLink,
          youtube_channel_name: username 
        }),
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ YouTube link update result:', result);
        
        // ✅ FIX: Fetch fresh user data instead of using the limited response
        const userResponse = await fetch(`${authBackendUrl}/api/user`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (userResponse.ok) {
          const freshUserData = await userResponse.json();
          console.log('🔄 Fresh user data fetched:', freshUserData);
          setCurrentUser(freshUserData); // Update with complete user data
        } else {
          console.error('❌ Failed to fetch fresh user data');
          // Fallback: just update the YouTube link in current user
          setCurrentUser(prev => ({
            ...prev,
            youtube_channel_link: result.youtube_channel_link
          }));
        }
        
        setIsEditing(false);
        setMessage({ text: '✅ YouTube channel link updated successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Failed to update YouTube link: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setMessage({ text: '❌ Failed to update YouTube link. Please try again.', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage({ text: '', type: '' });
    // ✅ FIX: Try to get original URL first, fallback to stored link
    const originalUrl = currentUser?.youtube_original_url || currentUser?.youtube_channel_link || '';
    setYoutubeLink(originalUrl);
  };

  // FIXED: Better initials generation
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const cleanName = name.trim();
    if (!cleanName) return 'U';
    const names = cleanName.split(' ').filter(n => n.length > 0);
    
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    } else {
      return names[0][0].toUpperCase();
    }
  };

  // FIXED: Get first name only
  const getFirstName = (fullName) => {
    if (!fullName) return 'User';
    return fullName.trim().split(' ')[0];
  };

  // Handle image load events
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageLoadError(false);
    console.log('✅ Profile image loaded successfully');
  };

  const handleImageError = (e) => {
    console.log('❌ Profile image failed to load:', currentUser?.picture);
    setImageLoading(false);
    setImageLoadError(true);
  };

  // Reset image states when user changes
  useEffect(() => {
    setImageLoadError(false);
    setImageLoading(true);
  }, [currentUser?.picture]);

  // Add logout handler for toast + reload
  const handleLogoutAndReload = async () => {
    try {
      if (typeof onLogout === 'function') {
        await onLogout(); // this likely triggers the "Logged out" toast
      }
    } catch (e) {
      console.error('Logout error (ignored):', e);
    } finally {
      // Give the toast time to render before navigating home.
      setTimeout(() => {
        // hard navigation so all state resets and we land on home
        window.location.assign('/');
      }, 1200);
    }
  };

  return (
    <div className="profile-dropdown">
      
      
      {/* User Profile Section */}
      <div className="profile-dropdown-header">
        <div className="profile-picture">
          {profileImageUrl && !imageLoadError ? (
            <img
              src={profileImageUrl}
              alt="Profile"
              className="profile-img"
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              onError={() => {
                // Quietly fall back to initials without console noise
                setImageLoading(false);
                setImageLoadError(true);
              }}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          ) : null}
          
          {/* Show placeholder when: no picture, image error, or image still loading */}
          {!currentUser?.picture || imageLoadError || imageLoading ? (
            <div className="profile-placeholder">
              {getInitials(currentUser?.name)}
            </div>
          ) : null}
        </div>
        
        <div className="profile-info">
          <h3 className="profile-greeting">Hi! {getFirstName(currentUser?.name)}</h3>
          <p className="profile-privacy">We don't share your personal info. Your channel is safe with us.</p>
        </div>
      </div>

      {/* YouTube Channel Section */}
      <div className="youtube-section">
        {currentUser?.youtube_channel_link && !isEditing ? (
          <>
            <div className="youtube-section-header">
              <h4 className="youtube-section-title">Your youtube channel info</h4>
            </div>
            <div className="youtube-link-display">
              <span className="youtube-channel-name">
                {/* ✅ FIX: Use stored channel name if available, otherwise extract */}
                {currentUser.youtube_channel_name || extractYouTubeUsername(currentUser.youtube_original_url || currentUser.youtube_channel_link) || '@Channel'}
              </span>
              <button className="edit-youtube-btn" onClick={handleEditClick} title="Edit YouTube link">
                <PencilIcon />
              </button>
            </div>
          </>
        ) : (
          <div className="youtube-input-section">
            <input
              type="text"
              className="youtube-input"
              placeholder="Link of your youtube channel"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              disabled={isLoading}
            />
            <button 
              className="add-youtube-btn" 
              onClick={handleAddYouTubeLink}
              disabled={isLoading}
            >
              {isLoading ? '...' : '+ADD'}
            </button>
          </div>
        )}
        
        {/* Message Display */}
        {message.text && (
          <div className={`youtube-message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div> {/* end of .youtube-section */}

      {/* License Verification (centered) */}
      <div className="license-verify-section">
        <a
          href="/license-verification"
          className="license-verify-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Certificate Verification
        </a>
      </div>

      {/* Warning Section */}
      {!currentUser?.is_premium && (
        <div className="warning-section">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <p><strong>Important:</strong> You can only use free Vara songs on your YouTube channel — and only for one video per song.</p>
              <p>Using songs without a valid Vara Certificate ID may lead to video flags or copyright issues.</p>
              <p className="premium-suggestion">✅ To use music safely and legally, get Vara Premium.</p>
              <a
                href="/terms"
                className="learn-more-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                📖 Learn more
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Logout Section */}
      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogoutAndReload}>
          Logout
        </button>
      </div>
    </div>
  );
};

const Header = ({
  loadingHeader, // NEW: specific header loading state
  currentPage,
  searchInputRef,
  searchTerm,
  setSearchTerm,
  handleSearchKeyDown,
  handleSearchSubmit,
  isSearchFocused,
  setIsSearchFocused,
  handleSearchFocus, // NEW: dedicated search focus handler
  quickSearchOverlayRef,
  filteredSuggestions,
  quickSearchSuggestions,
  handleSuggestionClick,
  activeTab,
  showSearchPage,
  handleNavLinkClick,
  activeSuggestionIndex,
  currentUser,
  onLogout,
  setCurrentUser
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
  // Guard to prevent search bar from bouncing back open after a close
  const closingSearchRef = useRef(false);
  const mobileMenuRef = useRef(null);
  const drawerCloseRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to get initials for avatar
  const getInitialsForAvatar = (nameOrEmail) => {
    const s = (nameOrEmail || '').trim();
    if (!s) return 'U';
    const parts = s.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return s[0].toUpperCase();
  };

  // Minimal safe URL normalizer (kept simple for avatar)
  const safeProfileImg = (url) => {
    if (!url || typeof url !== 'string') return null;
    const s = url.trim();
    if (!s) return null;
    try {
      const u = new URL(s.startsWith('http') ? s : `https://${s}`);
      if (u.hostname.includes('googleusercontent.com') && !u.searchParams.has('sz')) {
        u.searchParams.set('sz', '128');
      }
      return u.toString();
    } catch {
      return null;
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Toggle dropdown visibility
  const toggleProfileDropdown = (e) => {
    e.preventDefault();
    setShowProfileDropdown(!showProfileDropdown);
  };

  // NEW (must be unconditionally declared BEFORE any early return):
  // Close quick search overlay when clicking outside search container or overlay
  useEffect(() => {
    function handleDocumentPointerDown(e) {
      const containerEl = searchInputRef?.current;      // search container ref (already attached)
      const overlayEl = quickSearchOverlayRef?.current; // suggestions overlay ref (already attached)
      const clickedInsideContainer = containerEl && containerEl.contains(e.target);
      const clickedInsideOverlay = overlayEl && overlayEl.contains(e.target);

      // If clicked outside both the input container and the overlay, close the overlay
      if (!clickedInsideContainer && !clickedInsideOverlay) {
        if (typeof setIsSearchFocused === 'function') setIsSearchFocused(false);
        // If the mobile search bar is open, also close and blur it, and guard against races
        if (showMobileSearchBar) {
          setShowMobileSearchBar(false);
          try { if (searchInputRef?.current) searchInputRef.current.blur(); } catch {}
          closingSearchRef.current = true;
          setTimeout(() => { closingSearchRef.current = false; }, 180);
        }
      }
    }

    // Use both mouse and touch for better mobile UX
    document.addEventListener('mousedown', handleDocumentPointerDown);
    document.addEventListener('touchstart', handleDocumentPointerDown, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown);
      document.removeEventListener('touchstart', handleDocumentPointerDown);
    };
  }, [searchInputRef, quickSearchOverlayRef, setIsSearchFocused, showMobileSearchBar]);

  // Keep focus off when the bar closes (safety)
  useEffect(() => {
    if (!showMobileSearchBar) {
      if (typeof setIsSearchFocused === 'function') setIsSearchFocused(false);
      try { if (searchInputRef?.current) searchInputRef.current.blur(); } catch {}
    }
  }, [showMobileSearchBar, setIsSearchFocused]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setShowProfileDropdown(false);
        setIsMobileMenuOpen(false);
        if (typeof setIsSearchFocused === 'function') setIsSearchFocused(false);
        setShowMobileSearchBar(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [setIsSearchFocused]);

  // NEW: Auto-close the mobile search bar when focus/overlay closes
  useEffect(() => {
    if (showMobileSearchBar && !isSearchFocused) {
      setShowMobileSearchBar(false);
    }
  }, [showMobileSearchBar, isSearchFocused]);

  // Auto-close mobile search on Login page
  useEffect(() => {
    if (currentPage === 'login' && showMobileSearchBar) {
      setShowMobileSearchBar(false);
      if (typeof setIsSearchFocused === 'function') setIsSearchFocused(false);
    }
  }, [currentPage, showMobileSearchBar, setIsSearchFocused]);

  // NEW: Ensure focus is reset and input blurred whenever bar closes (prevents re-open race)
  useEffect(() => {
    if (!showMobileSearchBar) {
      // Ensure focus state is off when bar is closed
      if (typeof setIsSearchFocused === 'function') setIsSearchFocused(false);
      try { if (searchInputRef?.current) searchInputRef.current.blur(); } catch {}
    }
  }, [showMobileSearchBar, setIsSearchFocused]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [isMobileMenuOpen]);

  if (loadingHeader) {
    return <HeaderSkeleton />;
  }

  const premiumButtonClass = `premium-button ${currentPage === 'premium' ? 'premium-page-active' : ''}`;
  const headerClass = `header ${currentPage === 'premium' ? 'premium-header' : ''}`;

  // --- ADD: Compute premium active state ---
  const isPremiumActive = (() => {
    if (!currentUser) return false;
    const typeOk = currentUser.subscription_type === 'premium' || currentUser.is_premium === true;
    const expires = currentUser.premium_expires_at ? new Date(currentUser.premium_expires_at) : null;
    const timeOk = !expires || expires > new Date();
    return typeOk && timeOk;
  })();

  // Treat "Favourites" as part of HOME for header highlight
  const isHomeNavActive = (currentPage === 'main') && (activeTab === 'home' || activeTab === 'favourites');

  return (
    <>
      <header className={headerClass}>
        <div className="header-left">
          <img src={logo} alt="VARA Logo" className="logo" onClick={() => handleNavLinkClick('home', 'hero-section')} style={{cursor: 'pointer'}} />
          <DownloadBadge isLoggedIn={!!currentUser} />
        </div>
        <div className="header-right">
          {currentPage !== 'login' && (
            <button
              type="button"
              className="mobile-search-btn"
              aria-label={showMobileSearchBar ? 'Close search' : 'Open search'}
              onClick={() => {
                const willOpen = !showMobileSearchBar;

                // If we just closed, ignore any re-open race for a short time
                if (willOpen && closingSearchRef.current) return;

                setShowMobileSearchBar(willOpen);
                if (typeof setIsSearchFocused === 'function') setIsSearchFocused(willOpen);

                if (willOpen) {
                  // Opening: focus next tick
                  setTimeout(() => {
                    try { if (searchInputRef?.current) searchInputRef.current.focus(); } catch {}
                  }, 0);
                } else {
                  // Closing: blur immediately and activate the closing guard briefly
                  try { if (searchInputRef?.current) searchInputRef.current.blur(); } catch {}
                  closingSearchRef.current = true;
                  setTimeout(() => { closingSearchRef.current = false; }, 180);
                }
              }}
            >
              {showMobileSearchBar ? (
                <span aria-hidden="true" style={{ fontWeight: 900, fontSize: 18, lineHeight: 1 }}>×</span>
              ) : (
                <SearchIcon />
              )}
            </button>
          )}

          <button
            type="button"
            className="hamburger-btn"
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
            aria-controls="vara-mobile-drawer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="hamburger-lines" aria-hidden="true"></span>
          </button>

          {currentPage === 'main' && (
            <div className="search-container" ref={searchInputRef}>
              <input
                type="text"
                className="search-input"
                placeholder="Search for music, genres, mood..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleSearchFocus} // Use the new handler
                onKeyDown={handleSearchKeyDown}
              />
              
              {/* New: clear "X" button (inserted immediately before the existing search button) */}
              {Boolean(searchTerm && String(searchTerm).length > 0) && (
                <button
                  type="button"
                  className="search-clear-button"
                  aria-label="Clear search"
                  title="Clear"
                  onClick={() => {
                    if (typeof setSearchTerm === 'function') setSearchTerm('');
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              )}

              <button className="search-button" onClick={() => handleSearchSubmit()} aria-label="Search">
                <SearchIcon />
              </button>
              {isSearchFocused && (
                <div className="quick-search-overlay" ref={quickSearchOverlayRef}>
                  <button
                    type="button"
                    className="mobile-search-close"
                    aria-label="Close search"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (typeof setIsSearchFocused === 'function') setIsSearchFocused(false);
                      setShowMobileSearchBar(false);
                      try { if (searchInputRef?.current) searchInputRef.current.blur(); } catch {}
                      closingSearchRef.current = true;
                      setTimeout(() => { closingSearchRef.current = false; }, 180);
                    }}
                  >
                    ×
                  </button>
                  <h4 className="quick-search-title">
                    {searchTerm.trim() ? 'Suggestions' : 'Quick Searches'}
                  </h4>
                  <ul className="suggestion-list">
                    {(searchTerm.trim() ? filteredSuggestions : quickSearchSuggestions).map((item, index) => (
                      <li 
                        key={index} 
                        className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`} 
                        onClick={() => handleSuggestionClick(item)}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <nav className="nav-links">
            <a
              href="#"
              className={`nav-link ${isHomeNavActive ? 'active' : ''}`}
              onClick={() => handleNavLinkClick('home', 'hero-section')}
            >
              HOME
            </a>
            <a
              href="/ai"
              className={`nav-link ai-link ${typeof window !== 'undefined' && window.location && window.location.pathname.startsWith('/ai') ? 'active' : ''}`}
              onClick={(e) => {
                window.dispatchEvent(new CustomEvent('vara:loader:flash', { detail: { ms: 550 } }));
                e.preventDefault();
                window.history.pushState({}, '', '/ai');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              AI
            </a>
            {currentUser ? (
              <div className="profile-section" ref={profileRef}>
                {/* Mobile avatar toggle (desktop unaffected; CSS hides this on desktop) */}
                <button
                  type="button"
                  className="mobile-avatar-btn"
                  aria-label="Account menu"
                  onClick={() => setShowProfileDropdown((v) => !v)}
                >
                  {safeProfileImg(currentUser?.picture) ? (
                    <img src={safeProfileImg(currentUser.picture)} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="avatar-initials">
                      {getInitialsForAvatar(currentUser?.name || currentUser?.email || 'U')}
                    </span>
                  )}
                </button>

                <a 
                  href="#" 
                  className={`nav-link profile-link ${activeTab === 'profile' ? 'active' : ''} ${showProfileDropdown ? 'profile-active' : ''}`}
                  onClick={toggleProfileDropdown}
                >
                  PROFILE
                </a>
                {showProfileDropdown && (
                  <ProfileDropdown 
                    currentUser={currentUser} 
                    onLogout={onLogout}
                    setCurrentUser={setCurrentUser}
                  />
                )}
              </div>
            ) : (
              <div className="profile-section" ref={profileRef}>
                {/* Desktop LOGIN text (hidden on mobile via CSS) */}
                <a
                  href="#"
                  className={`nav-link profile-link ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavLinkClick('login'); }}
                >
                  LOGIN
                </a>
                {/* Mobile-only circular login button (shown via CSS at <= 972px) */}
                <button
                  type="button"
                  className="mobile-login-btn"
                  aria-label="Login"
                  onClick={(e) => { e.preventDefault(); handleNavLinkClick('login'); }}
                  title="Login"
                >
                  {/* Simple user silhouette (keeps bundle small) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
              </div>
            )}
          </nav>

          {/* --- REPLACE PREMIUM BUTTON JSX ONLY --- */}
          <button
            className={`${premiumButtonClass} ${isPremiumActive ? 'premium-active' : ''}`}
            onClick={() => handleNavLinkClick('premium')}
          >
            {/* Left: tick/lotus icon — remains fixed and never moves */}
            <span className="premium-icon-wrap">
              {isPremiumActive ? (
                <TickIcon className="premium-icon" />
              ) : (
                <img src={premiumLotusIcon} alt="Premium Icon" className="premium-icon" />
              )}
            </span>

            {/* Right: swap-area that holds text (default) and lotus row (on hover) */}
            <span className="premium-swap-area">
              {/* Layer 1: label (default) */}
              <span className="premium-text-layer">PREMIUM</span>

              {/* Layer 2: lotus row (visible on hover when premium is active) */}
              {isPremiumActive && (
                <span className="premium-lotus-layer" aria-hidden="true">
                  {/* Use three lotus icons; same size as base lotus/tick area */}
                  <img src={premiumLotusIcon} alt="" className="premium-icon lotus-icon" />
                  <img src={premiumLotusIcon} alt="" className="premium-icon lotus-icon" />
                  <img src={premiumLotusIcon} alt="" className="premium-icon lotus-icon" />
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Mobile Drawer Backdrop */}
        <div
          className={`mobile-drawer-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden={isMobileMenuOpen ? 'false' : 'true'}
        />

        {/* Mobile Drawer Panel */}
        <aside
          id="vara-mobile-drawer"
          className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <div className="drawer-header">
            <div className="drawer-title">
              <img src={logo} alt="VARA" style={{ height: 28, width: 'auto', borderRadius: 6 }} />
              <span>Menu</span>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              ref={drawerCloseRef}
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Drawer content (links & premium only) */}
          <div className="drawer-content">
            {/* HOME (drawer) */}
            <a
              href="#"
              className={`drawer-link ${isHomeNavActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                handleNavLinkClick('home', 'hero-section');
              }}
            >
              HOME
            </a>

            {/* AI (drawer) */}
            <a
              href="/ai"
              className={`drawer-link ${currentPage === 'ai' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('vara:loader:flash', { detail: { ms: 550 } }));
                window.history.pushState({}, '', '/ai');
                window.dispatchEvent(new PopStateEvent('popstate'));
                setIsMobileMenuOpen(false);
              }}
            >
              AI
            </a>

            {/* Premium CTA (drawer) */}
            <button
              type="button"
              className={`${premiumButtonClass} ${isPremiumActive ? 'premium-active' : ''}`}
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleNavLinkClick('premium');
              }}
            >
              <span className="premium-icon-wrap">
                {isPremiumActive ? (
                  <TickIcon className="premium-icon" />
                ) : (
                  <img src={premiumLotusIcon} alt="Premium Icon" className="premium-icon" />
                )}
              </span>
              <span className="premium-swap-area">
                <span className="premium-text-layer">PREMIUM</span>
                {isPremiumActive && (
                  <span className="premium-lotus-layer" aria-hidden="true">
                    <img src={premiumLotusIcon} alt="" className="premium-icon lotus-icon" />
                    <img src={premiumLotusIcon} alt="" className="premium-icon lotus-icon" />
                    <img src={premiumLotusIcon} alt="" className="premium-icon lotus-icon" />
                  </span>
                )}
              </span>
            </button>

            {/* Removed LOGIN/PROFILE entries from drawer to keep header-only for auth access */}
          </div>

          {/* Drawer footer: pinned at bottom (sibling to drawer-content) */}
          <div className="drawer-footer">
            <div className="footer-note">
              Made with <span aria-hidden="true">❤️</span> and a little bit of <span aria-hidden="true">🎵</span> magic for creators everywhere.
            </div>
            <div className="footer-copy">
              © 2025 Vara. All rights reserved.
            </div>
          </div>
        </aside>
      </header>

      {showMobileSearchBar && (
        <div className="mobile-search-bar-container">
          <div className="search-container" ref={searchInputRef}>
            <input
              type="text"
              className="search-input"
              placeholder="Search for music, genres, mood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
            />
            {Boolean(searchTerm && String(searchTerm).length > 0) && (
              <button
                type="button"
                className="search-clear-button"
                aria-label="Clear search"
                title="Clear"
                onClick={() => { if (typeof setSearchTerm === 'function') setSearchTerm(''); }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )}
            <button className="search-button" onClick={() => handleSearchSubmit()} aria-label="Search">
              <SearchIcon />
            </button>
            {isSearchFocused && (
              <div className="quick-search-overlay" ref={quickSearchOverlayRef}>
                <h4 className="quick-search-title">
                  {searchTerm.trim() ? 'Suggestions' : 'Quick Searches'}
                </h4>
                <ul className="suggestion-list">
                  {(searchTerm.trim() ? filteredSuggestions : quickSearchSuggestions).map((item, index) => (
                    <li
                      key={index}
                      className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
