import React from 'react';

// GenreCardSkeleton component to display a placeholder for a genre/subgenre card
function GenreCardSkeleton() {
  return (
    // The main genre card container
    <div className="genre-card">
      {/* Placeholder for the genre image */}
      <div className="skeleton-element skeleton-image skeleton-genre-image"></div>
      {/* Placeholder for the genre name */}
      <div className="skeleton-element skeleton-text-line skeleton-text-medium"></div>
      {/* Placeholder for the genre description */}
      <div className="genre-card-description-wrapper">
        <div className="skeleton-element skeleton-text-line skeleton-text-long"></div>
        <div className="skeleton-element skeleton-text-line skeleton-text-short"></div>
      </div>
      {/* Placeholder for the explore button */}
      <div className="skeleton-element skeleton-button"></div>
    </div>
  );
}

export default GenreCardSkeleton;
