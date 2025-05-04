import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real application, this would validate against a backend
    // For now, we'll use a mock validation
    if (username === 'admin' && password === 'admin123') {
      const userData = {
        name: 'Administrator',
        role: 'admin'
      };
      
      onLoginSuccess(userData);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2>Administrator Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="login-button">Login</button>
        
        <div className="login-info">
          <p>For demo purposes, use:</p>
          <p>Username: admin</p>
          <p>Password: admin123</p>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
