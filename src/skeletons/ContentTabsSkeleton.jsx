import React from 'react';

// ContentTabsSkeleton component to display placeholders for the content tabs
function ContentTabsSkeleton() {
  return (
    // The main content tabs container
    <div className="content-tabs" id="content-tabs-section">
      {/* Placeholders for individual tab buttons */}
      <div className="skeleton-element skeleton-tab-button"></div>
      <div className="skeleton-element skeleton-tab-button"></div>
      <div className="skeleton-element skeleton-tab-button"></div>
      <div className="skeleton-element skeleton-tab-button"></div>
    </div>
  );
}

export default ContentTabsSkeleton;
