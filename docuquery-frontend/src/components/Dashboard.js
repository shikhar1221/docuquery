import React, { useState, useEffect } from 'react';
import { Typography, Button, Container, Paper, CircularProgress } from '@mui/material';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in by looking for token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Redirect to login if no token
      navigate('/signin');
      return;
    }

    // Try to get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Simulate fetching user profile data
    // In a real app, you would make an API call to get the latest user data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      // Use the onLogout prop to update App state
      if (onLogout) {
        onLogout();
      } else {
        // Fallback if prop is not provided
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/signin');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f5] px-10 py-3 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-4 text-[#111518]">
          <div className="size-5 text-blue-600">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <Typography variant="h6" className="text-[#111518] font-bold leading-tight tracking-[-0.015em]">
            DocuQuery
          </Typography>
        </div>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleLogout}
          disabled={loading}
        >
          Logout
        </Button>
      </header>

      <Container maxWidth="lg" className="py-8">
        <Paper elevation={3} className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
          <Typography variant="h4" className="mb-6 font-bold text-gray-800">
            Dashboard
          </Typography>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
              <Typography variant="body1">{error}</Typography>
            </div>
          )}
          
          <div className="mb-6">
            <Typography variant="h6" className="mb-2">
              Welcome to DocuQuery!
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              You are now signed in. This is your dashboard where you can manage your documents and queries.
            </Typography>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <Typography variant="h6" className="mb-2">
              Account Information
            </Typography>
            <Typography variant="body1" className="mb-1">
              <strong>Email:</strong> {user?.email || 'Not available'}
            </Typography>
            <Typography variant="body1">
              <strong>Role:</strong> {user?.roles?.join(', ') || 'Standard User'}
            </Typography>
          </div>
          
          <div className="mt-8">
            <Typography variant="h6" className="mb-4">
              Quick Actions
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="contained" color="primary" className="py-3">
                Upload Document
              </Button>
              <Button variant="contained" color="secondary" className="py-3">
                Create Query
              </Button>
              <Button variant="outlined" className="py-3">
                View History
              </Button>
            </div>
          </div>
        </Paper>
      </Container>
    </div>
  );
}

export default Dashboard;