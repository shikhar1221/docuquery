export type IngestionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IngestionStatusResponse {
  id: string;
  documentId: string;
  status: IngestionStatus;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerIngestionDto {
  documentId: string;
}

export type IngestionStatusEnum = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';