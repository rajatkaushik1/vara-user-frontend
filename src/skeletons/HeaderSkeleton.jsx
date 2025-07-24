import React from 'react';

// HeaderSkeleton component to display a placeholder for the header content
function HeaderSkeleton() {
  return (
    // The main header container, mimicking the actual header's structure
    <header className="header">
      <div className="header-left">
        {/* Placeholder for the logo */}
        <div className="skeleton-element skeleton-logo"></div>
      </div>
      <div className="header-right">
        {/* Placeholder for the search container */}
        <div className="search-container skeleton-element">
          <div className="skeleton-element skeleton-input"></div> {/* Input field placeholder */}
          <div className="skeleton-element skeleton-button"></div> {/* Search button placeholder */}
        </div>
        {/* Placeholder for navigation links */}
        <nav className="nav-links">
          {/* Individual nav link placeholders */}
          <div className="skeleton-element skeleton-nav-link"></div>
          <div className="skeleton-element skeleton-nav-link"></div>
          <div className="skeleton-element skeleton-nav-link"></div>
        </nav>
        {/* Placeholder for the premium button */}
        <div className="skeleton-element skeleton-premium-button"></div>
      </div>
    </header>
  );
}

export default HeaderSkeleton;
