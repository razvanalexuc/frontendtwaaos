import React, { useState } from 'react';
import GoogleAuth from './auth/GoogleAuth';
import TeacherDashboard from './roles/TeacherDashboard';
import './TeacherApp.css';

const TeacherApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    // In a real app, you would validate if the email domain is @usm.ro
    // and check if the user is registered as a teacher
    if (userData.email.endsWith('@usm.ro')) {
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      alert('Access denied. Only @usm.ro email addresses are allowed.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="teacher-app">
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
