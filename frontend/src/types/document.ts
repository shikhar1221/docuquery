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
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  ingestionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  ingestionError?: string;
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
}

export interface DocumentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 