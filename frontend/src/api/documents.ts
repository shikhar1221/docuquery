import { apiClient } from './client';
import type { Document, CreateDocumentDto, UpdateDocumentDto, DocumentQueryParams } from '../types/document';

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
    return response.data || [];
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