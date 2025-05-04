import React, { useState } from 'react';
import GoogleAuth from './auth/GoogleAuth';
import TeacherDashboard from './roles/TeacherDashboard';
import './TeacherApp.css';

const TeacherApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    // Verifică dacă este un utilizator de test sau dacă are domeniul corect
    const isTestUser = userData.email.includes('test.') && userData.role === 'TEACHER';
    
    if (isTestUser || userData.email.endsWith('@usm.ro')) {
      console.log('Autentificare reușită:', userData);
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      console.error('Acces refuzat. Email invalid:', userData.email);
      alert('Access denied. Only @usm.ro email addresses are allowed.');
    }
  };

  const handleLogout = () => {
    // Șterge datele de autentificare din localStorage
    localStorage.removeItem('googleToken');
    localStorage.removeItem('userData');
    
    // Resetează starea componentei
    setIsAuthenticated(false);
    setUser(null);
    
    console.log('Utilizator delogat din Teacher');
  };

  return (
    <div className="teacher-app">
      <header className="app-header">
        <div className="logo">
          <h1>TWAAOS-SIC</h1>
        </div>
        {isAuthenticated && (
          <div className="user-welcome" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>Welcome, {user.name}</span>
            <button 
              onClick={handleLogout}
              style={{ 
                padding: '6px 12px', 
                backgroundColor: '#e74c3c', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!isAuthenticated ? (
          <div className="auth-container">
            <div className="auth-card">
              <h2>Teacher Login</h2>
              <p>Please sign in with your @usm.ro email address to access the Teacher dashboard.</p>
              <GoogleAuth 
                onLoginSuccess={handleLoginSuccess} 
                onLogout={handleLogout} 
              />
            </div>
          </div>
        ) : (
          <TeacherDashboard user={user} />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 TWAAOS-SIC. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TeacherApp;
