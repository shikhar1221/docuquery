import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user';

export const useUsers = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await usersApi.getAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      const response = await usersApi.create(userData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      await usersApi.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    },
  });

  const createUser = useCallback(
    async (userData: CreateUserDto) => {
      await createMutation.mutateAsync(userData);
    },
    [createMutation]
  );

  const deleteUser = useCallback(
    async (userId: number) => {
      await deleteMutation.mutateAsync(userId);
    },
    [deleteMutation]
  );

  const updateUser = useCallback(async (id: number, userData: UpdateUserDto) => {
    try {
      setError(null);
      const updatedUser = await usersApi.update(id, userData);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    createUser,
    deleteUser,
    updateUser,
  };
}; 