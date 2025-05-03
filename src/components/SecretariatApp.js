import React, { useState } from 'react';
import GoogleAuth from './auth/GoogleAuth';
import SecretariatDashboard from './roles/SecretariatDashboard';
import './SecretariatApp.css';

const SecretariatApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    // Verificarea domeniului se face acum în componenta GoogleAuth
    // Aici doar verificăm dacă utilizatorul are rolul corect
    if (userData.role === 'SECRETARY' || userData.email.endsWith('@usm.ro')) {
      setIsAuthenticated(true);
      setUser(userData);
      console.log('Secretariat login successful:', userData);
    } else {
      alert('Access denied. This dashboard is only for Secretariat users.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="secretariat-app">
      <header className="app-header">
        <div className="logo">
          <h1>TWAAOS-SIC</h1>
        </div>
        {isAuthenticated && (
          <div className="user-welcome">
            <span>Welcome, {user.name}</span>
          </div>
        )}
      </header>

      <main className="app-main">
        {!isAuthenticated ? (
          <div className="auth-container">
            <div className="auth-card">
              <h2>Secretariat Login</h2>
              <p>Please sign in with your @usm.ro email address to access the Secretariat dashboard.</p>
              <GoogleAuth 
                onLoginSuccess={handleLoginSuccess} 
                onLogout={handleLogout} 
              />
            </div>
          </div>
        ) : (
          <SecretariatDashboard />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 TWAAOS-SIC. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SecretariatApp;
