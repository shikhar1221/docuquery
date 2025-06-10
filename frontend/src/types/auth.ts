import type { Role } from './roles';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  roles: Role[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    roles: Role[];
    permissions: Record<string, boolean>;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
}