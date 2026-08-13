import axios from 'axios';
import { getToken, clearToken } from './auth';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      clearToken();
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    return Promise.reject(err);
  }
);

export default api;