import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './App-fix.css'; // Import fix CSS pentru a forța afișarea componentelor
import SecretariatApp from './components/SecretariatApp';
import GroupLeaderApp from './components/GroupLeaderApp';
import TeacherApp from './components/TeacherApp';
import AdminApp from './components/AdminApp';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './utils/AuthContext';

// Componenta principală App care definește rutele aplicației
function App() {
  console.log('App rendering - Router mounted');
  
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Debug info outside Routes to see if we reach this point */}
        <div id="debug-info" style={{ display: 'none' }}>
          Router mounted successfully!
        </div>
        
        <Routes>
          {/* Ruta principală - pagina de start */}
          <Route path="/" element={
            <Layout>
              <HomePage />
              {/* Backup HomePage în caz că primul nu este afișat */}
              <div style={{ display: 'none' }}>
                Backup content - Verifying route loading
              </div>
            </Layout>
          } />
          
          {/* Ruta pentru Secretariat - accesibilă doar pentru utilizatorii cu rol de secretary */}
          <Route 
            path="/secretariat" 
            element={
              <ProtectedRoute allowedRoles={['secretary']}>
                <Layout><SecretariatApp /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta pentru Șef Grupă - accesibilă doar pentru utilizatorii cu rol de student */}
          <Route 
            path="/sef-grupa" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout><GroupLeaderApp /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta pentru Cadru Didactic - accesibilă doar pentru utilizatorii cu rol de teacher/TEACHER */}
          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute allowedRoles={['teacher', 'TEACHER']}>
                <Layout><TeacherApp /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta pentru Administrator - accesibilă doar pentru utilizatorii cu rol de admin */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout><AdminApp /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Rută pentru pagini inexistente - redirecționează către pagina principală */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
