// For testing taste recommendations, use local backend
const API_BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'https://vara-admin-backend.onrender.com';

// ✅ FIX: Make sure auth backend URL matches your server
const AUTH_BASE_URL = import.meta.env.VITE_REACT_APP_AUTH_BACKEND_URL || 'http://localhost:5000';

// Helper function to check if auth backend is reachable
const checkAuthBackendHealth = async () => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/health`, { 
      method: 'GET',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    console.warn('Auth backend health check failed:', error.message);
    return false;
  }
};

// ✅ FIXED: Analytics and tracking API endpoints
const ANALYTICS_ENDPOINTS = {
  trackInteraction: (songId) => `${API_BASE_URL}/api/songs/track/${songId}`,
  getTrending: () => `${API_BASE_URL}/api/songs/trending`,
  getSongAnalytics: (songId) => `${API_BASE_URL}/api/analytics/songs/${songId}`,
  getAllSongsAnalytics: () => `${API_BASE_URL}/api/analytics/songs`,
  getPlatformStats: (days = 7) => `${API_BASE_URL}/api/analytics/platform?days=${days}`,
  resetWeeklyCounters: () => `${API_BASE_URL}/api/analytics/reset-weekly`,
  // NEW: Listen Again (by userEmail; limit default 20)
  getListenAgain: (userEmail, limit = 20) => `${API_BASE_URL}/api/analytics/listen-again?userEmail=${encodeURIComponent(userEmail)}&limit=${limit}`,
  // NEW: Weekly Recommendations (not personalized)
  getWeeklyRecommendations: (limit = 15) => `${API_BASE_URL}/api/analytics/weekly-recommendations?limit=${limit}`
};

// NEW: Taste profile endpoints
const TASTE_ENDPOINTS = {
  trackInteraction: () => `${AUTH_BASE_URL}/api/user/taste-interaction`,
  getRecommendations: () => `${AUTH_BASE_URL}/api/user/recommendations`,
  getSongsByIds: (songIds) => `${API_BASE_URL}/api/songs/by-ids?ids=${songIds.join(',')}`
};

// NEW: Songs endpoints
const SONGS_ENDPOINTS = {
  getNew: (sinceDays = 10, limit = 12) => `${API_BASE_URL}/api/songs/new?sinceDays=${sinceDays}&limit=${limit}`,
  // NEW: Songs by mood resolvers
  getByMood: (moodId) => `${API_BASE_URL}/api/songs/mood/${moodId}`,
  getByMoods: (moodIds = [], limit = 15) =>
    `${API_BASE_URL}/api/songs/by-moods?moodIds=${encodeURIComponent(moodIds.join(','))}&limit=${limit}`,
};

// NEW: Moods endpoints
const MOODS_ENDPOINTS = {
  getAll: () => `${API_BASE_URL}/api/moods`,
};

export { API_BASE_URL, AUTH_BASE_URL, checkAuthBackendHealth, ANALYTICS_ENDPOINTS, TASTE_ENDPOINTS, SONGS_ENDPOINTS, MOODS_ENDPOINTS };

/**
 * Content version endpoint (served by Admin backend).
 * Used by the user app to detect when the catalog changed.
 */
export const CONTENT_VERSION_URL = `${API_BASE_URL}/api/content/version`;

/**
 * Helper: Append a version parameter (?v=123) to bypass stale caches ONLY when needed.
 * Keeps disk cache intact for normal requests.
 */
export function withVersion(url, v) {
  if (!v) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(v)}`;
}