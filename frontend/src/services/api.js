  import axios from 'axios';

  const API = axios.create({
    // VITE_API_URL lets deployments point at a hosted backend without a rebuild.
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000,
  });

  // attach token automatically
  API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  export default API;
