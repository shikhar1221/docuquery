import { apiClient } from './client';

export interface DocumentMetadata {
  pageCount?: number;
  wordCount?: number;
  language?: string;
  processedAt?: string;
  [key: string]: unknown;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  user: {
    id: number;
    email: string;
  };
  metadata: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  title: string;
  description: string;
  file: File;
  userId: string;
}

export interface UpdateDocumentDto {
  title?: string;
  description?: string;
  file?: File;
  documentId: string;
  userId: string;
}

export interface DocumentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const documentsApi = {
  create: async (formData: FormData): Promise<Document> => {
    const response = await apiClient.post<Document>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (params?: DocumentQueryParams): Promise<Document[]> => {
    const response = await apiClient.get<Document[]>('/documents', { params });
    return response.data;
  },

  getOne: async (id: number): Promise<Document> => {
    const response = await apiClient.get<Document>(`/documents/${id}`);
    return response.data;
  },

  update: async (id: number, formData: FormData): Promise<Document> => {
    const response = await apiClient.put<Document>(`/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  download: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  triggerIngestion: async (id: number): Promise<void> => {
    await apiClient.post(`/documents/${id}/ingest`);
  },
};