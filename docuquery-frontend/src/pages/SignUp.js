import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Paper, CircularProgress, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      await authService.register(userData);
      setSubmitSuccess('Registration successful! You can now sign in.');
      
      // Navigate to sign in page after a short delay
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container maxWidth="sm">
        <Paper elevation={3} className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <div className="size-12 text-blue-600 mb-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <Typography variant="h4" className="font-bold text-gray-800 text-center">
              Create an Account
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-2 text-center">
              Sign up to start using DocuQuery
            </Typography>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
              <Typography variant="body2">{submitError}</Typography>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
              <Typography variant="body2">{submitSuccess}</Typography>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isSubmitting}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isSubmitting}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={isSubmitting}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="role"
              label="Role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              error={!!formErrors.role}
              helperText={formErrors.role}
              disabled={isSubmitting}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="mt-3 mb-2 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/signin" className="text-blue-600 hover:text-blue-800">
                Sign In
              </Link>
            </Typography>
          </div>
        </Paper>
      </Container>
    </div>
  );
}

export default SignUp;