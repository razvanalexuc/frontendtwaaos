import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

// Componentă pentru protejarea rutelor care necesită autentificare și rol specific
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  // Verificăm dacă utilizatorul este autentificat
  if (!isAuthenticated) {
    console.log('Acces refuzat: Utilizatorul nu este autentificat');
    return <Navigate to="/" replace />;
  }
  
  // Verificăm dacă utilizatorul are rolul necesar pentru a accesa ruta
  if (allowedRoles && (!currentUser || !allowedRoles.includes(currentUser.role))) {
    console.log(`Acces refuzat: Utilizatorul nu are rolul necesar (${allowedRoles.join(', ')})`);
    return <Navigate to="/" replace />;
  }
  
  // Dacă utilizatorul este autentificat și are rolul potrivit, afișăm conținutul
  return children;
};

export default ProtectedRoute;
