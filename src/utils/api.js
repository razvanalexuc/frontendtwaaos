// API utility functions for making requests to the backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get the auth token from localStorage
const getAuthToken = () => localStorage.getItem('accessToken');

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Check if the response is ok (status in the range 200-299)
  if (!response.ok) {
    // Try to parse error response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'An unknown error occurred' };
    }
    
    // If it's a 401 Unauthorized error, try to refresh the token
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the original request with the new token
        return makeRequest(response.url, {
          method: response.method,
          headers: response.headers,
          body: response.body
        });
      }
    }
    
    // Throw error with message from response
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  // Parse JSON response
  return response.json();
};

// Function to refresh the auth token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      // If refresh fails, clear tokens and return false
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
    
    const data = await response.json();
    localStorage.setItem('accessToken', data.access_token);
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }
};

// Main function to make API requests
const makeRequest = async (endpoint, options = {}) => {
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return handleResponse(response);
};

// Convenience methods for common HTTP methods
const api = {
  get: (endpoint, options = {}) => makeRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => makeRequest(endpoint, { 
    ...options, 
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data, options = {}) => makeRequest(endpoint, { 
    ...options, 
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint, options = {}) => makeRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
