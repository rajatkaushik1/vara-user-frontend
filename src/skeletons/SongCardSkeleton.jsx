import React from 'react';

export default function SongCardSkeleton() {
  return (
    // IMPORTANT: This root element must be the .song-card itself.
    <div className="song-card">
      {/* Image block (match real markup) */}
      <div className="song-image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
        {/* Image placeholder: uses sizes from App.css (.skeleton-song-image) */}
        <div className="skeleton-element skeleton-image skeleton-song-image" />

        {/* Keep play button placeholder for layout balance */}
        <div
          className="cover-play-button skeleton-play-button"
          aria-hidden="true"
          style={{ position: 'absolute', left: 10, bottom: 10 }}
        />
      </div>

      {/* Text + pills + actions (match real markup) */}
      <div className="song-text-and-button-wrapper">
        <div className="song-card-info">
          {/* Title line */}
          <div className="skeleton-element skeleton-text-line skeleton-text-short" />

          {/* Pills area: a few pill placeholders to keep height consistent */}
          <div className="genre-scroll-wrapper">
            <div className="genre-pill-container">
              <div className="skeleton-element skeleton-pill" />
              <div className="skeleton-element skeleton-pill" />
              <div className="skeleton-element skeleton-pill" />
            </div>
            <div className="subgenre-pill-container">
              <div className="skeleton-element skeleton-pill" />
              <div className="skeleton-element skeleton-pill" />
            </div>
          </div>
        </div>

        {/* Bottom metadata/actions area (match real layout so height is right) */}
        <div className="song-card-bottom-row_final">
          <div className="metadata-grid">
            <div className="card-row">
              <div className="card-column left">
                <div className="skeleton-element skeleton-text-line" style={{ width: 40 }} />
              </div>
              <div className="card-column center">
                <div className="skeleton-element skeleton-control-button" />
              </div>
              <div className="card-column right">
                <div className="skeleton-element skeleton-text-line" style={{ width: 52 }} />
              </div>
            </div>

            <div className="card-row">
              <div className="card-column left">
                <div className="skeleton-element skeleton-text-line" style={{ width: 48 }} />
              </div>
              <div className="card-column center">
                <div className="skeleton-element skeleton-control-button" />
              </div>
              <div className="card-column right">
                <div className="skeleton-element skeleton-play-button" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

