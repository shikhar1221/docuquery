import { apiClient } from './apiClient';

export enum IngestionStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IngestionMetadata {
  retryCount: number;
  startTime: string;
  lastChecked?: string;
  lastRetry?: string;
  fileName?: string;
  filePath?: string;
  mimeType?: string;
  size?: number;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  processedAt?: string;
}

export interface IngestionStatus {
  id: number;
  documentId: number;
  status: IngestionStatusEnum;
  error?: string | null;
  metadata?: IngestionMetadata;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const ingestionApi = {
  startIngestion: async (documentId: number): Promise<IngestionStatus> => {
    const response = await apiClient.post<IngestionStatus>(`/ingestion`, { documentId });
    return response.data;
  },

  getIngestionStatus: async (documentId: number): Promise<IngestionStatus> => {
    const response = await apiClient.get<IngestionStatus>(`/ingestion/${documentId}`);
    return response.data;
  },

  retryIngestion: async (documentId: number): Promise<IngestionStatus> => {
    const response = await apiClient.post<IngestionStatus>(`/ingestion/${documentId}/retry`);
    return response.data;
  },
}; 