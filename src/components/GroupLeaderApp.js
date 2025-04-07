import React, { useState } from 'react';
import GoogleAuth from './auth/GoogleAuth';
import GroupLeaderDashboard from './roles/GroupLeaderDashboard';
import './GroupLeaderApp.css';

const GroupLeaderApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    // In a real app, you would validate if the email domain is @student.usv.ro
    // and check if the user is registered as a group leader
    if (userData.email.endsWith('@student.usv.ro')) {
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      alert('Access denied. Only @student.usv.ro email addresses are allowed.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="group-leader-app">
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
              <h2>Group Leader Login</h2>
              <p>Please sign in with your @student.usv.ro email address to access the Group Leader dashboard.</p>
              <GoogleAuth 
                onLoginSuccess={handleLoginSuccess} 
                onLogout={handleLogout} 
              />
            </div>
          </div>
        ) : (
          <GroupLeaderDashboard user={user} />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 TWAAOS-SIC. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default GroupLeaderApp;
