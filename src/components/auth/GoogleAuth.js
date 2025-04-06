import React, { useState, useEffect } from 'react';
import './GoogleAuth.css';

const GoogleAuth = ({ onLoginSuccess, onLogout }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);

  // This is a mock implementation. In a real app, you would use the Google Sign-In API
  useEffect(() => {
    // Define mockSignIn function first
    const mockSignIn = () => {
      // Simulate a successful sign-in
      const mockUser = {
        email: 'secretariat@usm.ro',
        name: 'Secretariat User',
        imageUrl: 'https://via.placeholder.com/50',
      };
      
      setUser(mockUser);
      setIsSignedIn(true);
      
      if (onLoginSuccess) {
        onLoginSuccess(mockUser);
      }
    };
    
    // Mock function to simulate loading the Google API
    const mockLoadGoogleAPI = () => {
      console.log('Google API loaded');
      
      // Add a mock sign-in button functionality
      const googleSignInButton = document.getElementById('google-signin-button');
      if (googleSignInButton) {
        googleSignInButton.addEventListener('click', mockSignIn);
      }
    };

    // Mock sign-in function
    window.mockSignIn = () => {
      // Simulate a successful sign-in
      const mockUser = {
        email: 'secretariat@usm.ro',
        name: 'Secretariat User',
        imageUrl: 'https://via.placeholder.com/50',
      };
      
      setUser(mockUser);
      setIsSignedIn(true);
      
      if (onLoginSuccess) {
        onLoginSuccess(mockUser);
      }
    };

    // Mock sign-out function
    window.mockSignOut = () => {
      setUser(null);
      setIsSignedIn(false);
      
      if (onLogout) {
        onLogout();
      }
    };

    // Call the mock function to simulate API loading
    mockLoadGoogleAPI();

    // Cleanup
    return () => {
      // Remove event listeners if needed
      const googleSignInButton = document.getElementById('google-signin-button');
      if (googleSignInButton) {
        googleSignInButton.removeEventListener('click', window.mockSignIn);
      }
    };
  }, [onLoginSuccess, onLogout]);

  return (
    <div className="google-auth-container">
      {!isSignedIn ? (
        <button 
          id="google-signin-button" 
          className="google-signin-button"
          onClick={window.mockSignIn}
        >
          <img 
            src="https://developers.google.com/identity/images/g-logo.png" 
            alt="Google logo" 
          />
          Sign in with Google
        </button>
      ) : (
        <div className="user-profile">
          <img 
            src={user.imageUrl} 
            alt={user.name} 
            className="user-image" 
          />
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-email">{user.email}</p>
            <button 
              className="signout-button"
              onClick={window.mockSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;
