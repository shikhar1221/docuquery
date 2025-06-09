import { apiClient } from './client';
import { Role } from '../types/roles';

export interface RegisterDto {
  email: string;
  password: string;
  roles: Role[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    roles: Role[];
    permissions: Record<string, boolean>;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export const authApi = {
  register: async (data: RegisterDto): Promise<any> => {
    const response=await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.delete('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
    return response.data;
  }
};