import axios from 'axios';
import { router } from 'expo-router'; // Import Expo Router
import { Alert } from 'react-native';

// Creates axios instance to ensure tokens are sent with requests
const api = axios.create({
  baseURL: 'https://driverless-humans.kibtry.net', // Replace with your backend URL
  withCredentials: true,
});

const MAX_RETRIES = 3;

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error is coming from the /refresh endpoint, immediately redirect to login
    if (originalRequest.url === '/refresh') {
      alert("Refresh endpoint failed, your refresh token might be expired. Please re-login","Redirecting to login...");
      router.push('/login');
      return Promise.reject(error);
    }

    // Skip refresh logic for auth endpoints (like /login and /register)
    const isAuthEndpoint = 
      originalRequest.url === '/login' || 
      originalRequest.url === '/register';

    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      // Initialize the retry counter if it doesn't exist
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1;
        try {
          // Attempt to refresh tokens - this call should set new HTTP-only cookies
          await api.get('/refresh');
          // Retry the original request with the new tokens/cookies
          return api(originalRequest);
        } catch (refreshError) {
          console.log(`Refresh attempt ${originalRequest._retryCount} failed`);
        }
      }
      router.push('/login');
    }

    return 200
  }
);

export default api;
