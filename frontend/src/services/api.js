import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const expenseAPI = {
  addExpense: (data) => api.post('/expenses', data),
  getExpenses: (params) => api.get('/expenses', { params }),
  getExpenseById: (id) => api.get(`/expenses/${id}`),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getSummary: () => api.get('/expenses/summary'),
  exportPDF: (params) => api.get('/expenses/export-pdf', { params, responseType: 'blob' }),
};


export const budgetAPI = {
  setBudget: (data) => api.post('/budget/set', data),
  getBudgetStatus: () => api.get('/budget/status'),
};

export default api;