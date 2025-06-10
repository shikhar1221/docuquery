import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../../api/documents';

interface DocumentIngestionStatusProps {
  documentId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export const DocumentIngestionStatus = ({
  documentId,
  status,
  error,
}: DocumentIngestionStatusProps) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const queryClient = useQueryClient();

  const triggerIngestionMutation = useMutation({
    mutationFn: async () => {
      setIsTriggering(true);
      try {
        await documentsApi.triggerIngestion(documentId);
      } finally {
        setIsTriggering(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Ingestion Complete';
      case 'processing':
        return 'Processing Document';
      case 'failed':
        return 'Ingestion Failed';
      default:
        return 'Pending Ingestion';
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
      >
        {getStatusText()}
      </span>
      {status === 'failed' && error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
      {status !== 'processing' && (
        <button
          onClick={() => triggerIngestionMutation.mutate()}
          disabled={isTriggering}
          className={`text-sm font-medium text-indigo-600 hover:text-indigo-500 ${
            isTriggering ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isTriggering ? 'Triggering...' : 'Trigger Ingestion'}
        </button>
      )}
    </div>
  );
};