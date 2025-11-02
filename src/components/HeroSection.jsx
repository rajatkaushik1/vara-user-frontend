import React, { useEffect, useState, useCallback } from 'react';
import HeroSkeleton from '../skeletons/HeroSkeleton';
import LotusHeroBackground from './LotusHeroBackground';
import './lotus-hero.css';

// Rotating tips pool — exactly one tip is shown per page load
const HERO_TIPS = [
  'Every song card shows a vocal icon. If you see it, the track has vocals. If it’s missing, that track is instrumental only.',
  'Premium songs are marked. A lotus icon in the top-right corner of a card means it’s part of the Premium library. You’ll need a Premium plan to download those.',
  'Unsure what something does? Just hover your mouse over any button or icon. A short description will appear to explain the feature.',
  'Verify Certifiacte ID anytime. Every track comes with a Certificate ID. You can confirm it directly through the Certificate Verification page in your profile or at the bottom footer.',
  'Go to the GENRE or SUB-GENRE tabs and click Explore to see all songs related to that category in one place.',
  'Find songs by instruments. Our newest feature lets you see which instruments are used in a track — great if you’re looking for a specific sound.',
  'All free songs in one tab. Don’t want Premium? Head to the FREE SONGS tab, where we’ve collected every free track so you don’t waste time searching.',
  'You can add any track to your Favorites, even on the free plan, and build your own personal music library.',
  'Not sure what to play? Try the FOR YOU section. It has 🔥 Trending tracks, 🆕 New uploads, 🔁 Listen Again, and 💡 Based on Your Taste playlists.',
  'For pro editors. Every track shows its musical key and BPM. Use these details to sync perfectly with cuts, transitions, and pacing in your videos.',
  'Preview Premium for free. You can always listen to Premium songs before deciding. Downloading them, however, requires a Premium plan.',
  'Set up your profile once. Add your YouTube info in your profile settings to enable downloads — this makes your Certificate valid for your channel.',
  'Slide the info section on each song card to quickly view its Genre, Sub-Genre, and Instruments.'
];

function getEmailLocalPart(email = '') {
  if (typeof email !== 'string') return '';
  const idx = email.indexOf('@');
  return idx > 0 ? email.slice(0, idx) : email;
}

const HeroSection = ({ loadingHeader, loadingHero, handleNavLinkClick, currentUser }) => {
  const [showContent, setShowContent] = useState(false);
  const [currentTip, setCurrentTip] = useState('');

  // Keep original intro + visibility logic
  useEffect(() => {
    if (loadingHeader || loadingHero) return;

    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const hasSeenIntro = typeof window !== 'undefined' &&
      window.sessionStorage &&
      window.sessionStorage.getItem('vara_hasSeenHeroIntro') === '1';

    if (prefersReducedMotion || hasSeenIntro) {
      setShowContent(true);
    }

    const onIntroEvent = () => {
      try { window.sessionStorage.setItem('vara_hasSeenHeroIntro', '1'); } catch {}
      setShowContent(true);
    };

    window.addEventListener('vara:hero-intro-complete', onIntroEvent);
    return () => window.removeEventListener('vara:hero-intro-complete', onIntroEvent);
  }, [loadingHeader, loadingHero]);

  // Intro complete callback (unchanged)
  const handleIntroComplete = useCallback(() => {
    try { window.sessionStorage.setItem('vara_hasSeenHeroIntro', '1'); } catch {}
    setShowContent(true);
  }, []);

  // Rotating tip: show exactly one tip per page load; rotate on refresh
  useEffect(() => {
    const key = 'vara_tip_index_v1';
    let index = 0;
    try {
      const stored = window.localStorage.getItem(key);
      index = Number.parseInt(stored, 10);
      if (!Number.isFinite(index) || index < 0) index = 0;
    } catch { index = 0; }

    const tip = HERO_TIPS[index % HERO_TIPS.length];
    setCurrentTip(tip);

    // increment and store next index for the next page load
    try { window.localStorage.setItem(key, String((index + 1) % HERO_TIPS.length)); } catch {}
  }, []);

  if (loadingHeader || loadingHero) {
    return <HeroSkeleton />;
  }

  // Derive display name for greeting
  const displayName =
    (currentUser?.name && String(currentUser.name).trim()) ||
    getEmailLocalPart(currentUser?.email || '') ||
    '';

  return (
    <section className="hero-section hero-section--with-bg" id="hero-section">
      <LotusHeroBackground
        durationMs={3000}
        onIntroComplete={handleIntroComplete}
        skipIntro={showContent}
      />
      <div className={`hero-content ${showContent ? 'visible' : 'hidden'}`}>
        {/* If logged in → show new greeting block INSTEAD of the old hero text */}
        {currentUser ? (
          <div className="hero-greeting hero-greeting--logged-in" aria-live="polite">
            <h1 className="hero-greeting-title-large">
              Hi {displayName}
            </h1>
            <h3 className="hero-greeting-subtitle">
              welcome back! Ready to find your next soundtrack?
            </h3>

            <div className="hero-greeting-actions">
              <button
                className="feedback-btn"
                onClick={() => window.open('/feedback', '_blank', 'noopener')}
                aria-label="Open feedback form in a new tab"
                title="Help us improve VARA"
              >
                📝 Help us improve VARA
              </button>
            </div>

            <div className="hero-tips">
              <div className="hero-tips-heading">Tips</div>
              <p className="hero-tip-text">{currentTip}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Original hero copy (shown only when NOT logged in) */}
            <h2 className="hero-sub-heading">Welcome to VARA</h2>
            <h1>
              Get Handpicked No Copyright <br />
              Music for Your Videos
            </h1>
            <p className="hero-description">
              "Browse 1000+ Premium Tracks, Sorted by Genre and Sub-Genre."
            </p>
            <p className="impact-text">
              "Silence or poor-quality audio is the #1 reason <br />
              people skip videos."
            </p>
          </>
        )}

        {/* TRY AUDIO button remains unchanged and in the same position block */}
        <button
          className="try-audio-button"
          onClick={() => handleNavLinkClick('home', 'content-tabs-section', true)}
        >
          TRY AUDIO
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
