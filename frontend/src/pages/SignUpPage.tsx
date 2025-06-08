import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/session';
import { authApi } from '../api/auth';

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useSessionStore();
  const [form] = Form.useForm<SignUpFormValues>();

  const handleSubmit = async (values: SignUpFormValues) => {
    try {
      const response = await authApi.register({
        email: values.email,
        password: values.password,
      });
      setSession(response.user, response.accessToken, response.refreshToken);
      message.success('Registration successful');
      navigate('/documents');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <Form
          form={form}
          name="signup"
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
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
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
              Sign up
            </Button>
          </Form.Item>

          <div className="text-center">
            <Button type="link" onClick={() => navigate('/login')}>
              Already have an account? Sign in
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}; 