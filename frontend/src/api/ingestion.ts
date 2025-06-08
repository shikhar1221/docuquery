import { apiClient } from './client';
import type { IngestionStatus } from '../types/ingestion';

export const ingestionApi = {
  triggerIngestion: async (documentId: string): Promise<void> => {
    await apiClient.post(`/ingestion/${documentId}/trigger`);
  },

  getStatus: async (documentId: string): Promise<IngestionStatus> => {
    const response = await apiClient.get<IngestionStatus>(`/ingestion/${documentId}/status`);
    return response.data;
  },
}; 