import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';

interface SignUpFormValues {
  email: string;
  password: string;
}

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: SignUpFormValues) => {
    try {
      await authApi.register({
        email: values.email,
        password: values.password,
        roles: ['viewer'] // Default role as per backend
      });
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <Form
      form={form}
      name="signup"
      onFinish={onFinish}
      layout="vertical"
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' }
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
          { min: 6, message: 'Password must be at least 6 characters!' }
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
              return Promise.reject(new Error('Passwords do not match!'));
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
          className="w-full"
        >
          Sign Up
        </Button>
      </Form.Item>

      <div className="text-center">
        <p>
          Already have an account?{' '}
          <Button 
            type="link" 
            onClick={() => navigate('/login')}
            className="p-0"
          >
            Login
          </Button>
        </p>
      </div>
    </Form>
  );
};

export default SignUpForm;