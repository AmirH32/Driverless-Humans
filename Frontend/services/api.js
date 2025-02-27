import axios from 'axios';
import { router } from 'expo-router'; // Import Expo Router

// Creates axios instance to ensure tokens are sent with requests
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Replace with your backend URL
  withCredentials: true, 
});

// Interceptor that handles token refrehs
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Check if there is an error, its an unauthorised (token expiration) error and the request hasn't been retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        // Now we are retrying so we change to true
        originalRequest._retry = true;
        try {
        // Attempt to refresh tokens from backend
        const refreshResponse = await api.get('/refresh');
        const { access_token } = refreshResponse.data;
        // Update axios instance with the new token if needed
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        // Retry the original request with the new token
        return api(originalRequest);
        } catch (refreshError) {
            console.log("Refresh token expired, redirecting to login...");

            // Redirect to Login screen using Expo Router
            router.push('/login'); 
    
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
  }
);

export default api;
