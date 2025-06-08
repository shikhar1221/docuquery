import { useSessionStore } from '../store/session';

export const useSession = () => {
  const { user, isAuthenticated, isLoading, error } = useSessionStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
}; 