import React, { useState } from 'react';
import './App.css';
import SecretariatApp from './components/SecretariatApp';
import GroupLeaderApp from './components/GroupLeaderApp';
import TeacherApp from './components/TeacherApp';
import AdminApp from './components/AdminApp';



// Main App component
function App() {
  const [currentRole, setCurrentRole] = useState('home');
  
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
          <div className="home-container">
            <h1>TWAAOS-SIC</h1>
            <p className="subtitle">Sistem Informatic pentru Colocvii și Examene</p>
            <p className="description">
              Bine ați venit în aplicația TWAAOS-SIC! Vă rugăm să selectați rolul dvs. pentru a continua.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="main-app">
      {/* Role selector */}
      <div className="role-selector">
        <button 
          className={`role-button ${currentRole === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentRole('home')}
        >
          Acasă
        </button>
        <button 
          className={`role-button ${currentRole === 'secretariat' ? 'active' : ''}`}
          onClick={() => setCurrentRole('secretariat')}
        >
          Secretariat
        </button>
        <button 
          className={`role-button ${currentRole === 'groupLeader' ? 'active' : ''}`}
          onClick={() => setCurrentRole('groupLeader')}
        >
          Șef Grupă
        </button>
        <button 
          className={`role-button ${currentRole === 'teacher' ? 'active' : ''}`}
          onClick={() => setCurrentRole('teacher')}
        >
          Cadru Didactic
        </button>
        <button 
          className={`role-button ${currentRole === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentRole('admin')}
        >
          Administrator
        </button>
      </div>
      
      {/* Render the current view */}
      {renderView()}
    </div>
  );
}

export default App;
