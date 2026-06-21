import axios from 'axios';
import { updateAccessToken, logoutUser } from '../features/auth/authSlice';

// Create a configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Use env var in production, relative path in development proxy
  withCredentials: true, // For refresh token cookies
});

let store;

export const setupInterceptorStore = (_store) => {
  store = _store;
};

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    if (store) {
      const state = store.getState();
      const user = state.auth.user;
      if (user && user.accessToken) {
        config.headers.Authorization = `Bearer ${user.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        // Update user in Redux store with new token
        if (store) {
          store.dispatch(updateAccessToken(data.accessToken));
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log the user out
        if (store) {
          store.dispatch(logoutUser());
        }
        window.location.href = '/auth'; // Redirect to auth
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
