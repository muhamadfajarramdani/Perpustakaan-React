import axios from 'axios';

const api = axios.create({
  baseURL: 'http://45.64.100.26:88/perpus-api/public/api',
  headers: {
    Accept: 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
