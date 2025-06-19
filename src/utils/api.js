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
      console.error('Error parsing error response:', e);
      errorData = { message: `Error ${response.status}: ${response.statusText || 'An unknown error occurred'}` };
    }
    
    // Afișăm informații detaliate despre eroare pentru debugging
    console.error(`API Error (${response.status})`, {
      url: response.url,
      method: response.method,
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    
    // If it's a 401 Unauthorized error or missing authorization header, try to refresh the token
    if (response.status === 401 || 
        (errorData && errorData.msg && errorData.msg.includes('Authorization'))) {
      console.log('Authentication error detected, attempting to refresh token...');
      
      // Încercăm să reîmprospătăm token-ul
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the original request with the new token
        const token = localStorage.getItem('accessToken');
        
        // Creăm un nou obiect Headers pentru a putea modifica header-urile
        const newHeaders = {};
        for (const [key, value] of Object.entries(response.headers)) {
          newHeaders[key] = value;
        }
        newHeaders['Authorization'] = `Bearer ${token}`;
        
        // Refacem cererea cu noul token
        return makeRequest(response.url, {
          method: response.method,
          headers: newHeaders,
          body: response.body
        });
      } else {
        // Dacă reîmprospătarea a eșuat, încercam să redirectăm utilizatorul către pagina de autentificare
        console.error('Token refresh failed, redirecting to login page');
        
        // Ștergem datele de autentificare
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        
        // Redirectăm către pagina principală
        window.location.href = '/';
        
        return null;
      }
    }
    
    // Pentru eroarea 422, încercăm să returnăm un obiect gol în loc să aruncăm o eroare
    // Acest lucru permite aplicației să continue să funcționeze chiar dacă API-ul returnează erori
    if (response.status === 422) {
      console.warn('Received 422 error, returning empty data instead of throwing');
      return { data: [], message: errorData.message || 'No data available' };
    }
    
    // Throw error with message from response
    throw new Error(errorData.message || errorData.msg || `API error: ${response.status}`);
  }
  
  // Parse JSON response
  try {
    return response.json();
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    throw new Error('Invalid JSON response from server');
  }
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
  get: (endpoint, options = {}) => {
    // Procesăm parametrii de query dacă există
    if (options.params && Object.keys(options.params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      // Adăugăm parametrii la endpoint
      const queryString = queryParams.toString();
      if (queryString) {
        endpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}`;
      }
    }
    
    // Eliminăm params din options pentru a evita duplicarea
    const { params, ...restOptions } = options;
    
    return makeRequest(endpoint, { ...restOptions, method: 'GET' });
  },
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
    approveReservation: (id) => api.post(`/api/secretary/reservations/${id}/approve`),
    rejectReservation: (id, reason) => api.post(`/api/secretary/reservations/${id}/reject`, { reason }),
    getReservationHistory: (params) => api.get('/api/secretary/reservations/history', { params }),
    getDailyReport: (date) => api.get(`/api/secretary/reports/daily?date=${date}`),
    getPeriodReport: (startDate, endDate) => api.get(`/api/secretary/reports/period?date_from=${startDate}&date_to=${endDate}`),
    getExamStats: () => api.get('/api/secretary/exam-stats'),
    // Group leaders management
    getGroupLeaders: (params) => api.get('/api/secretary/group-leaders', { params }),
    addGroupLeader: (data) => api.post('/api/secretary/group-leaders', data),
    removeGroupLeader: (id) => api.delete(`/api/secretary/group-leaders/${id}`),
    getGroupLeaderTemplate: () => api.get('/api/group-leaders/template'),
    downloadGroupLeaderTemplate: () => `${API_URL}/api/group-leaders/download-template`,
    uploadGroupLeaders: (file, data) => api.uploadFile('/api/secretary/group-leaders/upload', file, data),
    deleteGroupLeader: (id) => api.delete(`/api/group-leaders/${id}`),
    // Rooms management
    getRooms: (filters) => api.get('/api/secretary/rooms', { params: filters }),
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
  
  // Course management endpoints
  courses: {
    getCourses: (params) => api.get('/api/courses', { params }),
    syncCourses: (data) => api.post('/api/courses/sync', data),
    proposeExamDate: (courseId, data) => api.post(`/api/courses/${courseId}/propose-date`, data),
    getCourse: (courseId) => api.get(`/api/courses/${courseId}`),
    approveExamProposal: (courseId, data) => api.put(`/api/courses/${courseId}/review`, { action: 'approve', ...data }),
    rejectExamProposal: (courseId, data) => api.put(`/api/courses/${courseId}/review`, { action: 'reject', ...data }),
  },
  
  // Exam management endpoints
  exams: {
    getExams: (params) => api.get('/api/exams', { params }),
    createExam: (examData) => api.post('/api/exams', examData),
    getExam: (id) => api.get(`/api/exams/${id}`),
    updateExam: (id, data) => api.put(`/api/exams/${id}`, data),
    deleteExam: (id) => api.delete(`/api/exams/${id}`),
  },
  
  // Exam registration endpoints
  examRegistrations: {
    getRegistrations: (params) => api.get('/api/exam-registrations', { params }),
    registerForExam: (data) => api.post('/api/exam-registrations', data),
    getRegistration: (id) => api.get(`/api/exam-registrations/${id}`),
    cancelRegistration: (id) => api.put(`/api/exam-registrations/${id}/cancel`),
    getExamStudents: (examId, params) => api.get(`/api/exam-registrations/exams/${examId}/students`, { params }),
    updateRegistrationStatus: (id, data) => api.put(`/api/exam-registrations/${id}/update-status`, data),
  },
  
  // External API endpoints
  external: {
    getTeachers: () => api.get('/api/external/teachers'),
  },
  
  // Teacher management endpoints
  teacherManagement: {
    addTeacher: (data) => api.post('/api/teacher-management/add-teacher', data),
    addExamProposal: (data) => api.post('/api/teacher-management/add-exam-proposal', data),
  },
};

export default api;
