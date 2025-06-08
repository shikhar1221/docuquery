import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingestionApi } from '../api/ingestion';
import type { IngestionStatus } from '../api/ingestion';

export const useIngestion = (documentId: number) => {
  const queryClient = useQueryClient();

  const { data: ingestionStatus, isLoading, error } = useQuery<IngestionStatus, Error>({
    queryKey: ['ingestion', documentId],
    queryFn: () => ingestionApi.getIngestionStatus(documentId),
  });

  // Separate query for auto-refresh when processing
  useQuery<IngestionStatus, Error>({
    queryKey: ['ingestion-refresh', documentId],
    queryFn: () => ingestionApi.getIngestionStatus(documentId),
    refetchInterval: 2000,
    enabled: ingestionStatus?.status === 'PROCESSING',
  });

  const { mutate: startIngestion, isPending: isStarting } = useMutation({
    mutationFn: () => ingestionApi.startIngestion(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestion', documentId] });
    },
  });

  const { mutate: retryIngestion, isPending: isRetrying } = useMutation({
    mutationFn: () => ingestionApi.retryIngestion(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestion', documentId] });
    },
  });

  const canRetry = ingestionStatus?.status === 'FAILED' && 
    (ingestionStatus.metadata?.retryCount || 0) < 3;

  return {
    ingestionStatus,
    isLoading,
    error,
    startIngestion,
    retryIngestion,
    isStarting,
    isRetrying,
    canRetry,
  };
}; 