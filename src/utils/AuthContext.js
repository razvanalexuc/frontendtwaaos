import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext(null);

// Provider component that wraps the app and provides auth context
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      try {
        // Verifică dacă există date de utilizator în localStorage
        const userDataStr = localStorage.getItem('userData');
        const token = localStorage.getItem('accessToken');
        
        if (userDataStr && token) {
          // Parsează datele utilizatorului din localStorage
          const userData = JSON.parse(userDataStr);
          
          // Setează datele utilizatorului în context
          setCurrentUser(userData);
          console.log('User authenticated from localStorage:', userData);
        } else {
          // Nu există date de autentificare valide
          setCurrentUser(null);
          // Curăță localStorage dacă există doar token dar nu și date utilizator
          if (token && !userDataStr) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Curăță localStorage în caz de eroare
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Verifică autentificarea la încărcarea componentei
    checkAuth();
    
    // Adaugă un event listener pentru schimbări în localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'userData' || e.key === 'accessToken') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Curăță event listener-ul la demontarea componentei
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Funcție pentru autentificare directă cu date de utilizator
  const login = (userData, token) => {
    setLoading(true);
    setError(null);
    
    try {
      // Salvează token-ul și datele utilizatorului în localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', token); // Folosim același token pentru simplitate
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Actualizează starea în context
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      setError('Failed to login');
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru deconectare
  const logout = () => {
    // Șterge datele din localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    // Resetează starea utilizatorului în context
    setCurrentUser(null);
    console.log('User logged out');
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
