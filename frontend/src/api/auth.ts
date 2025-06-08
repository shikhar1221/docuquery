import { apiClient } from './client';
import type { AuthResponse, LoginCredentials, RegisterData, RefreshTokenResponse } from '../types/auth';

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.delete('/auth/logout');
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  checkAuth: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>('/auth/check');
    return response.data;
  },
}; 