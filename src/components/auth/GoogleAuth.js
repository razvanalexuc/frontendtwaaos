import React, { useState, useEffect, useCallback } from 'react';
import './GoogleAuth.css';
import { Alert } from 'react-bootstrap';

// API URL for backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Token pentru testare automatizată
const TEST_TOKEN = 'test_token_for_automated_testing';

const GoogleAuth = ({ onLoginSuccess, onLogout }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(null);
  const [error, setError] = useState(null);

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
        // Parse error response
        const errorData = await backendResponse.json();
        
        // Check if this is an unauthorized domain error
        if (errorData.error === 'unauthorized_domain') {
          setError(`Autentificare eșuată: Doar adresele de email de la domeniile student.usv.ro și usm.ro sunt acceptate. Domeniul tău (${errorData.domain}) nu este autorizat.`);
          return;
        }
        
        throw new Error(errorData.message || `Backend response error: ${backendResponse.status}`);
      }

      const data = await backendResponse.json();
      
      // Clear any previous errors
      setError(null);
      
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

  // Funcția pentru testarea cu diferite adrese de email și bypass Google Auth
  const testWithEmail = async () => {
    // Aflăm URL-ul curent pentru debug
    const currentUrl = window.location.href;
    console.log('URL curent:', currentUrl);
    
    // Determinăm rolul în funcție de componenta părinte
    let role = 'STUDENT';
    let email = 'test.student@student.usv.ro';
    
    // Verificăm dacă suntem în pagina de cadru didactic
    const isTeacherPage = document.querySelector('.teacher-app') !== null || 
                         currentUrl.includes('teacher');
    
    // Verificăm dacă suntem în pagina de secretariat
    const isSecretariatPage = document.querySelector('.secretariat-app') !== null || 
                             currentUrl.includes('secretariat');
    
    // Verificăm dacă suntem în pagina de șef grupă
    const isGroupLeaderPage = document.querySelector('.group-leader-app') !== null || 
                              currentUrl.includes('groupLeader');
    
    console.log('Pagini detectate:', {
      isTeacherPage,
      isSecretariatPage,
      isGroupLeaderPage
    });
    
    // Setăm rolul și email-ul în funcție de pagină
    if (isTeacherPage) {
      role = 'TEACHER';
      email = 'test.teacher@usm.ro';
    } else if (isSecretariatPage) {
      role = 'SECRETARY';
      email = 'test.secretary@usm.ro';
    } else if (isGroupLeaderPage) {
      role = 'GROUP_LEADER';
      email = 'test.group.leader@student.usv.ro';
    }
    
    // Creăm datele utilizatorului de test
    const userData = {
      id: 'test-user-id',
      email: email,
      name: `Test ${role}`,
      imageUrl: 'https://via.placeholder.com/50',
      role: role
    };
    
    try {
      console.log('Se încearcă comunicarea cu backend-ul...');
      console.log('Rol detectat:', role);
      console.log('Email:', email);
      
      // Trimite cerere către backend pentru autentificare cu token-ul de test
      const response = await Promise.race([
        fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin
          },
          body: JSON.stringify({
            googleToken: TEST_TOKEN
          }),
          mode: 'cors',
          credentials: 'omit'
        }),
        // Timeout după 3 secunde dacă backend-ul nu răspunde
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout - backend-ul nu răspunde')), 3000)
        )
      ]);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Eroare la autentificare';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Dacă răspunsul nu este JSON valid, folosim textul brut
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log('Răspuns de la backend:', responseData);
      
      // Salvează token-ul și datele utilizatorului primite de la backend
      localStorage.setItem('accessToken', TEST_TOKEN);
      localStorage.setItem('refreshToken', TEST_TOKEN);
      localStorage.setItem('userData', JSON.stringify(responseData.user || userData));
      
      // Actualizează starea componentei
      setUser(responseData.user || userData);
      setIsSignedIn(true);
      setError(null);
      
      // Apelează callback-ul de succes
      if (onLoginSuccess) {
        onLoginSuccess(responseData.user || userData);
      }
      
      return; // Ieșim din funcție dacă autentificarea cu backend a reușit
    } catch (error) {
      console.error('Eroare la autentificarea cu token de test:', error);
      console.log('Folosim autentificare locală ca fallback');
      
      // Folosim autentificarea locală ca fallback
      localStorage.setItem('accessToken', TEST_TOKEN);
      localStorage.setItem('refreshToken', TEST_TOKEN);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Actualizează starea componentei
      setUser(userData);
      setIsSignedIn(true);
      setError(null);
      
      // Apelează callback-ul de succes
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
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
