import React, { useState } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import type { Document, CreateDocumentDto } from '../types/document';
import { Button, Table, Modal, Form, Input, Upload, message, Space, Tag } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useSessionStore } from '../store/session';
import { IngestionStatus } from '../components/documents/IngestionStatus';
import { ingestionApi } from '../api/ingestion';
import { documentsApi } from '../api/documents';

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
    console.log('Attempting to delete document with ID:', id);
    try {
      await deleteDocument(id);
      message.success('Document deleted successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const blob = await documentsApi.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success('Document downloaded successfully');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to download document');
    }
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
            onClick={() => handleDownload(record.id, record.fileName)}
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-screen-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">Document Management</h1>
          <Button
            icon={<UploadOutlined />}
            type="primary"
            onClick={() => setIsUploadModalVisible(true)}
            size="large"
          >
            Upload Document
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={documents}
            loading={loading}
            rowKey="id"
            className="border border-gray-200 rounded-lg shadow-sm"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            rowClassName={() => 'hover:bg-gray-50'}
            components={{
              body: {
                row: (props: any) => <tr {...props} className="text-gray-700" />,
              },
            }}
            onRow={() => ({ className: 'py-3' })}
          />
        </div>

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