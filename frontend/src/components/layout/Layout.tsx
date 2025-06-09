import React from 'react';
import { Layout as AntLayout, Menu, Button, Space, Avatar, Dropdown } from 'antd';
import { Grid } from 'antd';
const { useBreakpoint } = Grid;
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FileOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useSessionStore } from '../../store/session';

const { Header, Content, Sider } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useSessionStore();
  const screens = useBreakpoint();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/documents',
      icon: <FileOutlined />,
      label: <Link to="/documents">Documents</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">Users</Link>,
    },
    {
      key: '/qna',
      icon: <FileOutlined />,
      label: <Link to="/qna">Q&A</Link>,
    },
  ];

  return (
      <AntLayout className="min-h-screen transition-all duration-200 ease-in-out">
        <Header className="flex items-center justify-between bg-white shadow-md px-4 sm:px-6 lg:px-8">
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="flex-1 min-w-0"
          />

          <Space>
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space className="cursor-pointer">
                  <Avatar icon={<UserOutlined />} />
                  <span>{user.email}</span>
                </Space>
              </Dropdown>
            ) : (
              <Space>
                <Button type="link" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button type="primary" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </Space>
            )}
          </Space>
        </Header>
        <Content className="bg-gray-100 min-h-[calc(100vh-64px)]">
          <div className="bg-white rounded-lg shadow-md min-h-[calc(100vh-128px)]">
            {children}
          </div>
        </Content>
      </AntLayout>
  );
};