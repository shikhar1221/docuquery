import React, { useState } from 'react';
import { TextField, Button, CircularProgress, Typography, Container, Paper } from '@mui/material';
import { authService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear submit error/success when user makes changes
    if (submitError) setSubmitError('');
    if (submitSuccess) setSubmitSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        const credentials = {
          email: formData.email,
          password: formData.password
        };
        
        // Call login API
        const response = await authService.login(credentials);
        
        // Show success message
        setSubmitSuccess(true);
        console.log('Login successful:', response);
        
        // Store user info if available
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Use React Router navigation instead of page reload
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        
      } catch (error) {
        console.error('Login error:', error);
        
        // Display more specific error message if available
        if (error.message) {
          setSubmitError(error.message);
        } else if (typeof error === 'string') {
          setSubmitError(error);
        } else {
          setSubmitError('An error occurred during sign in. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden"
      style={{
        fontFamily: 'Inter, "Noto Sans", sans-serif',
      }}
    >
      <div className="flex h-full grow flex-col">
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
        </header>
        
        <Container maxWidth="sm" className="py-8">
          <Paper elevation={3} className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
            <Typography variant="h4" align="center" className="mb-6 font-bold text-gray-800">
              Sign in to your account
            </Typography>
            
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
                <Typography variant="body1">
                  Sign in successful! Redirecting you to dashboard...
                </Typography>
              </div>
            )}
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
                <Typography variant="body1">
                  {submitError}
                </Typography>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting}
                required
                className="rounded-lg"
                InputProps={{
                  className: 'rounded-lg',
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isSubmitting}
                required
                className="rounded-lg"
                InputProps={{
                  className: 'rounded-lg',
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                className="mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} color="inherit" className="mr-2" />
                    Processing...
                  </>
                ) : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800">
                  Sign up
                </Link>
              </Typography>
            </div>
          </Paper>
        </Container>
      </div>
    </div>
  );
}

export default SignIn;