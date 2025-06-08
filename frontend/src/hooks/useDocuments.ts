import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documents';
import type { Document, UpdateDocumentDto, CreateDocumentDto } from '../types/document';
import { useSessionStore } from '../store/session';

export const useDocuments = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { user } = useSessionStore();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      try {
        return await documentsApi.getAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: CreateDocumentDto) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('userId', data.userId);
      const response = await documentsApi.create(formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDocumentDto }) => {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.file) formData.append('file', data.file);
      const response = await documentsApi.update(id, formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to update document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await documentsApi.delete(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    },
  });

  const uploadDocument = useCallback(
    async (data: CreateDocumentDto) => {
      await uploadMutation.mutateAsync(data);
    },
    [uploadMutation]
  );

  const updateDocument = useCallback(
    async (id: number, data: UpdateDocumentDto) => {
      await updateMutation.mutateAsync({ id, data });
    },
    [updateMutation]
  );

  const deleteDocument = useCallback(
    async (documentId: number) => {
      await deleteMutation.mutateAsync(documentId);
    },
    [deleteMutation]
  );

  const downloadDocument = useCallback(
    async (documentId: number) => {
      try {
        return await documentsApi.download(documentId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to download document');
        throw err;
      }
    },
    []
  );

  return {
    documents,
    loading: isLoading,
    error,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
  };
}; 