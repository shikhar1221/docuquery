import type { Role } from './auth';

export interface User {
  id: number;
  email: string;
  roles: Role[];
  permissions: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  roles?: Role[];
}

export interface UpdateUserDto {
  email?: string;
  roles?: Role[];
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roles?: Role[];
} 