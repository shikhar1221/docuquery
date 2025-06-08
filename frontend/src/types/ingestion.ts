export enum IngestionStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

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