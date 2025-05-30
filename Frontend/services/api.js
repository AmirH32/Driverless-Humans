import axios from 'axios';
import { router } from 'expo-router'; // Import Expo Router
import { Alert } from 'react-native';

// Creates axios instance to ensure tokens are sent with requests
const api = axios.create({
  baseURL: 'https://driverless-humans.kibtry.net',
  // baseURL: 'http://127.0.0.1:5000', // Replace with your backend URL
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error is coming from the /refresh endpoint, immediately redirect to login
    if (originalRequest.url === '/refresh') {
      router.replace('/login')
      return Promise.reject(error);
    }

    // Skip refresh logic for auth endpoints (like /login and /register)
    const isAuthEndpoint = 
      originalRequest.url === '/login' || 
      originalRequest.url === '/register';

    if (error.response && error.response.status === 401) {
      // Check the error type
      const errorType = error.response.data.error_type;
      
      if (errorType === 'invalid_credentials') {
        // This is a login failure, don't try to refresh
        return Promise.reject(error);
      } else if ((errorType === 'missing_token' || errorType === 'token_expired' || errorType === 'invalid_token') 
        && !isAuthEndpoint) {
      try {
        // Attempt to refresh tokens
        await api.get('/refresh');
        // Retry the original request with the new tokens/cookies
        return api(originalRequest);
      } catch (refreshError) {
        console.log(`Refresh attempt failed`);
        // Redirect to login page
        router.replace('/login');
      }
    }
  }

    return Promise.reject(error);
  }
);

export default api;
