import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useSessionStore } from '../store/session';
import type { LoginCredentials, RegisterData } from '../types/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setSession, clearSession, setError, setLoading } = useSessionStore();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login(credentials);
      setSession(response.user, response.accessToken, response.refreshToken);
      navigate('/documents');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate, setSession, setError, setLoading]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.register(data);
      setSession(response.user, response.accessToken, response.refreshToken);
      navigate('/documents');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate, setSession, setError, setLoading]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      setLoading(false);
      navigate('/login');
    }
  }, [navigate, clearSession, setLoading]);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authApi.getCurrentUser();
      setSession(response.user, response.accessToken, response.refreshToken);
      return true;
    } catch (error) {
      clearSession();
      return false;
    } finally {
      setLoading(false);
    }
  }, [setSession, clearSession, setLoading]);

  return {
    login,
    register,
    logout,
    checkAuth,
  };
}; 