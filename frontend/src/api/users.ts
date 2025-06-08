import { apiClient } from './client';
import type { User, CreateUserDto, UpdateUserDto, UserQueryParams } from '../types/user';

export const usersApi = {
  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  getAll: async (params?: UserQueryParams): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users', { params });
    return response.data;
  },

  getOne: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
}; 