import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import './App.css';

// Create AuthContext
export const AuthContext = createContext();

// AuthContext is already created above

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle logout
  // Logout functionality is now handled in the Dashboard component using AuthContext

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" /> : 
                  <SignIn />
              } 
            />
            <Route 
              path="/signin" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" /> : 
                  <SignIn />
              } 
            />
            <Route 
              path="/signup" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" /> : 
                  <SignUp />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                  <Dashboard /> : 
                  <Navigate to="/signin" />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
