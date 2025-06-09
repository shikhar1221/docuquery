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
    <AntLayout style={{ minHeight: '100vh' }}>

      <AntLayout style={{ marginLeft: 0, transition: 'all 0.2s' }}>
        <Header style={{
          padding: screens.lg ? '0 50px' : '0 16px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0 }}
          />

          <Space>
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
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
        <Content style={{
          margin: screens.lg ? '24px 50px' : '24px 16px',
          padding: screens.lg ? 24 : 16,
          background: '#fff',
          minHeight: 280
        }}> 
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};