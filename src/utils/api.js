// API utility functions for making requests to the backend

// Folosim URL-ul din variabila de mediu sau default la localhost:5000
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
    // Folosim endpoint-ul corect pentru refresh token
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
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
      localStorage.removeItem('userData');
      return false;
    }
    
    const data = await response.json();
    localStorage.setItem('accessToken', data.access_token);
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
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

// Function to upload files
const uploadFile = async (endpoint, file, additionalData = {}, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add any additional data to the form
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Prepare headers (don't set Content-Type, it will be set automatically with the boundary)
  const headers = {
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
    method: 'POST',
    headers,
    body: formData,
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
  uploadFile: uploadFile,
  
  // Authentication endpoints
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    refreshToken: (refreshToken) => api.post('/api/auth/refresh', { refresh_token: refreshToken }),
    getProfile: () => api.get('/api/auth/me'),
    changePassword: (passwordData) => api.put('/api/auth/change-password', passwordData),
    loginWithGoogle: (googleToken) => api.post('/api/auth/login', { googleToken }),
  },
  
  // Admin endpoints
  admin: {
    getSettings: () => api.get('/api/admin/settings'),
    updateSettings: (settings) => api.put('/api/admin/settings', settings),
    getUsers: () => api.get('/api/admin/users'),
    createUser: (userData) => api.post('/api/admin/users', userData),
    updateUser: (userId, userData) => api.put(`/api/admin/users/${userId}`, userData),
    createRoom: (roomData) => api.post('/api/admin/rooms', roomData),
    updateRoom: (roomId, roomData) => api.put(`/api/admin/rooms/${roomId}`, roomData),
    importSchedule: (file, options) => api.uploadFile('/api/admin/schedule/import', file, options),
    importUsvSchedule: (data) => api.post('/api/admin/schedule/import-usv', data),
    resetSemester: (data) => api.post('/api/admin/reset-semester', data),
  },
  
  // Secretary endpoints
  secretary: {
    getPendingReservations: () => api.get('/api/secretary/reservations/pending'),
    approveReservation: (id) => api.put(`/api/secretary/reservations/${id}/approve`),
    rejectReservation: (id, data) => api.put(`/api/secretary/reservations/${id}/reject`, data),
    editReservation: (id, data) => api.put(`/api/secretary/reservations/${id}`, data),
    getReservationHistory: (params) => api.get('/api/secretary/reservation-history', { params }),
    getDailyReport: (date) => api.get(`/api/secretary/reports/daily?date=${date}`),
    getPeriodReport: (startDate, endDate) => api.get(`/api/secretary/reports/period?date_from=${startDate}&date_to=${endDate}`),
    getExamStats: () => api.get('/api/secretary/exam-stats'),
  },
  
  // Student endpoints
  student: {
    getRooms: () => api.get('/api/student/rooms'),
    getRoomAvailability: (roomId, date) => api.get(`/api/student/room/${roomId}/availability?date=${date}`),
    createReservation: (reservationData) => api.post('/api/student/reservations', reservationData),
    getUserReservations: (params) => api.get('/api/student/reservations', { params }),
    getReservationDetails: (id) => api.get(`/api/student/reservations/${id}`),
    cancelReservation: (id) => api.delete(`/api/student/reservations/${id}`),
  },
  
  // Teacher endpoints
  teacher: {
    getExamProposals: () => api.get('/api/teacher/exam-proposals'),
    getApprovedExams: () => api.get('/api/teacher/approved-exams'),
    getAvailableRooms: () => api.get('/api/teacher/available-rooms'),
    getAvailableAssistants: () => api.get('/api/teacher/available-assistants'),
    approveExamProposal: (id) => api.put(`/api/teacher/exam-proposals/${id}/approve`),
    rejectExamProposal: (id, data) => api.put(`/api/teacher/exam-proposals/${id}/reject`, data),
    updateExamDetails: (id, data) => api.put(`/api/teacher/exams/${id}`, data),
  },
};

export default api;
