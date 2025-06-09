import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import DocumentManagementPage from './pages/DocumentManagementPage';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { QnAPage } from './pages/QnAPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Navigate to="/documents" replace />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DocumentManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qna"
              element={
                <ProtectedRoute>
                  <Layout>
                    <QnAPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
