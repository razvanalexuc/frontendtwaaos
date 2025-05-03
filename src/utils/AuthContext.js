import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';

// Create the authentication context
const AuthContext = createContext(null);

// Provider component that wraps the app and provides auth context
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const userData = {
          ...response.user,
          imageUrl: response.user.profile_picture || 'https://via.placeholder.com/50',
          name: `${response.user.first_name} ${response.user.last_name}`,
        };
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login with Google token
  const loginWithGoogle = async (googleToken) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { googleToken });
      
      // Store tokens
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      
      // Set user data
      const userData = {
        ...response.user,
        imageUrl: response.user.profile_picture || 'https://via.placeholder.com/50',
        name: `${response.user.first_name} ${response.user.last_name}`,
      };
      
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      setError(error.message || 'Failed to login with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    loginWithGoogle,
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
