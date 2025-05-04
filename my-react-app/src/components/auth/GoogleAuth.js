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

  // Funcția pentru testarea cu diferite adrese de email și bypass Google Auth
  const testWithEmail = async () => {
    setIsLoading(true);
    setError(null);
    
    // Aflăm URL-ul curent pentru debug
    const currentUrl = window.location.href;
    console.log('URL curent:', currentUrl);
    
    // Determinăm rolul în funcție de componenta părinte
    // În loc să ne bazăm pe URL, verificăm direct ce componentă este folosită
    let role = 'STUDENT';
    let email = 'test.student@student.usv.ro';
    let domain = 'student.usv.ro';
    
    // Verificăm dacă suntem în pagina de cadru didactic
    const isTeacherPage = document.querySelector('.teacher-app') !== null || 
                         currentUrl.includes('teacher');
    
    // Verificăm dacă suntem în pagina de secretariat
    const isSecretariatPage = document.querySelector('.secretariat-app') !== null || 
                             currentUrl.includes('secretariat');
    
    // Verificăm dacă suntem în pagina de șef grupă
    const isGroupLeaderPage = document.querySelector('.group-leader-app') !== null || 
                              currentUrl.includes('groupLeader');
    
    // Verificăm dacă suntem în pagina de admin
    const isAdminPage = document.querySelector('.admin-app') !== null || 
                        currentUrl.includes('admin');
    
    console.log('Detectare pagini:', { 
      isTeacherPage, 
      isSecretariatPage, 
      isGroupLeaderPage, 
      isAdminPage 
    });
    
    if (isTeacherPage) {
      // Cadru didactic - domeniu @usm.ro
      role = 'TEACHER';
      email = 'test.teacher@usm.ro';
      domain = 'usm.ro';
      console.log('Rol detectat: Cadru didactic');
    } else if (isAdminPage) {
      // Admin - domeniu @usm.ro
      role = 'ADMIN';
      email = 'test.admin@usm.ro';
      domain = 'usm.ro';
      console.log('Rol detectat: Admin');
    } else if (isSecretariatPage) {
      // Secretariat - domeniu @usm.ro
      role = 'SECRETARY';
      email = 'test.secretary@usm.ro';
      domain = 'usm.ro';
      console.log('Rol detectat: Secretariat');
    } else if (isGroupLeaderPage) {
      // Șef grupă - domeniu @student.usv.ro
      role = 'GROUP_LEADER';
      email = 'test.groupleader@student.usv.ro';
      domain = 'student.usv.ro';
      console.log('Rol detectat: Șef grupă');
    } else {
      console.log('Niciun rol specific detectat, folosim rolul implicit: Student');
    }
    
    // Creează un utilizator de test
    const userData = {
      email: email,
      name: `Test ${role}`,
      imageUrl: 'https://ui-avatars.com/api/?name=Test+User&background=random',
      role: role
    };
    
    // Ne asigurăm că rolul și domeniul email-ului sunt corelate corect
    if (userData.email.endsWith('@usm.ro')) {
      // Pentru emailuri @usm.ro, asigurăm rolul corect în funcție de pagină
      if (window.location.href.includes('teacher')) {
        userData.role = 'TEACHER';
      } else if (window.location.href.includes('secretariat')) {
        userData.role = 'SECRETARY';
      } else if (window.location.href.includes('admin')) {
        userData.role = 'ADMIN';
      }
    } else if (userData.email.endsWith('@student.usv.ro')) {
      // Pentru emailuri @student.usv.ro, asigurăm rolul corect în funcție de pagină
      if (window.location.href.includes('groupLeader')) {
        userData.role = 'GROUP_LEADER';
      } else {
        userData.role = 'STUDENT';
      }
    }
    
    const testToken = 'test_token_for_automated_testing';
    
    // Încearcă comunicarea cu backend-ul pentru autentificare
    try {
      console.log('Se încearcă comunicarea cu backend-ul...');
      console.log('Rol detectat:', role);
      console.log('Email:', email);
      
      // Trimite cerere către backend pentru autentificare cu token-ul de test
      const response = await Promise.race([
        fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin
          },
          body: JSON.stringify({
            googleToken: testToken
          }),
          // Adaugăm aceste opțiuni pentru a rezolva problemele CORS
          mode: 'cors',
          credentials: 'omit'  // Schimbăm la 'omit' pentru a evita probleme CORS
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
      localStorage.setItem('googleToken', testToken);
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
      localStorage.setItem('googleToken', testToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Actualizează starea componentei
      setUser(userData);
      setIsSignedIn(true);
      setError(null);
    }
    
    // Apelează callback-ul de succes
    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }
    
    setIsLoading(false);
  };

  // Verifică dacă există un token în localStorage
  const hasToken = localStorage.getItem('googleToken') !== null;
  
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
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
            src={user.imageUrl || 'https://via.placeholder.com/50'} 
            alt={user.name || 'User'} 
            className="user-image" 
          />
          <div className="user-info">
            <p className="user-name">{user.name || 'Test User'}</p>
            <p className="user-email">{user.email || 'test@example.com'}</p>
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
