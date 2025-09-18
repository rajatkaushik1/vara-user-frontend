import React from 'react';

function SongCardSkeleton() {
  return (
    <div
      className="song-card search-song-card"
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gridTemplateRows: 'auto auto',
        columnGap: '15px',
        rowGap: '4px',
        alignItems: 'start',
        padding: '25px',
        position: 'relative'
      }}
    >
      {/* Left: cover image placeholder + play overlay placeholder */}
      <div
        className="song-image-wrapper"
        style={{ position: 'relative', display: 'inline-block', gridColumn: 1, gridRow: '1 / -1', alignSelf: 'center' }}
      >
        <div className="skeleton-element skeleton-image skeleton-song-image" />
        <div
          className="skeleton-element skeleton-play-button"
          style={{ position: 'absolute', left: 10, bottom: 10 }}
        />
      </div>

      {/* Top-right: title + pills placeholders */}
      <div className="trending-song-card-info" style={{ gridColumn: 2, gridRow: 1 }}>
        <div
          className="skeleton-element skeleton-text-line"
          style={{ width: '65%', height: 18, borderRadius: 4, margin: '0 0 6px 0' }}
        />
        <div className="trending-genre-scroll-wrapper">
          <div className="trending-genre-pill-container">
            <div className="skeleton-element skeleton-pill" />
            <div className="skeleton-element skeleton-pill" />
            <div className="skeleton-element skeleton-pill" />
          </div>
          <div className="trending-subgenre-pill-container">
            <div className="skeleton-element skeleton-pill" />
            <div className="skeleton-element skeleton-pill" />
          </div>
        </div>
      </div>

      {/* Bottom-right: two rows of metadata/actions placeholders */}
      <div className="trending-song-card-bottom-row-final" style={{ gridColumn: 2, gridRow: 2 }}>
        <div className="trending-metadata-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginRight: '10px' }}>
          {/* Row 1 */}
          <div className="trending-card-row" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div className="trending-card-column left" style={{ flex: '1 1 33%' }}>
              <div className="skeleton-element" style={{ width: 50, height: 16, borderRadius: 4 }} />
            </div>
            <div className="trending-card-column center" style={{ flex: '1 1 33%', display: 'flex', justifyContent: 'center' }}>
              <div className="skeleton-element skeleton-play-button" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            </div>
            <div className="trending-card-column right" style={{ flex: '1 1 33%', display: 'flex', justifyContent: 'center' }}>
              <div className="skeleton-element" style={{ width: 60, height: 16, borderRadius: 4 }} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="trending-card-row" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div className="trending-card-column left" style={{ flex: '1 1 33%' }}>
              <div className="skeleton-element" style={{ width: 60, height: 16, borderRadius: 4 }} />
            </div>
            <div className="trending-card-column center" style={{ flex: '1 1 33%', display: 'flex', justifyContent: 'center' }}>
              <div className="skeleton-element skeleton-play-button" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            </div>
            <div className="trending-card-column right" style={{ flex: '1 1 33%', display: 'flex', justifyContent: 'center' }}>
              <div className="skeleton-element" style={{ width: 28, height: 28, borderRadius: 6 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SongCardSkeleton;
