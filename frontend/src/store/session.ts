import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '../types/auth';
import type { User } from '../types/user';

interface SessionState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setSession: (user: User | null, accessToken: string | null, refreshToken: string | null) => void;
  updateAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  hasRole: (role: Role) => boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
}

type SessionStore = SessionState;

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setSession: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: !!user && !!accessToken,
          error: null,
        }),

      updateAccessToken: (accessToken: string) => {
        set({ accessToken });
      },

      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        }),

      hasRole: (role: Role): boolean => {
        const state = get();
        return state.user?.roles.includes(role) ?? false;
      },

      hasPermission: (permission: string): boolean => {
        const state = get();
        return state.user?.permissions[permission] ?? false;
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'session-storage',
    }
  )
); 