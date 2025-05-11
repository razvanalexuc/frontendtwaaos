import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../utils/AuthContext';
import api from '../../utils/api';
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
  
  // Folosim hook-ul useAuth pentru a accesa contextul de autentificare
  const { login, logout, currentUser, isAuthenticated } = useAuth();

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
        // Folosim modul popup pentru a evita problemele cu redirect
        ux_mode: 'popup',
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
      
      // Trimitem tokenul Google către backend pentru autentificare
      const googleToken = response.credential;
      
      // Salvăm tokenul Google în localStorage pentru referință
      localStorage.setItem('googleToken', googleToken);
      
      // Folosim API-ul nostru care gestionează CORS corect
      // folosind metoda auth.loginWithGoogle din api.js
      const authResponse = await api.auth.loginWithGoogle(googleToken);
      
      // Extragem tokenul JWT și datele utilizatorului din răspunsul backend-ului
      const { access_token, refresh_token, user } = authResponse;
      
      if (!access_token || !user) {
        throw new Error('Răspuns invalid de la server');
      }
      
      // Clear any previous errors
      setError(null);
      
      // Important: Salvăm tokenurile și datele utilizatorului în localStorage
      // Același lucru pe care îl facem în metoda de bypass care funcționează corect
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token || '');
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Folosim funcția login din contextul de autentificare cu tokenul JWT primit de la backend
      await login(user, access_token);
      
      // Update local state
      setUser(user);
      setIsSignedIn(true);
      
      // Call the success callback
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      setError(error.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  }, [onLoginSuccess]);

  // Verifică dacă există un utilizator autentificat în context
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      // Actualizăm starea locală a componentei
      setUser(currentUser);
      setIsSignedIn(true);
      
      // Apelează callback-ul de succes
      if (onLoginSuccess) {
        onLoginSuccess(currentUser);
      }
    }
  }, [currentUser, isAuthenticated, onLoginSuccess]);

  // Handle sign out
  const handleSignOut = () => {
    // Folosim funcția logout din contextul de autentificare
    logout();
    
    // Update local state
    setUser(null);
    setIsSignedIn(false);
    setError(null);
    
    // Call the logout callback pentru a asigura redirecționarea către pagina principală
    if (onLogout) {
      onLogout();
    }
    
    // Forțăm redirecționarea către pagina principală
    window.location.href = '/';
  };

  // Funcția pentru testarea cu diferite adrese de email și bypass Google Auth
  const testWithEmail = async () => {
    try {
      setIsLoading(true);
      
      // Simulăm un email de test
      const email = prompt('Introduceți adresa de email pentru testare:', 'test@student.usv.ro');
      
      if (!email) {
        setIsLoading(false);
        return; // Utilizatorul a anulat
      }
      
      // Determinăm rolul în funcție de domeniul de email
      let role = 'student';
      
      // Verificăm explicit adresa de email pentru a determina rolul
      if (email.includes('@student.')) {
        role = 'student';
      } else if (email.includes('@secretary.')) {
        role = 'secretary';
      } else if (email.includes('@usv.ro') || email.includes('@usm.ro')) {
        // Verificăm atât @usv.ro cât și @usm.ro pentru compatibilitate
        if (email.includes('admin')) {
          role = 'admin';
        } else if (email.includes('secretary')) {
          role = 'secretary';
        } else {
          role = 'teacher';
        }
      }
      
      console.log('Email introdus:', email, 'Rol determinat:', role);
      
      // Folosim token-ul special de test recunoscut de backend
      const testToken = 'test_token_for_automated_testing';
      
      try {
        console.log('Attempting to authenticate with backend using test token');
        const authResponse = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            googleToken: testToken,
            testEmail: email,  // Trimitem și adresa de email pentru a fi folosită de backend
            testRole: role     // Trimitem și rolul determinat din email
          }),
        });
        
        if (!authResponse.ok) {
          const errorData = await authResponse.json();
          throw new Error(errorData.message || 'Autentificare eșuată');
        }
        
        const authData = await authResponse.json();
        console.log('Backend authentication successful:', authData);
        
        // Extragem tokenul JWT și datele utilizatorului din răspunsul backend-ului
        const { access_token, refresh_token, user } = authData;
        
        if (!access_token || !user) {
          throw new Error('Răspuns invalid de la server');
        }
        
        // Salvăm tokenurile și datele utilizatorului în localStorage
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token || '');
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('googleToken', testToken);
        
        // Folosim funcția login din contextul de autentificare
        await login(user, access_token);
        
        // Actualizăm starea locală a componentei
        setUser(user);
        setIsSignedIn(true);
        setError(null);
        
        // Apelăm callback-ul de succes
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
        
        return; // Ieșim din funcție dacă autentificarea cu backend a reușit
      } catch (backendError) {
        console.error('Backend authentication failed:', backendError);
        console.log('Using local authentication as fallback');
        
        // Continuăm cu autentificarea locală ca fallback
      }
      
      // Creăm datele utilizatorului de test pentru autentificare locală
      const userData = {
        id: `test-${role}-${Date.now()}`,
        name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        email: email,
        role: role,
        imageUrl: 'https://via.placeholder.com/50'
      };

      // Salvăm datele în localStorage pentru autentificare locală
      localStorage.setItem('accessToken', TEST_TOKEN);
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('googleToken', TEST_TOKEN);

      // Folosim funcția login din contextul de autentificare
      await login(userData, TEST_TOKEN);

      // Actualizăm starea locală a componentei
      setUser(userData);
      setIsSignedIn(true);
      setError(null);

      // Apelăm callback-ul de succes
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (error) {
      console.error('Error in test authentication:', error);
      setError(error.message || 'Failed to authenticate with test credentials');
      
      // Fallback de urgență în caz de eroare completă
      const userData = {
        id: 'test-user-id',
        name: 'Test User (Emergency Fallback)',
        email: 'test@student.usv.ro',
        role: 'student',
        imageUrl: 'https://via.placeholder.com/50'
      };

      // Salvăm datele în localStorage pentru autentificare locală
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
  
  // Folosim starea de autentificare din context
  const hasToken = isAuthenticated || localStorage.getItem('accessToken') !== null;
  
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
