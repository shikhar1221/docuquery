import { apiClient } from './client';
import { AxiosError } from 'axios';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user';
import type { ApiErrorResponse } from '../types/errors';
import { createUserError } from '../types/errors';

export const Role = {
  Admin: 'admin',
  Editor: 'editor',
  Viewer: 'viewer',
} as const;

export const Permission = {
  // Document permissions
  DOCUMENTS_READ: 'documents:read',
  DOCUMENTS_CREATE: 'documents:create',
  DOCUMENTS_UPDATE: 'documents:update',
  DOCUMENTS_DELETE: 'documents:delete',
  DOCUMENTS_DOWNLOAD: 'documents:download',

  // Ingestion permissions
  INGESTION_TRIGGER: 'ingestion:trigger',
  INGESTION_STATUS: 'ingestion:status',

  // User management permissions
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Role management permissions
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
} as const;

export interface User {
  id: number;
  email: string;
  roles: string[];
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserDto {
  roles?: string[];
}

export const usersApi = {
  create: async (data: CreateUserDto): Promise<User> => {
    try {
      const response = await apiClient.post<User>('/users', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 409) {
        throw createUserError('User with this email already exists', 409, 'CONFLICT');
      }
      throw createUserError(
        axiosError.response?.data?.message || 'Failed to create user',
        axiosError.response?.status
      );
    }
  },

  getAll: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>('/users');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      throw createUserError(
        axiosError.response?.data?.message || 'Failed to fetch users',
        axiosError.response?.status
      );
    }
  },

  getOne: async (id: number): Promise<User> => {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 404) {
        throw createUserError(`User with ID ${id} not found`, 404, 'NOT_FOUND');
      }
      throw createUserError(
        axiosError.response?.data?.message || 'Failed to fetch user',
        axiosError.response?.status
      );
    }
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 404) {
        throw createUserError(`User with ID ${id} not found`, 404, 'NOT_FOUND');
      }
      throw createUserError(
        axiosError.response?.data?.message || 'Failed to update user',
        axiosError.response?.status
      );
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 404) {
        throw createUserError(`User with ID ${id} not found`, 404, 'NOT_FOUND');
      }
      throw createUserError(
        axiosError.response?.data?.message || 'Failed to delete user',
        axiosError.response?.status
      );
    }
  }
}; 