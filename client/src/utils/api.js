import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: '/api', // Using Vite proxy or relative path if served together
  withCredentials: true, // For refresh token cookies
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
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
        
        // Update user in local storage with new token
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          user.accessToken = data.accessToken;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log the user out
        localStorage.removeItem('user');
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
