import { apiClient } from './client';
import type { AuthResponse, LoginCredentials, RegisterData, RefreshTokenResponse } from '../types/auth';

export interface RegisterDto {
  email: string;
  password: string;
  roles: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterDto): Promise<void> => {
    await apiClient.post('/auth/register', data);
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
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