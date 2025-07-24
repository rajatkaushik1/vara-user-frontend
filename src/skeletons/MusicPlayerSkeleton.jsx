import React from 'react';

// MusicPlayerSkeleton component to display a placeholder for the music player bar
function MusicPlayerSkeleton() {
  return (
    // The main music player bar container
    <div className="music-player-bar">
      <div className="player-song-info">
        {/* Placeholder for the song image */}
        <div className="skeleton-element skeleton-image skeleton-player-image"></div>
        <div className="player-song-details">
          {/* Placeholder for song title */}
          <div className="skeleton-element skeleton-text-line skeleton-text-short"></div>
          {/* Placeholder for artist name */}
          <div className="skeleton-element skeleton-text-line skeleton-text-extra-short"></div>
        </div>
      </div>

      <div className="player-controls">
        {/* Placeholders for control buttons */}
        <div className="skeleton-element skeleton-control-button"></div>
        <div className="skeleton-element skeleton-play-pause-button"></div>
        <div className="skeleton-element skeleton-control-button"></div>
      </div>

      <div className="player-progress">
        {/* Placeholder for time display */}
        <div className="skeleton-element skeleton-text-extra-short"></div>
        {/* Placeholder for progress bar */}
        <div className="skeleton-element skeleton-progress-bar"></div>
        {/* Placeholder for time display */}
        <div className="skeleton-element skeleton-text-extra-short"></div>
      </div>

      <div className="player-volume">
        {/* Placeholder for volume button */}
        <div className="skeleton-element skeleton-control-button"></div>
        {/* Placeholder for volume bar */}
        <div className="skeleton-element skeleton-volume-bar"></div>
      </div>
    </div>
  );
}

export default MusicPlayerSkeleton;
