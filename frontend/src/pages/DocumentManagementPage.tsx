import React, { useState } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import type { Document, CreateDocumentDto } from '../types/document';
import { Button, Table, Modal, Form, Input, Upload, message, Space, Tag } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useSessionStore } from '../store/session';
import { IngestionStatus } from '../components/documents/IngestionStatus';
import { ingestionApi } from '../api/ingestion';

interface FormValues {
  title: string;
  description: string;
}

const DocumentManagementPage: React.FC = () => {
  const { documents, loading, error, uploadDocument, updateDocument, deleteDocument } = useDocuments();
  const { user } = useSessionStore();
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [editForm] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = async (values: FormValues) => {
    if (!fileList[0]?.originFileObj) {
      message.error('Please select a file to upload');
      return;
    }

    try {
      const createData: CreateDocumentDto = {
        title: values.title,
        description: values.description,
        file: fileList[0].originFileObj,
        userId: user?.id.toString() || '',
      };
      await uploadDocument(createData);
      setIsUploadModalVisible(false);
      form.resetFields();
      setFileList([]);
      message.success('Document uploaded successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to upload document');
    }
  };

  const handleEdit = async (values: FormValues) => {
    if (!editingDocument) return;

    try {
      await updateDocument(editingDocument.id, {
        title: values.title,
        description: values.description,
      });
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingDocument(null);
      message.success('Document updated successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to update document');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id);
      message.success('Document deleted successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const handleDownload = (id: number) => {
    // Implementation of handleDownload function
  };

  const handleIngest = async (id: number) => {
    try {
      await ingestionApi.startIngestion(id);
      message.success('Document ingestion started');
    } catch (err) {
      message.error('Failed to start document ingestion: ' + err);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`,
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Ingestion Status',
      key: 'ingestionStatus',
      render: (_: unknown, record: Document) => (
        <IngestionStatus documentId={record.id} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Document) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingDocument(record);
              editForm.setFieldsValue({
                title: record.title,
                description: record.description,
              });
              setIsEditModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id)}
          >
            Download
          </Button>
          <Button
            icon={<FileTextOutlined />}
            type="primary"
            onClick={() => handleIngest(record.id)}
          >
            Ingest
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="max-w-screen-lg mx-auto mb-4">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <Button icon={<UploadOutlined />} type="primary" onClick={() => setIsUploadModalVisible(true)}>
          Upload Document
        </Button>
      </div>

      {error && (
        <div>
          {error}
        </div>
      )}

      <div className="max-w-screen-lg mx-auto">
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          loading={loading}
        />
      </div>

      <Modal
        title="Upload Document"
        open={isUploadModalVisible}
        onCancel={() => {
          setIsUploadModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleUpload} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="file"
            label="File"
            rules={[{ required: true, message: 'Please select a file' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Document"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setEditingDocument(null);
        }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEdit} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentManagementPage;