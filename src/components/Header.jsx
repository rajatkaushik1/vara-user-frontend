// src/components/Header.jsx

import React from 'react';
import HeaderSkeleton from '../skeletons/HeaderSkeleton';
import logo from '/logo.png'; 
import premiumLotusIcon from '/premium-lotus-icon.png';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

const Header = ({
  loadingInitial,
  currentPage,
  searchInputRef,
  searchTerm,
  setSearchTerm,
  handleSearchKeyDown,
  handleSearchSubmit,
  isSearchFocused,
  setIsSearchFocused,
  quickSearchOverlayRef,
  filteredSuggestions,
  quickSearchSuggestions,
  handleSuggestionClick,
  activeTab,
  showSearchPage,
  handleNavLinkClick
}) => {
  if (loadingInitial) {
    return <HeaderSkeleton />;
  }

  const premiumButtonClass = `premium-button ${currentPage === 'premium' ? 'premium-page-active' : ''}`;
  const headerClass = `header ${currentPage === 'premium' ? 'premium-header' : ''}`;

  // --- FIX FOR PROBLEM 4: HOME LINK DESELECTION ---
  // The HOME link is considered active if we are on the main page view and not in a search result.
  const isHomeActive = currentPage === 'main' && !showSearchPage;

  return (
    <header className={headerClass}>
      <div className="header-left">
        <img src={logo} alt="VARA Logo" className="logo" />
      </div>
      <div className="header-right">
        
        {currentPage !== 'premium' && (
          <div className="search-container" ref={searchInputRef}>
            <input
              type="text"
              className="search-input"
              placeholder="Search for music, genres, mood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
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
                      <li key={index} className="suggestion-item" onClick={() => handleSuggestionClick(item)}>
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
          <a href="#" className={`nav-link ${isHomeActive ? 'active' : ''}`} onClick={() => handleNavLinkClick('home', 'hero-section')}>HOME</a>
          <a href="#" className={`nav-link ${activeTab === 'favourites' ? 'active' : ''}`} onClick={() => handleNavLinkClick('favourites', 'content-tabs-section')}>FAVOURITES</a>
          <a href="#" className={`nav-link ${currentPage === 'login' ? 'active' : ''}`} onClick={() => handleNavLinkClick('login')}>LOGIN</a>
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
