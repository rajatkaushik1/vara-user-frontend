import React from 'react';

// HeroSkeleton component to display a placeholder for the hero section content
function HeroSkeleton() {
  return (
    // The main hero section container, mimicking the actual hero section's structure
    <section className="hero-section">
      {/* Placeholder for the sub-heading text */}
      <div className="skeleton-element skeleton-text-line skeleton-text-short"></div>
      {/* Placeholder for the main heading text (multiple lines) */}
      <div className="skeleton-element skeleton-text-line skeleton-text-long"></div>
      <div className="skeleton-element skeleton-text-line skeleton-text-medium"></div>
      {/* Placeholder for the description text */}
      <div className="skeleton-element skeleton-text-line skeleton-text-medium"></div>
      {/* Placeholder for the impact text */}
      <div className="skeleton-element skeleton-text-line skeleton-text-long"></div>
      <div className="skeleton-element skeleton-text-line skeleton-text-medium"></div>
      {/* Placeholder for the "Try Audio" button */}
      <div className="skeleton-element skeleton-button skeleton-button-large"></div>
    </section>
  );
}

export default HeroSkeleton;
