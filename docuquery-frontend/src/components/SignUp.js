import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Typography, Container, Paper } from '@mui/material';

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Viewer'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        console.log('Form submitted:', formData);
        setIsSubmitting(false);
        // Here you would typically redirect or show success message
      }, 1500);
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
              Create your account
            </Typography>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormControl fullWidth error={!!errors.email}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="Your email address"
                  variant="outlined"
                  className="rounded-lg"
                  InputProps={{
                    className: 'rounded-lg',
                  }}
                  fullWidth
                />
              </FormControl>
              
              <FormControl fullWidth error={!!errors.password}>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  placeholder="Create a password"
                  variant="outlined"
                  className="rounded-lg"
                  InputProps={{
                    className: 'rounded-lg',
                  }}
                  fullWidth
                />
              </FormControl>
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                  className="rounded-lg"
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Viewer">Viewer</MenuItem>
                  <MenuItem value="Editor">Editor</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                fullWidth
                className="mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} color="inherit" className="mr-2" />
                    Processing...
                  </>
                ) : 'Sign Up'}
              </Button>
            </form>
            
            <Typography variant="body2" align="center" className="mt-4 text-gray-600">
              Already have an account?{' '}
              <Button 
                onClick={() => console.log('Navigate to sign in')} 
                color="primary" 
                className="p-0 font-medium"
              >
                Sign in
              </Button>
            </Typography>
          </Paper>
        </Container>
      </div>
    </div>
  );
}

export default SignUp;