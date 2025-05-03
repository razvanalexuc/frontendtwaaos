import React, { useState, useEffect, useCallback } from 'react';
import './GoogleAuth.css';

// API URL for backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const GoogleAuth = ({ onLoginSuccess, onLogout }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(null);

  // Load Google API script
  useEffect(() => {
    // Check if the script is already loaded
    if (document.getElementById('google-api-script')) {
      setIsGoogleScriptLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-api-script';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsGoogleScriptLoaded(true);
    };

    // Add script to document
    document.body.appendChild(script);

    // Cleanup
    return () => {
      // Remove script if component unmounts
      const scriptElement = document.getElementById('google-api-script');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!isGoogleScriptLoaded || window.google === undefined) return;

    // Initialize Google Sign-In
    try {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '123456789-example.apps.googleusercontent.com', // Replace with your actual client ID
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: 240 }
      );
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }, [isGoogleScriptLoaded]);

  // Handle Google Sign-In callback
  const handleGoogleCallback = useCallback(async (response) => {
    if (!response || !response.credential) {
      console.error('Invalid Google response');
      return;
    }

    try {
      // Send the ID token to your backend
      const backendResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleToken: response.credential,
        }),
      });

      if (!backendResponse.ok) {
        throw new Error(`Backend response error: ${backendResponse.status}`);
      }

      const data = await backendResponse.json();
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      
      // Set user data
      const userData = {
        ...data.user,
        imageUrl: data.user.profile_picture || 'https://via.placeholder.com/50',
        name: `${data.user.first_name} ${data.user.last_name}`,
      };
      
      setUser(userData);
      setIsSignedIn(true);
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (error) {
      console.error('Error processing Google login:', error);
    }
  }, [onLoginSuccess]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Reset state
      setUser(null);
      setIsSignedIn(false);
      
      if (onLogout) {
        onLogout();
      }
      
      // Sign out from Google
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [onLogout]);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) return;
      
      try {
        // Verify token with backend
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          // Token invalid, remove it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return;
        }
        
        const data = await response.json();
        
        // Set user data
        const userData = {
          ...data.user,
          imageUrl: data.user.profile_picture || 'https://via.placeholder.com/50',
          name: `${data.user.first_name} ${data.user.last_name}`,
        };
        
        setUser(userData);
        setIsSignedIn(true);
        
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
      }
    };
    
    checkExistingAuth();
  }, [onLoginSuccess]);

  return (
    <div className="google-auth-container">
      {!isSignedIn ? (
        <div id="google-signin-button" className="google-signin-button-container"></div>
      ) : (
        <div className="user-profile">
          <img 
            src={user?.imageUrl} 
            alt={user?.name} 
            className="user-image" 
          />
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
            <button 
              className="signout-button"
              onClick={handleSignOut}
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
