// src/PremiumPage.jsx

import React from 'react';

// --- Icon components for the Premium Page ---
const CheckmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="glowing-icon">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const MusicNoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="glowing-icon">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

// CORRECTED: A more appropriate icon for "YouTube-Safe"
const YouTubeSafeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="glowing-icon">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9.5 14.5 5-2.5-5-2.5v5z"></path>
    </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="glowing-icon">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);


const PremiumPage = () => {
  return (
    <div className="premium-page">
      <div className="premium-content-container">

        {/* --- Pricing Card --- */}
        <div className="premium-card pricing-card">
          <h2 className="card-title">Pricing</h2>
          <p className="card-subtitle">For YouTube Creators</p>
          <div className="price-display">
            <span className="original-price">₹399/per month</span>
            <span className="current-price">₹59</span>
            <span className="price-period">/per month</span>
          </div>
          <button className="get-premium-button">GET PREMIUM</button>
          <p className="save-text">Save ₹4080 each year</p>
        </div>

        {/* --- Perks Card --- */}
        <div className="premium-card perks-card">
          <h3 className="card-title-small">Perks</h3>
          <ul className="perks-list">
            <li><CheckmarkIcon /> Unlimited Music Downloads</li>
            <li><CheckmarkIcon /> Exclusive Premium Music Collection Access</li>
            <li><CheckmarkIcon /> Ad-Free Experience</li>
            <li><CheckmarkIcon /> High-Quality Audio Files</li>
          </ul>
        </div>

        {/* --- Bonus Perks Card --- */}
        <div className="premium-card bonus-perks-card">
          <h3 className="card-title-small">BONUS Perks</h3>
          <ul className="perks-list">
            <li><MusicNoteIcon /> Early Access to New Releases</li>
            <li><YouTubeSafeIcon /> YouTube-Safe</li>
            <li><StarIcon /> Exclusive Playlists</li>
            <li className="many-more">and many more......</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
