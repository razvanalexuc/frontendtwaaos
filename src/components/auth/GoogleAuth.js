import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import './GoogleAuth.css';
import { Alert } from 'react-bootstrap';

// API URL for backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Token pentru testare automatizată
const TEST_TOKEN = 'test_token_for_automated_testing';

const GoogleAuth = ({ onLoginSuccess, onLogout }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '823079913035-qvb7fm2pvvvgsn6o1t6ht2qigm9uoubi.apps.googleusercontent.com',
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
      setIsLoading(true);
      // Send the ID token to your backend
      const backendResponse = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      if (!backendResponse.ok) {
        let errorMessage = `Backend error: ${backendResponse.status}`;
        try {
          const errorData = await backendResponse.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If response is not valid JSON
        }
        
        throw new Error(errorMessage);
      }

      const data = await backendResponse.json();
      
      // Clear any previous errors
      setError(null);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Update state
      setUser(data.user);
      setIsSignedIn(true);
      
      // Call the success callback
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      setError(error.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  }, [onLoginSuccess]);

  // Verifică dacă utilizatorul este deja autentificat
  useEffect(() => {
    const checkExistingAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
          setIsSignedIn(true);
          
          if (onLoginSuccess) {
            onLoginSuccess(parsedUserData);
          }
        } catch (e) {
          console.error('Error parsing stored user data:', e);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
        }
      }
    };
    
    checkExistingAuth();
  }, [onLoginSuccess]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      // Reset state
      setUser(null);
      setIsSignedIn(false);
      
      // Call the logout callback
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

  // Funcția pentru testarea cu diferite adrese de email și bypass Google Auth
  const testWithEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Trimite cerere către backend pentru autentificare cu token-ul de test
      const response = await Promise.race([
        fetch(`${API_URL}/api/auth/test-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: TEST_TOKEN,
            email: 'test@example.com',
            role: 'teacher' // Poate fi 'teacher', 'secretariat', sau 'group_leader'
          }),
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Backend request timed out')), 5000)
        )
      ]);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Backend error: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Dacă răspunsul nu este JSON valid, folosim textul brut
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Dacă backend-ul nu răspunde sau avem o eroare, folosim autentificarea locală
      const userData = {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'teacher', // Poate fi 'teacher', 'secretariat', sau 'group_leader'
        imageUrl: 'https://via.placeholder.com/50'
      };

      // Salvează token-ul și datele utilizatorului în localStorage
      localStorage.setItem('accessToken', TEST_TOKEN);
      localStorage.setItem('userData', JSON.stringify(userData));

      // Actualizează starea componentei
      setUser(userData);
      setIsSignedIn(true);
      setError(null);

      // Apelează callback-ul de succes
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (error) {
      console.error('Error in test authentication:', error);
      setError(error.message || 'Failed to authenticate with test credentials');
      
      // Dacă avem o eroare la comunicarea cu backend-ul, folosim autentificarea locală
      const userData = {
        id: 'test-user-id',
        name: 'Test User (Local Fallback)',
        email: 'test@example.com',
        role: 'teacher',
        imageUrl: 'https://via.placeholder.com/50'
      };

      // Salvează token-ul și datele utilizatorului în localStorage
      localStorage.setItem('accessToken', TEST_TOKEN);
      localStorage.setItem('userData', JSON.stringify(userData));

      // Actualizează starea componentei
      setUser(userData);
      setIsSignedIn(true);

      // Apelează callback-ul de succes
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verifică dacă există un token în localStorage
  const hasToken = localStorage.getItem('accessToken') !== null;
  
  return (
    <div className="google-auth-container">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {isLoading && (
        <div className="loading-message" style={{ 
          padding: '10px', 
          marginBottom: '10px', 
          textAlign: 'center'
        }}>
          Se încarcă...
        </div>
      )}
      {/* Buton de Sign Out global - mereu vizibil dacă există un token */}
      {hasToken && (
        <div style={{ marginBottom: '20px' }}>
          <button 
            className="signout-button"
            onClick={handleSignOut}
            style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', width: '100%' }}
          >
            Sign Out
          </button>
        </div>
      )}
      
      {!isSignedIn ? (
        <div>
          <div id="google-signin-button" className="google-signin-button-container"></div>
          
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="test-button"
              onClick={testWithEmail}
              style={{ padding: '8px 16px', backgroundColor: '#4285f4', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
            >
              Bypass Google Auth (Test)
            </button>
          </div>
        </div>
      ) : (
        <div className="user-profile">
          <img 
            src={user?.imageUrl || 'https://via.placeholder.com/50'} 
            alt={user?.name || 'User'} 
            className="user-image" 
          />
          <div className="user-info">
            <p className="user-name">{user?.name || 'Test User'}</p>
            <p className="user-email">{user?.email || 'test@example.com'}</p>
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
