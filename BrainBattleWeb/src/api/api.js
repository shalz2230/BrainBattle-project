import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://brainbattlewebbackend.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const signup = (username, email, password) =>
  api.post('api/auth/signup', { username, email, password });

export const login = (email, password) =>
  api.post('api/auth/login', { email, password });

// User
export const getUser = (email) =>
  api.post('api/user/get-user', { email });

export const forgotPassword = (email) =>
  api.post('api/user/forgot-password', { email });

export const changePassword = (email, password) =>
  api.post('api/user/change-password', { email, password });

// Dashboard
export const getDashboard = (email) =>
  api.get(`api/dashboard/${email}`);

// Progress
export const saveProgress = (email, game_type, level, stars, time_taken) =>
  api.post('api/progress/save', { email, game_type, level, stars, time_taken });

export const getProgress = (email, game) =>
  api.get(`api/progress/get/${email}/${game}`);

export default api;
