import React from 'react';
import { useAuth } from '../utils/AuthContext';
import GroupLeaderDashboard from './roles/GroupLeaderDashboard';
import './GroupLeaderApp.css';

const GroupLeaderApp = () => {
  // Folosim contextul global de autentificare în loc de state local
  const { isAuthenticated, currentUser, logout } = useAuth();
  
  // Verificăm dacă utilizatorul este autentificat și are rolul potrivit
  if (!isAuthenticated || !currentUser) {
    return <div className="auth-error">Nu sunteți autentificat sau nu aveți permisiunile necesare.</div>
  }

  return (
    <div className="group-leader-app">
      <header className="app-header">
        <div className="logo">
          <h1>TWAAOS-SIC</h1>
        </div>
        <div className="user-welcome" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Bine ai venit, {currentUser.first_name || currentUser.name}!</span>
        </div>
      </header>

      <main className="app-main">
        <GroupLeaderDashboard user={currentUser} />
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 TWAAOS-SIC. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default GroupLeaderApp;
