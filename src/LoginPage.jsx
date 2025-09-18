import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './App.css';

// A simple Google Icon component
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.54C34.643 7.964 29.643 6 24 6C12.955 6 4 14.955 4 26s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.54C34.643 7.964 29.643 6 24 6C16.318 6 9.656 10.083 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 46c5.643 0 10.643-1.964 14.485-5.54l-6.571-4.819C29.411 38.412 26.854 40 24 40c-5.223 0-9.651-3.344-11.303-8H6.306C9.656 37.917 16.318 42 24 42z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.571 4.819C40.091 34.609 44 29.865 44 24c0-1.341-.138-2.650-.389-3.917z"/>
  </svg>
);

function LoginPage({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  // NEW: Track if user came from premium page
  const [cameFromPremium, setCameFromPremium] = useState(false);

  // NEW: Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'premium') {
      setCameFromPremium(true);
    }
  }, []);

  const handleGoogleLogin = async () => {
    // DEBUG: Check environment variables
    console.log('=== DEBUG: Environment Variables ===');
    console.log('Client ID:', import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID);
    console.log('Auth Backend URL:', import.meta.env.VITE_REACT_APP_AUTH_BACKEND_URL);
    console.log('Data Backend URL:', import.meta.env.VITE_REACT_APP_BACKEND_URL);
    console.log('All env vars:', import.meta.env);
    
    setIsLoading(true);
    try {
      // Get environment variables
      const clientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
      // USE AUTH BACKEND for OAuth, not data backend
      const authBackendUrl = import.meta.env.VITE_REACT_APP_AUTH_BACKEND_URL || 'http://localhost:5000';
      
      // DEBUG: Check if variables are loaded
      if (!clientId) {
        console.error('❌ VITE_REACT_APP_GOOGLE_CLIENT_ID is undefined');
        alert('Client ID not found! Check your .env.local file');
        setIsLoading(false);
        return;
      }
      
      if (!authBackendUrl) {
        console.error('❌ VITE_REACT_APP_AUTH_BACKEND_URL is undefined');
        alert('Auth Backend URL not found! Check your .env.local file');
        setIsLoading(false);
        return;
      }
      
      // ✅ FIX: Add /api prefix to match server route
      const redirectUri = encodeURIComponent(`${authBackendUrl}/api/auth/google/callback`);
      const scope = encodeURIComponent('openid profile email');
      
      // 🔍 DEBUG: Let's see exactly what we're sending
      console.log('🔍 EXACT REDIRECT URI BEING SENT:', decodeURIComponent(redirectUri));
      console.log('🔍 AUTH BACKEND URL:', authBackendUrl);
      
      // ✅ NEW: Test the auth backend /api/auth/google endpoint first
      try {
        console.log('🔍 Testing auth backend /api/auth/google endpoint...');
        const testResponse = await fetch(`${authBackendUrl}/api/auth/google`, {
          method: 'GET',
          redirect: 'manual' // Don't follow redirects, just test if endpoint exists
        });
        console.log('Auth endpoint test status:', testResponse.status);
        console.log('Auth endpoint test response:', testResponse);
      } catch (error) {
        console.error('❌ Auth endpoint test failed:', error);
        alert('Auth backend /api/auth/google endpoint not working!');
        setIsLoading(false);
        return;
      }
      
      // NEW: Add state parameter to preserve premium navigation info
      let googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
      
      if (cameFromPremium) {
        const state = encodeURIComponent('from=premium');
        googleAuthUrl += `&state=${state}`;
      }
      
      // DEBUG: Log the final URL
      console.log('=== DEBUG: OAuth URL ===');
      console.log('Client ID:', clientId);
      console.log('Auth Backend URL:', authBackendUrl);
      console.log('Redirect URI (encoded):', redirectUri);
      console.log('Redirect URI (decoded):', decodeURIComponent(redirectUri));
      console.log('Came from premium:', cameFromPremium);
      console.log('Full OAuth URL:', googleAuthUrl);
      
      // ✅ Health check test
      try {
        const healthCheck = await fetch(`${authBackendUrl}/health`);
        console.log('Backend health status:', healthCheck.status);
        if (!healthCheck.ok) {
          alert('Auth backend is not running! Please start it first.');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        alert('Cannot reach auth backend at ' + authBackendUrl);
        setIsLoading(false);
        return;
      }
      
      // Redirect to Google
      console.log('✅ Redirecting to Google OAuth...');
      window.location.href = googleAuthUrl;
      
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h1>Welcome to Vara</h1>
          {/* NEW: Dynamic subtitle based on where user came from */}
          <p>{cameFromPremium ? 'Sign in to access premium features' : 'Sign in to access your music library'}</p>
        </div>
        <button 
          className="google-login-button" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <GoogleIcon />
          <span>{isLoading ? 'Redirecting to Google...' : 'Login with Google'}</span>
        </button>
        <div className="login-info">
          <p>
            By signing in, you agree to our{" "}
            <a
              href="/terms"
              className="terms-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              terms of service
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;