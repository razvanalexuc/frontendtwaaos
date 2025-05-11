import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import GoogleAuth from './auth/GoogleAuth';

const Layout = ({ children }) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Debugging - afișează starea de autentificare în consolă
  console.log('Layout rendering - Auth state:', { isAuthenticated, currentUser, childrenExists: !!children });
  
  const handleLoginSuccess = (userData) => {
    console.log('Login successful, user data:', userData);
    
    // Redirecționare către pagina corespunzătoare rolului
    if (userData.role === 'admin') {
      navigate('/admin');
    } else if (userData.role === 'secretary') {
      navigate('/secretariat');
    } else if (userData.role === 'student') {
      navigate('/sef-grupa');
    } else if (userData.role === 'teacher' || userData.role === 'TEACHER') {
      navigate('/teacher');
    }
  };
  
  const handleLogout = () => {
    // Șterge datele de autentificare din localStorage
    localStorage.removeItem('googleToken');
    localStorage.removeItem('userData');
    
    // Apelăm funcția de logout din contextul de autentificare
    logout();
    
    // Redirecționăm către pagina principală
    navigate('/');
    
    console.log('Utilizator delogat');
  };
  
  return (
    <div className="main-app">
      <header className="app-header">
        <div className="header-logo">
          <Link to="/">
            <img src="/Sigla-USV-scroll.png" alt="USV Logo" className="header-logo-img" />
          </Link>
          <span className="header-title">TWAAOS-SIC</span>
        </div>
        
        {isAuthenticated ? (
          <nav className="role-selector">
            <Link to="/" className="role-button">
              <span className="button-icon">🏠</span> Acasă
            </Link>
            
            {currentUser && currentUser.role === 'secretary' && (
              <Link to="/secretariat" className="role-button">
                <span className="button-icon">🏢</span> Secretariat
              </Link>
            )}
            
            {currentUser && currentUser.role === 'student' && (
              <Link to="/sef-grupa" className="role-button">
                <span className="button-icon">👨‍🎓</span> Șef Grupă
              </Link>
            )}
            
            {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'TEACHER') && (
              <Link to="/teacher" className="role-button">
                <span className="button-icon">👨‍🏫</span> Cadru Didactic
              </Link>
            )}
            
            {currentUser && currentUser.role === 'admin' && (
              <Link to="/admin" className="role-button">
                <span className="button-icon">⚙️</span> Administrator
              </Link>
            )}
            
            <div className="auth-container">
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
      
      <main className="main-content">
        {/* Debugging - afișăm un placeholder dacă children lipsește */}
        {children || (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Conținutul ar trebui să apară aici</h2>
            <p>Debugging: Auth state = {isAuthenticated ? 'Autentificat' : 'Neautentificat'}</p>
            <p>Current URL: {window.location.pathname}</p>
            {currentUser && <p>User role: {currentUser.role}</p>}
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} - TWAAOS-SIC | <a href="https://www.usv.ro" target="_blank" rel="noopener noreferrer">Universitatea Ștefan cel Mare din Suceava</a></p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
