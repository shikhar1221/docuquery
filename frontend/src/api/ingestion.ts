import { apiClient } from './client';

export type IngestionStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface IngestionStatus {
  id: number;
  documentId: number;
  status: IngestionStatusType;
  error?: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
    retryCount?: number;
    startTime?: string;
    lastChecked?: string;
    lastRetry?: string;
  };
  startedAt: string;
  updatedAt?: string;
}

export interface TriggerIngestionDto {
  documentId: number;
}

export const ingestionApi = {
  startIngestion: async (documentId: number): Promise<void> => {
    const payload: TriggerIngestionDto = { documentId };
    await apiClient.post('/ingestion', payload);
  },

  getIngestionStatus: async (documentId: number): Promise<IngestionStatus> => {
    const response = await apiClient.get(`/ingestion/${documentId}`);
    return response.data;
  },

  retryIngestion: async (documentId: number): Promise<void> => {
    const payload: TriggerIngestionDto = { documentId };
    await apiClient.post('/ingestion', payload);
  }
}; 