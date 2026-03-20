import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('manicure_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Só redireciona para login se for uma rota autenticada do admin (não login)
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const isLoginRoute = url.includes('/auth/login') || url.includes('/client-auth/login') || url.includes('/client-auth/register');
      if (!isLoginRoute) {
        localStorage.removeItem('manicure_token');
        localStorage.removeItem('manicure_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;