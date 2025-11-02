import React, { useEffect, useMemo, useState } from 'react';

const UpArrowIcon = ({ size = 20, color = '#111' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const GoToTopButton = ({
  show,
  onGoTop,
  bottomOffset = 96,
  rightOffset = 24,
  showOnMobile = true,
  thresholdElementId = 'hero-section',
  targetSectionId = 'content-tabs-section',
  headerSelector = '.header',
  zIndex = 1200
}) => {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const measureAndUpdate = () => {
    try {
      const hero = document.getElementById(thresholdElementId);
      const header = document.querySelector(headerSelector);
      const heroHeight = hero ? hero.getBoundingClientRect().height : 0;
      const headerHeight = header ? header.offsetHeight : 0;
      const y = window.scrollY || window.pageYOffset || 0;
      setScrolledPastHero(y > Math.max(0, heroHeight - headerHeight));
    } catch {
      // Safe fallback if anything is missing
      setScrolledPastHero(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => measureAndUpdate();
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
      measureAndUpdate();
    };

    // Initial measurements
    setIsSmallScreen(window.innerWidth <= 768);
    measureAndUpdate();
    // Re-measure after content paints
    const t = setTimeout(measureAndUpdate, 0);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [thresholdElementId, headerSelector]);

  const visible = Boolean(show) && scrolledPastHero && (showOnMobile || !isSmallScreen);

  const handleClick = () => {
    try {
      if (typeof onGoTop === 'function') {
        onGoTop();
        return;
      }
      // Fallback: smooth scroll to targetSectionId accounting for header height
      const header = document.querySelector(headerSelector);
      const headerHeight = header ? header.offsetHeight : 0;
      const target = document.getElementById(targetSectionId);
      if (target) {
        const y = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const styles = useMemo(() => ({
    wrapper: {
      position: 'fixed',
      right: `${rightOffset}px`,
      bottom: `${bottomOffset}px`,
      zIndex,
      display: visible ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center'
    },
    button: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      backgroundColor: '#ebba2f',
      color: '#111',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
      cursor: 'pointer',
      transition: 'transform 0.18s ease, box-shadow 0.2s ease, opacity 0.2s ease',
      border: 'none',
      outline: 'none'
    }
  }), [rightOffset, bottomOffset, zIndex, visible]);

  return (
    <div
      className="go-to-top-wrapper"
      id="vara-go-to-top"
      style={styles.wrapper}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={handleClick}
        style={styles.button}
        aria-label="Go to music"
        title="Go to Music Section"
      >
        <UpArrowIcon />
      </button>
    </div>
  );
};

export default GoToTopButton;
