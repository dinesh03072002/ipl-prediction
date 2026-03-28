import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Set to false since we're not using cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
  },
};

// Match API
export const matchAPI = {
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  updateStatus: (id, status) => api.put(`/matches/${id}/status`, { status }),
};

// Question API
export const questionAPI = {
  getByMatch: (matchId) => api.get(`/questions/match/${matchId}`),
  create: (data) => api.post('/questions', data),
};

// Prediction API
export const predictionAPI = {
  submit: (data) => api.post('/predictions', data),
  getUserPredictions: (userId) => api.get(`/predictions/user/${userId}`),
};

// Result API
export const resultAPI = {
  updateResults: (data) => api.post('/results', data),
  getMatchResults: (matchId) => api.get(`/results/match/${matchId}`),
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
  getMatchLeaderboard: (matchId) => api.get(`/leaderboard/match/${matchId}`),
  getUserMatchPoints: (userId, matchId) => api.get(`/leaderboard/user/${userId}/match/${matchId}`),
};

export default api;