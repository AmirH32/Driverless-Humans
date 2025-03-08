import axios from 'axios';
import { router } from 'expo-router'; // Import Expo Router

// Creates axios instance to ensure tokens are sent with requests
const api = axios.create({
  baseURL: 'https://driverless-humans.kibtry.net',
  withCredentials: true, 
});

// Interceptor that handles token refrehs
// Interceptor that handles token refresh
api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // Skip refresh token logic for auth endpoints
      const isAuthEndpoint = 
        originalRequest.url === '/login' || 
        originalRequest.url === '/register';
      
      // Only attempt refresh for 401 errors on non-auth endpoints
      if (error.response && 
          error.response.status === 401 && 
          !originalRequest._retry && 
          !isAuthEndpoint) {
          
          originalRequest._retry = true;
          try {
              // Attempt to refresh tokens
              const refreshResponse = await api.get('/refresh');
              const { access_token } = refreshResponse.data;
              api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
              originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
              return api(originalRequest);
          } catch (refreshError) {
              console.log("Refresh token expired, redirecting to login...");
              router.push('/login');
              return Promise.reject(refreshError);
          }
      }
      return Promise.reject(error);
    }
  );

export default api;