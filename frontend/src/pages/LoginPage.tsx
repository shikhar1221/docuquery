import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/session';
import { authApi } from '../api/auth';

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useSessionStore();
  const [form] = Form.useForm<LoginFormValues>();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const response = await authApi.login(values);
      setSession(response.user, response.accessToken, response.refreshToken);
      message.success('Login successful');
      navigate('/documents');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
            >
              Sign in
            </Button>
          </Form.Item>

          <div className="text-center">
            <Button type="link" onClick={() => navigate('/signup')}>
              Don't have an account? Sign up
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};