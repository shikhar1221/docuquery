import axios, { AxiosError } from 'axios';
import { authApi } from './auth';
import { useSessionStore } from '../store/session';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useSessionStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Add response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const { refreshToken, updateAccessToken, clearSession } = useSessionStore.getState();

    // If error is 401 and we have a refresh token, try to refresh
    if (error.response?.status === 401 && refreshToken && originalRequest) {
      try {
        const { accessToken } = await authApi.refreshToken(refreshToken);
        updateAccessToken(accessToken);
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear session and redirect to login
        clearSession();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 401) {
      clearSession();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
); 