// src/components/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import HeaderSkeleton from '../skeletons/HeaderSkeleton';
import './ProfileDropdown.css'; 
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

const ProfileDropdown = ({ currentUser, onLogout, setCurrentUser }) => {
  const [youtubeLink, setYoutubeLink] = useState(currentUser?.youtube_channel_link || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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
        return '@Channel'; // Fallback
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

  return (
    <div className="profile-dropdown">
      
      
      {/* User Profile Section */}
      <div className="profile-dropdown-header">
        <div className="profile-picture">
          {currentUser?.picture && !imageLoadError ? (
            <img 
              src={currentUser.picture} 
              alt="Profile" 
              className="profile-img"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                display: imageLoading ? 'none' : 'block'
              }}
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
          certificate Verification
        </a>
      </div>

      {/* Warning Section */}
      {!currentUser?.is_premium && (
        <div className="warning-section">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <p><strong>Important:</strong> You can only use free Vara songs on your YouTube channel — and only for one video per song.</p>
              <p>Using songs without a valid Vara certificate may lead to video flags or copyright issues.</p>
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
        <button className="logout-btn" onClick={onLogout}>
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

  if (loadingHeader) {
    return <HeaderSkeleton />;
  }

  const premiumButtonClass = `premium-button ${currentPage === 'premium' ? 'premium-page-active' : ''}`;
  const headerClass = `header ${currentPage === 'premium' ? 'premium-header' : ''}`;

  return (
    <header className={headerClass}>
      <div className="header-left">
        <img src={logo} alt="VARA Logo" className="logo" onClick={() => handleNavLinkClick('home', 'hero-section')} style={{cursor: 'pointer'}} />
        <DownloadBadge />
      </div>
      <div className="header-right">
        
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
            <button className="search-button" onClick={() => handleSearchSubmit()} aria-label="Search">
              <SearchIcon />
            </button>
            {isSearchFocused && (
              <div className="quick-search-overlay" ref={quickSearchOverlayRef}>
                <h4 className="quick-search-title">
                  {searchTerm.trim() ? 'Suggestions' : 'Quick Searches'}
                </h4>
                <ul className="suggestion-list">
                  {(searchTerm.trim() ? filteredSuggestions : quickSearchSuggestions).length > 0 ? (
                    (searchTerm.trim() ? filteredSuggestions : quickSearchSuggestions).map((item, index) => (
                      <li 
                        key={index} 
                        className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`} 
                        onClick={() => handleSuggestionClick(item)}
                      >
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="suggestion-item no-results">No results found.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <nav className="nav-links">
          <a href="#" className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavLinkClick('home', 'hero-section')}>HOME</a>
          <a href="#" className={`nav-link ${activeTab === 'favourites' ? 'active' : ''}`} onClick={() => handleNavLinkClick('favourites')}>FAVOURITES</a>
          
          {/* Profile Section with Click Toggle */}
          {currentUser ? (
            <div className="profile-section" ref={profileRef}>
              <a 
                href="#" 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''} ${showProfileDropdown ? 'profile-active' : ''}`}
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
            <a href="#" className={`nav-link ${activeTab === 'login' ? 'active' : ''}`} onClick={() => handleNavLinkClick('login')}>LOGIN</a>
          )}
        </nav>

        <button className={premiumButtonClass} onClick={() => handleNavLinkClick('premium')}>
          <img src={premiumLotusIcon} alt="Premium Icon" className="premium-icon" />
          PREMIUM
        </button>
      </div>
    </header>
  );
};

export default Header;