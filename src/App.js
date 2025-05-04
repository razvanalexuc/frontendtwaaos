import React, { useState, useEffect } from 'react';
import './App.css';
import SecretariatApp from './components/SecretariatApp';
import GroupLeaderApp from './components/GroupLeaderApp';
import TeacherApp from './components/TeacherApp';
import AdminApp from './components/AdminApp';
import GoogleAuth from './components/auth/GoogleAuth';
import { AuthProvider, useAuth } from './utils/AuthContext';


// AppContent component that uses the auth context
function AppContent() {
  const [currentRole, setCurrentRole] = useState('home');
  const [fadeIn, setFadeIn] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  
  // Effect for fade-in animation when component mounts
  useEffect(() => {
    setFadeIn(true);
  }, []);
  
  // Handle successful login
  const handleLoginSuccess = (userData) => {
    // Determine role based on user data
    if (userData.role === 'admin') {
      setCurrentRole('admin');
    } else if (userData.role === 'secretary') {
      setCurrentRole('secretariat');
    } else if (userData.role === 'student') {
      setCurrentRole('groupLeader');
    } else {
      setCurrentRole('teacher');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    setCurrentRole('home');
  };
  
  // Function to render the appropriate view based on the selected role
  const renderView = () => {
    switch (currentRole) {
      case 'secretariat':
        return <SecretariatApp />;
      case 'groupLeader':
        return <GroupLeaderApp />;
      case 'teacher':
        return <TeacherApp />;
      case 'admin':
        return <AdminApp />;
      case 'home':
      default:
        return (
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
                Bine ați venit în aplicația TWAAOS-SIC! Vă rugăm să selectați rolul dvs. pentru a continua.
              </p>
            </div>
            <div className="role-cards">
              <div className="role-card" onClick={() => setCurrentRole('secretariat')}>
                <div className="role-icon secretariat-icon">🏢</div>
                <h3>Secretariat</h3>
                <p>Gestionare discipline, săli, șefi de grupă și perioade de examinare</p>
              </div>
              <div className="role-card" onClick={() => setCurrentRole('groupLeader')}>
                <div className="role-icon group-leader-icon">👨‍🎓</div>
                <h3>Șef Grupă</h3>
                <p>Propunere date de examen pentru disciplinele alocate</p>
              </div>
              <div className="role-card" onClick={() => setCurrentRole('teacher')}>
                <div className="role-icon teacher-icon">👨‍🏫</div>
                <h3>Cadru Didactic</h3>
                <p>Aprobare/respingere propuneri, configurare detalii examen</p>
              </div>
              <div className="role-card" onClick={() => setCurrentRole('admin')}>
                <div className="role-icon admin-icon">⚙️</div>
                <h3>Administrator</h3>
                <p>Gestionare informații facultate, cadre didactice și secretari</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`main-app ${fadeIn ? 'fade-in' : ''}`}>
      {/* Header with role selector */}
      <header className="app-header">
        <div className="header-logo">
          <a href="https://www.usv.ro" target="_blank" rel="noopener noreferrer">
            <img src="/Sigla-USV-scroll.png" alt="USV Logo" className="header-logo-img" />
          </a>
          <span className="header-title">TWAAOS-SIC</span>
        </div>
        {isAuthenticated ? (
          <nav className="role-selector">
            <button 
              className={`role-button ${currentRole === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentRole('home')}
            >
              <span className="button-icon">🏠</span> Acasă
            </button>
            {currentUser.role === 'secretary' && (
              <button 
                className={`role-button ${currentRole === 'secretariat' ? 'active' : ''}`}
                onClick={() => setCurrentRole('secretariat')}
              >
                <span className="button-icon">🏢</span> Secretariat
              </button>
            )}
            {currentUser.role === 'student' && (
              <button 
                className={`role-button ${currentRole === 'groupLeader' ? 'active' : ''}`}
                onClick={() => setCurrentRole('groupLeader')}
              >
                <span className="button-icon">👨‍🎓</span> Șef Grupă
              </button>
            )}
            {currentUser.role === 'teacher' && (
              <button 
                className={`role-button ${currentRole === 'teacher' ? 'active' : ''}`}
                onClick={() => setCurrentRole('teacher')}
              >
                <span className="button-icon">👨‍🏫</span> Cadru Didactic
              </button>
            )}
            {currentUser.role === 'admin' && (
              <button 
                className={`role-button ${currentRole === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentRole('admin')}
              >
                <span className="button-icon">⚙️</span> Administrator
              </button>
            )}
            <div className="auth-container">
              <GoogleAuth 
                onLoginSuccess={handleLoginSuccess} 
                onLogout={handleLogout} 
              />
            </div>
          </nav>
        ) : (
          <div className="auth-container">
            <GoogleAuth 
              onLoginSuccess={handleLoginSuccess} 
              onLogout={handleLogout} 
            />
          </div>
        )}
      </header>
      
      {/* Main content area */}
      <main className="main-content">
        {!isAuthenticated && currentRole !== 'home' ? (
          <div className="auth-required">
            <h2>Autentificare necesară</h2>
            <p>Vă rugăm să vă autentificați pentru a accesa această secțiune.</p>
            <GoogleAuth 
              onLoginSuccess={handleLoginSuccess} 
              onLogout={handleLogout} 
            />
          </div>
        ) : (
          renderView()
        )}
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} - TWAAOS-SIC | <a href="https://www.usv.ro" target="_blank" rel="noopener noreferrer">Universitatea Ștefan cel Mare din Suceava</a></p>
        </div>
      </footer>
    </div>
  );
}

// Main App component that wraps the content with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
