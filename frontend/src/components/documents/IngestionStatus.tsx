import React from 'react';
import { Button, Tag, Progress, Space, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useIngestion } from '../../hooks/useIngestion';
import { IngestionStatusEnum } from '../../api/ingestion';

interface IngestionStatusProps {
  documentId: number;
}

const getStatusColor = (status: IngestionStatusEnum) => {
  switch (status) {
    case IngestionStatusEnum.PENDING:
      return 'default';
    case IngestionStatusEnum.PROCESSING:
      return 'processing';
    case IngestionStatusEnum.COMPLETED:
      return 'success';
    case IngestionStatusEnum.FAILED:
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: IngestionStatusEnum) => {
  switch (status) {
    case IngestionStatusEnum.PENDING:
      return <ClockCircleOutlined />;
    case IngestionStatusEnum.PROCESSING:
      return <SyncOutlined spin />;
    case IngestionStatusEnum.COMPLETED:
      return <CheckCircleOutlined />;
    case IngestionStatusEnum.FAILED:
      return <CloseCircleOutlined />;
    default:
      return <ClockCircleOutlined />;
  }
};

const getStatusText = (status: IngestionStatusEnum) => {
  switch (status) {
    case IngestionStatusEnum.PENDING:
      return 'Pending';
    case IngestionStatusEnum.PROCESSING:
      return 'Processing';
    case IngestionStatusEnum.COMPLETED:
      return 'Completed';
    case IngestionStatusEnum.FAILED:
      return 'Failed';
    default:
      return 'Unknown';
  }
};

export const IngestionStatus: React.FC<IngestionStatusProps> = ({ documentId }) => {
  const { 
    status, 
    isLoading, 
    error, 
    startIngestion, 
    retryIngestion,
    isStarting,
    isRetrying
  } = useIngestion(documentId);

  if (isLoading) {
    return <Tag icon={<SyncOutlined spin />} color="processing">Loading...</Tag>;
  }

  if (error) {
    return (
      <Space direction="vertical" size="small">
        <Tag color="error" icon={<CloseCircleOutlined />}>
          Error: {error.message}
        </Tag>
        <Button 
          size="small" 
          icon={<ReloadOutlined />} 
          onClick={() => retryIngestion()}
          loading={isRetrying}
        >
          Retry
        </Button>
      </Space>
    );
  }

  if (!status) {
    return (
      <Button 
        type="primary" 
        size="small" 
        onClick={() => startIngestion()}
        loading={isStarting}
      >
        Start Ingestion
      </Button>
    );
  }

  const isProcessing = status.status === IngestionStatusEnum.PROCESSING;
  const isFailed = status.status === IngestionStatusEnum.FAILED;
  const isCompleted = status.status === IngestionStatusEnum.COMPLETED;

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Tag 
        color={getStatusColor(status.status)} 
        icon={getStatusIcon(status.status)}
      >
        {getStatusText(status.status)}
      </Tag>

      {isProcessing && (
        <Progress 
          percent={99} 
          status="active" 
          size="small" 
          showInfo={false}
        />
      )}

      {isFailed && (
        <Space direction="vertical" size="small">
          <Tooltip title={status.error || 'Unknown error'}>
            <Tag color="error">Error: {status.error || 'Failed'}</Tag>
          </Tooltip>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={() => retryIngestion()}
            loading={isRetrying}
          >
            Retry
          </Button>
        </Space>
      )}

      {isCompleted && status.metadata && (
        <Space direction="vertical" size="small">
          {status.metadata.pageCount && (
            <Tag>Pages: {status.metadata.pageCount}</Tag>
          )}
          {status.metadata.wordCount && (
            <Tag>Words: {status.metadata.wordCount}</Tag>
          )}
          {status.metadata.language && (
            <Tag>Language: {status.metadata.language}</Tag>
          )}
          {status.metadata.processedAt && (
            <Tag>Processed: {new Date(status.metadata.processedAt).toLocaleString()}</Tag>
          )}
        </Space>
      )}
    </Space>
  );
}; 