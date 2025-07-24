import React from 'react';
import HeroSkeleton from '../skeletons/HeroSkeleton';

const HeroSection = ({ loadingInitial, handleNavLinkClick }) => {
    if (loadingInitial) {
        return <HeroSkeleton />;
    }

    return (
        <section className="hero-section" id="hero-section">
            <h2 className="hero-sub-heading">Welcome to VARA</h2>
            <h1>
                Get Handpicked No Copyright <br />
                Music for Your Videos
            </h1>
            <p className="hero-description">"Browse 1000+ Premium Tracks, Sorted by Genre and Sub-Genre."</p>
            <p className="impact-text">
                "Silence or poor-quality audio is the #1 reason <br />
                people skip videos."
            </p>
            <button
                className="try-audio-button"
                onClick={() => handleNavLinkClick('home', 'content-tabs-section')}
            >
                TRY AUDIO
            </button>
        </section>
    );
};

export default HeroSection;
