import React from 'react';
import { Button, Tag, Progress } from 'antd';
import { 
  ClockCircleOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  FileTextOutlined,
  GlobalOutlined,
  NumberOutlined
} from '@ant-design/icons';
import { useIngestion } from '../../hooks/useIngestion';
import type { IngestionStatus } from '../../api/ingestion';

interface IngestionStatusProps {
  documentId: number;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'default';
    case 'PROCESSING':
      return 'processing';
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'PENDING':
      return <ClockCircleOutlined />;
    case 'PROCESSING':
      return <SyncOutlined spin />;
    case 'COMPLETED':
      return <CheckCircleOutlined />;
    case 'FAILED':
      return <CloseCircleOutlined />;
    default:
      return <ClockCircleOutlined />;
  }
};

const IngestionStatusComponent: React.FC<IngestionStatusProps> = ({ documentId }) => {
  const { 
    ingestionStatus, 
    isLoading, 
    error, 
    startIngestion, 
    retryIngestion,
    isStarting,
    isRetrying,
    canRetry
  } = useIngestion(documentId);

  if (isLoading) {
    return <Tag>Loading...</Tag>;
  }

  if (error) {
    return <Tag color="error">Error: {error.message}</Tag>;
  }

  if (!ingestionStatus) {
    return <Tag color="default">Pending</Tag>;
  }

  const { status, metadata } = ingestionStatus;

  return (
    <div className="ingestion-status">
      <div className="status-header">
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
        {status === 'PENDING' && (
          <Button 
            type="primary" 
            size="small" 
            onClick={() => startIngestion()} 
            loading={isStarting}
          >
            Start Ingestion
          </Button>
        )}
        {status === 'FAILED' && canRetry && (
          <Button 
            type="primary" 
            size="small" 
            onClick={() => retryIngestion()} 
            loading={isRetrying}
          >
            Retry
          </Button>
        )}
      </div>

      {status === 'PROCESSING' && (
        <Progress percent={99} status="active" />
      )}

      {status === 'COMPLETED' && metadata && (
        <div className="metadata">
          {metadata.pageCount && (
            <div className="metadata-item">
              <FileTextOutlined /> Pages: {metadata.pageCount}
            </div>
          )}
          {metadata.wordCount && (
            <div className="metadata-item">
              <NumberOutlined /> Words: {metadata.wordCount}
            </div>
          )}
          {metadata.language && (
            <div className="metadata-item">
              <GlobalOutlined /> Language: {metadata.language}
            </div>
          )}
        </div>
      )}

      {status === 'FAILED' && ingestionStatus.error && (
        <div className="error-message">
          Error: {ingestionStatus.error}
        </div>
      )}

      <style>{`
        .ingestion-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .status-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .metadata {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
        }
        .metadata-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(0, 0, 0, 0.65);
        }
        .error-message {
          color: #ff4d4f;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};

export { IngestionStatusComponent as IngestionStatus };