import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

// Guard access to browser-only APIs so importing this module on the server
// (Next.js SSR) won't throw ReferenceError.
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem('token');
      if (token) {
        if (!config.headers) config.headers = {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // Silently ignore; this keeps the client usable in SSR environments.
    // Logging can be added if needed.
  }
  return config;
});

export default api;
