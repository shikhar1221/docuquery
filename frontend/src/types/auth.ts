import type { User } from './user';

export const Role = {
  Admin: 'admin',
  Editor: 'editor',
  Viewer: 'viewer',
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  roles?: Role[];
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