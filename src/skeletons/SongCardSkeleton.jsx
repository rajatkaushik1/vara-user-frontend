import React from 'react';

// SongCardSkeleton component to display a placeholder for a song card
function SongCardSkeleton() {
  return (
    // The main song card container
    <div className="song-card">
      {/* Placeholder for the song image */}
      <div className="skeleton-element skeleton-image skeleton-song-image"></div>
      <div className="song-text-and-button-wrapper">
        <div className="song-card-info">
          {/* Placeholder for the song title */}
          <div className="skeleton-element skeleton-text-line skeleton-text-short"></div>
          {/* Placeholder for genre/subgenre pills */}
          <div className="genre-scroll-wrapper">
            <div className="genre-pill-container">
              <div className="skeleton-element skeleton-pill"></div>
              <div className="skeleton-element skeleton-pill"></div>
            </div>
            <div className="subgenre-pill-container">
              <div className="skeleton-element skeleton-pill"></div>
              <div className="skeleton-element skeleton-pill"></div>
            </div>
          </div>
        </div>
        <div className="song-card-actions">
          {/* Placeholder for the play button */}
          <div className="skeleton-element skeleton-play-button"></div>
        </div>
      </div>
    </div>
  );
}

export default SongCardSkeleton;
