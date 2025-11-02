import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Force top-of-page on reload/initial mount (disable browser scroll restoration)
if (typeof window !== 'undefined') {
  try {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTopNow = () => {
      // Use default behavior; instantly jumps to top
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    // Immediately on bootstrap
    scrollToTopNow();

    // On full load
    window.addEventListener('load', scrollToTopNow);

    // Handle bfcache + robust reload detection
    window.addEventListener('pageshow', (e) => {
      const nav = (performance && performance.getEntriesByType)
        ? performance.getEntriesByType('navigation')?.[0]
        : null;
      const isReload = nav ? nav.type === 'reload'
        : (performance && performance.navigation && performance.navigation.type === 1); // legacy fallback

      if (e.persisted || isReload) {
        scrollToTopNow();
      }
    });
  } catch {
    // Safe fallback
    window.scrollTo(0, 0);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)