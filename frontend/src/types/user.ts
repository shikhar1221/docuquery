import type { Role, Permission } from './roles';

export type User = {
  id: number;
  username: string;
  email: string;
  roles: Role[];
  permissions: Record<Permission, boolean>;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
  roles?: Role[];
  permissions?: Partial<Record<Permission, boolean>>;
};

export type UpdateUserDto = {
  username?: string;
  email?: string;
  password?: string;
  roles?: Role[];
  permissions?: Partial<Record<Permission, boolean>>;
};

export type UserQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}; 