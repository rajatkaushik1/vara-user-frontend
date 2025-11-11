import React, { useRef, useState, useEffect, useCallback } from 'react';
import GenreCardSkeleton from '../skeletons/GenreCardSkeleton.jsx';

const ScrollRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ScrollLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function SubGenreCarousel({
  title,
  items = [],
  onExploreSubgenre,
  isLoading = false,
  hideHeader = false
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [pageIndex, setPageIndex] = useState(0);

  const recalcPagination = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const vw = el.clientWidth || 1;
    const total = el.scrollWidth || vw;
    const count = Math.max(1, Math.ceil(total / vw));
    setPageCount(count);

    // Update current page from scrollLeft
    const idx = Math.round(el.scrollLeft / vw);
    setPageIndex(Math.min(count - 1, Math.max(0, idx)));
  }, []);

  function isFirstCardFullyVisible() {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return true;
    const areaRect = el.getBoundingClientRect();
    const firstRect = el.firstElementChild.getBoundingClientRect();
    return firstRect.left >= areaRect.left - 2;
  }

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth;
    setHasOverflow(overflow);
    setCanScrollLeft(!isFirstCardFullyVisible());
    setCanScrollRight(overflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    checkScrollability();
    scrollEl.addEventListener('scroll', checkScrollability);
    const ro = new ResizeObserver(checkScrollability);
    ro.observe(scrollEl);
    return () => {
      scrollEl.removeEventListener('scroll', checkScrollability);
      ro.unobserve(scrollEl);
    };
  }, [checkScrollability]);

  useEffect(() => {
    const t = setTimeout(checkScrollability, 80);
    return () => clearTimeout(t);
  }, [items, isLoading, checkScrollability]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    recalcPagination();

    // Listen to scroll to update active dot
    const onScroll = () => recalcPagination();
    el.addEventListener('scroll', onScroll, { passive: true });

    // Resize observer to recompute page count when layout changes
    const ro = new ResizeObserver(recalcPagination);
    ro.observe(el);

    // Also watch window resize
    const onWin = () => recalcPagination();
    window.addEventListener('resize', onWin, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      window.removeEventListener('resize', onWin);
    };
  }, [recalcPagination]);

  const scrollToPage = useCallback((idx) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(idx, pageCount - 1));
    const x = clamped * el.clientWidth;
    el.scrollTo({ left: x, behavior: 'smooth' });
    setPageIndex(clamped);
  }, [pageCount]);

  const handleScroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amt = el.offsetWidth * 0.8;
    const next = dir === 'left' ? el.scrollLeft - amt : el.scrollLeft + amt;
    el.scrollTo({ left: next, behavior: 'smooth' });
    setTimeout(checkScrollability, 300);
  };

  const Skeleton = GenreCardSkeleton;
  const skeletonCount = 4;

  // Left padding = 0 (content grid already provides 40px)
  const scrollPad = '0 60px 0 0';
  const scrollStyle = !hasOverflow
    ? { padding: scrollPad, marginLeft: 0, overflowX: 'hidden', scrollSnapType: 'none' }
    : { padding: scrollPad };

  return (
    <div className="search-carousel-container" style={{ marginBottom: 12 }}>
      {/* Header row with title */}
      {!hideHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', marginBottom: 12 }}>
          <h3 className="search-carousel-title" style={{ padding: 0, margin: 0 }}>{title}</h3>
        </div>
      )}

      <div className="carousel-wrapper">
        <button
          className={`carousel-scroll-button left${!canScrollLeft ? ' hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <ScrollLeftIcon />
        </button>

        <div
          className="carousel-scroll-area"
          ref={scrollRef}
          style={scrollStyle}
        >
          {isLoading ? (
            Array.from({ length: skeletonCount }).map((_, i) => <Skeleton key={i} />)
          ) : items && items.length > 0 ? (
            items.map((sub) => (
              <div
                key={`sub-${sub._id}`}
                className="genre-card clickable"
                role="button"
                tabIndex={0}
                onClick={() => onExploreSubgenre && onExploreSubgenre(sub._id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onExploreSubgenre && onExploreSubgenre(sub._id);
                  }
                }}
              >
                <div className="genre-card-image-wrap">
                  <img
                    src={sub.imageUrl || 'https://placehold.co/200x200/333/FFF?text=VARA'}
                    alt={sub.name}
                    className="genre-card-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=VARA'; }}
                    draggable={false}
                  />
                  {sub?.genre?.name && (
                    <span className="subgenre-parent-pill">
                      {(sub.genre.name || '').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="genre-card-content">
                  <h5 className="genre-card-name">{sub.name}</h5>
                  <div className="genre-card-description-wrapper">
                    <p className="genre-card-description">{sub.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results-text">No sub-genres found.</p>
          )}
        </div>

        <button
          className={`carousel-scroll-button right${!canScrollRight ? ' hidden' : ''}`}
          style={!hasOverflow ? { display: 'none' } : undefined}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <ScrollRightIcon />
        </button>
      </div>

      {pageCount > 1 && (
        <div className="sg-dots" role="tablist" aria-label="Sub-genre pages">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={`sgdot-${i}`}
              type="button"
              className={`sg-dot ${i === pageIndex ? 'active' : ''}`}
              aria-label={`Go to page ${i + 1}`}
              aria-selected={i === pageIndex}
              onClick={() => scrollToPage(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
