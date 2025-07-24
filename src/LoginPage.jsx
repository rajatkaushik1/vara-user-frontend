import React, { useState } from 'react';
import './App.css'; // We'll reuse some of the existing styles

// A simple Google Icon component
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.54C34.643 7.964 29.643 6 24 6C12.955 6 4 14.955 4 26s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.54C34.643 7.964 29.643 6 24 6C16.318 6 9.656 10.083 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 46c5.643 0 10.643-1.964 14.485-5.54l-6.571-4.819C29.411 38.412 26.854 40 24 40c-5.223 0-9.651-3.344-11.303-8H6.306C9.656 37.917 16.318 42 24 42z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.571 4.819C40.091 34.609 44 29.865 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);


function LoginPage() {
  const [channelName, setChannelName] = useState('');

  const handleGoogleLogin = () => {
    // This is where you would trigger the Google Firebase authentication flow
    if (channelName.trim() === '') {
      alert('Please enter your YouTube Channel Name to proceed.');
      return;
    }
    console.log(`Logging in with Google and protecting channel: ${channelName}`);
    // Placeholder for actual Google login logic
  };

  return (
    <div className="login-page-container">
      <div className="login-form-wrapper">
        <p className="privacy-text">
          We don't share your personal info. Your channel is safe with us.
        </p>
        <div className="channel-input-container">
          <input
            type="text"
            className="channel-input"
            placeholder="Enter Your YouTube Channel Name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
        </div>
        <button className="google-login-button" onClick={handleGoogleLogin}>
          <GoogleIcon />
          <span>Login with Google</span>
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
