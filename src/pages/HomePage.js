import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import GoogleAuth from '../components/auth/GoogleAuth';

const HomePage = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Effect for fade-in animation and debugging
  useEffect(() => {
    setFadeIn(true);
    console.log('HomePage mounted - Auth state:', { isAuthenticated, currentUser });
    
    // Force render content to make sure it's visible
    document.getElementById('debug-info').style.display = 'block';
    document.getElementById('debug-info').textContent = `HomePage loaded at ${new Date().toLocaleTimeString()}. Auth: ${isAuthenticated ? 'Yes' : 'No'}. User role: ${currentUser?.role || 'none'}. URL: ${window.location.href}`;
  }, [isAuthenticated, currentUser]);
  
  // Handle successful login
  const handleLoginSuccess = (userData) => {
    console.log('Login successful, user data:', userData);
    
    // Adăugăm un delay pentru a evita problemele de redirecționare prea rapidă
    setTimeout(() => {
      try {
        // Redirecționare către pagina corespunzătoare rolului
        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.role === 'secretary') {
          navigate('/secretariat');
        } else if (userData.role === 'student') {
          navigate('/sef-grupa');
        } else if (userData.role === 'teacher' || userData.role === 'TEACHER') {
          navigate('/teacher');
        } else {
          console.log('Role not recognized:', userData.role);
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 300);
  };
  
  // Handle logout
  const handleLogout = () => {
    // Șterge datele de autentificare din localStorage
    localStorage.removeItem('googleToken');
    localStorage.removeItem('userData');
    
    // Apelăm funcția de logout din contextul de autentificare
    logout();
    
    // Redirecționăm către pagina principală
    navigate('/');
    
    console.log('Utilizator delogat din HomePage');
  };

  // Function to navigate to role-specific pages
  const navigateToRole = (role) => {
    if (isAuthenticated) {
      if (role === 'secretariat' && currentUser.role === 'secretary') {
        navigate('/secretariat');
      } else if (role === 'groupLeader' && currentUser.role === 'student') {
        navigate('/sef-grupa');
      } else if (role === 'teacher' && (currentUser.role === 'teacher' || currentUser.role === 'TEACHER')) {
        navigate('/teacher');
      } else if (role === 'admin' && currentUser.role === 'admin') {
        navigate('/admin');
      } else {
        alert('Nu aveți permisiunea de a accesa această secțiune.');
      }
    } else {
      alert('Vă rugăm să vă autentificați pentru a accesa această secțiune.');
    }
  };

  return (
    <div className="home-page">
      {!isAuthenticated ? (
        <div className={`home-container ${fadeIn ? 'fade-in' : ''}`}>
          <div className="logo-container">
            <a href="https://www.usv.ro" target="_blank" rel="noopener noreferrer" title="Vizitați site-ul Universității Ștefan cel Mare din Suceava">
              <img src="/Sigla-USV-scroll.png" alt="USV Logo" className="usv-logo animated-logo" />
            </a>
          </div>
          <h1 className="app-title">TWAAOS-SIC</h1>
          <p className="subtitle animated-text">Sistem Informatic pentru Colocvii și Examene</p>
          <p className="subtitle-university animated-text">
            <a href="https://www.usv.ro" target="_blank" rel="noopener noreferrer" className="usv-link">
              Universitatea Ștefan cel Mare din Suceava
            </a>
          </p>
          <div className="card welcome-card">
            <p className="description">
              Bine ați venit în aplicația TWAAOS-SIC! Vă rugăm să vă autentificați sau să selectați rolul dvs. pentru a continua.
            </p>
            <div className="auth-section">
              <GoogleAuth 
                onLoginSuccess={handleLoginSuccess} 
                onLogout={handleLogout} 
              />
            </div>
          </div>
          <div className="role-cards">
            <div className="role-card" onClick={() => navigateToRole('secretariat')}>
              <div className="role-icon secretariat-icon">🏢</div>
              <h3>Secretariat</h3>
              <p>Gestionare discipline, săli, șefi de grupă și perioade de examinare</p>
            </div>
            <div className="role-card" onClick={() => navigateToRole('groupLeader')}>
              <div className="role-icon group-leader-icon">👨‍🎓</div>
              <h3>Șef Grupă</h3>
              <p>Propunere date de examen pentru disciplinele alocate</p>
            </div>
            <div className="role-card" onClick={() => navigateToRole('teacher')}>
              <div className="role-icon teacher-icon">👨‍🏫</div>
              <h3>Cadru Didactic</h3>
              <p>Vizualizare și aprobare propuneri de examen</p>
            </div>
            <div className="role-card" onClick={() => navigateToRole('admin')}>
              <div className="role-icon admin-icon">⚙️</div>
              <h3>Administrator</h3>
              <p>Gestionare informații facultate, cadre didactice și secretari</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-success-container">
          <div className="welcome-message">
            <h2>Bine ați venit, {currentUser.name}!</h2>
            <p>Sunteți autentificat ca <strong>{currentUser.role}</strong>.</p>
            <p>Puteți accesa pagina corespunzătoare rolului dvs. folosind meniul de navigare din partea de sus.</p>
          </div>
          <div className="role-navigation">
            <h3>Navigare rapidă:</h3>
            <div className="quick-nav-buttons">
              {currentUser.role === 'secretary' && (
                <button 
                  className="role-nav-button secretariat-button" 
                  onClick={() => navigate('/secretariat')}
                >
                  <span className="button-icon">🏢</span> Mergi la Secretariat
                </button>
              )}
              {currentUser.role === 'student' && (
                <button 
                  className="role-nav-button group-leader-button" 
                  onClick={() => navigate('/sef-grupa')}
                >
                  <span className="button-icon">👨‍🎓</span> Mergi la Șef Grupă
                </button>
              )}
              {(currentUser.role === 'teacher' || currentUser.role === 'TEACHER') && (
                <button 
                  className="role-nav-button teacher-button" 
                  onClick={() => navigate('/teacher')}
                >
                  <span className="button-icon">👨‍🏫</span> Mergi la Cadru Didactic
                </button>
              )}
              {currentUser.role === 'admin' && (
                <button 
                  className="role-nav-button admin-button" 
                  onClick={() => navigate('/admin')}
                >
                  <span className="button-icon">⚙️</span> Mergi la Administrator
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
