import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingestionApi, IngestionStatus, IngestionStatusEnum } from '../api/ingestion';

export const useIngestion = (documentId: number) => {
  const queryClient = useQueryClient();

  const { data: status, isLoading, error } = useQuery<IngestionStatus, Error>({
    queryKey: ['ingestion', documentId],
    queryFn: () => ingestionApi.getIngestionStatus(documentId),
    refetchInterval: (data) => 
      data?.status === IngestionStatusEnum.PROCESSING ? 2000 : false,
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

  return {
    status,
    isLoading,
    error,
    startIngestion,
    retryIngestion,
    isStarting,
    isRetrying,
  };
}; 