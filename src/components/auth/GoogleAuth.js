import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import './GoogleAuth.css';

const GoogleAuth = ({ onLoginSuccess, onLogout }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verifică dacă utilizatorul este deja autentificat
  useEffect(() => {
    const checkExistingAuth = () => {
      const token = localStorage.getItem('googleToken');
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
          localStorage.removeItem('googleToken');
          localStorage.removeItem('userData');
        }
      }
    };
    
    checkExistingAuth();
  }, [onLoginSuccess]);

  // Funcția de procesare a răspunsului de la Google
  const processGoogleResponse = async (tokenResponse) => {
    try {
      setIsLoading(true);
      
      // Obține informații despre utilizator folosind token-ul de acces
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const userInfo = await response.json();
      
      // Verifică domeniul email-ului
      const emailDomain = userInfo.email.split('@')[1]?.toLowerCase();
      
      if (!emailDomain || !['student.usv.ro', 'usm.ro'].includes(emailDomain)) {
        setError(`Autentificare eșuată: Doar adresele de email de la domeniile student.usv.ro și usm.ro sunt acceptate. Domeniul tău (${emailDomain || 'necunoscut'}) nu este autorizat.`);
        setIsLoading(false);
        return;
      }
      
      // Creează obiectul utilizator în funcție de domeniul email-ului
      let userData = {
        email: userInfo.email,
        name: userInfo.name,
        imageUrl: userInfo.picture,
      };
      
      if (emailDomain === 'student.usv.ro') {
        userData.role = 'STUDENT';
      } else if (emailDomain === 'usm.ro') {
        if (window.location.href.includes('teacher')) {
          userData.role = 'TEACHER';
        } else {
          userData.role = 'SECRETARY';
        }
      }
      
      // Salvează datele utilizatorului și token-ul
      localStorage.setItem('googleToken', tokenResponse.access_token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      setIsSignedIn(true);
      setError(null);
      
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (error) {
      console.error('Error processing Google response:', error);
      setError('A apărut o eroare la procesarea răspunsului de la Google. Vă rugăm să încercați din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  // Configurarea autentificării Google
  const login = useGoogleLogin({
    onSuccess: processGoogleResponse,
    onError: (error) => {
      console.error('Google Login Error:', error);
      setError('A apărut o eroare la autentificarea cu Google. Vă rugăm să încercați din nou.');
    },
    scope: 'email profile',
  });

  // Funcția de deconectare
  const handleSignOut = () => {
    localStorage.removeItem('googleToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsSignedIn(false);
    
    if (onLogout) {
      onLogout();
    }
  };

  // Funcția pentru testarea cu diferite adrese de email
  const testWithEmail = () => {
    alert('În modul de autentificare reală cu Google, nu puteți testa cu adrese de email personalizate. Vă rugăm să vă autentificați cu contul dvs. Google.');  
  };

  return (
    <div className="google-auth-container">
      {error && (
        <div className="error-message" style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da', 
          padding: '10px', 
          marginBottom: '10px', 
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
          position: 'relative'
        }}>
          {error}
          <button 
            onClick={() => setError(null)} 
            style={{
              position: 'absolute',
              top: '5px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
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
      {!isSignedIn ? (
        <div>
          <button 
            id="google-signin-button" 
            className="google-signin-button"
            onClick={() => login()}
            disabled={isLoading}
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google logo" 
            />
            Sign in with Google
          </button>
          <button 
            className="test-button"
            onClick={testWithEmail}
            style={{ marginTop: '10px', padding: '8px 16px' }}
          >
            Test cu alt email
          </button>
        </div>
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
