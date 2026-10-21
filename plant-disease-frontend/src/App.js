import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ImageUpload from "./components/ImageUpload";
import History from "./components/History";
import Navbar from "./components/Navbar";
import ThemeProvider from "./context/ThemeContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token and set authentication state
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Token found in localStorage");
      setIsAuthenticated(true);
    } else {
      console.log("No token found in localStorage");
      setIsAuthenticated(false);
    }
    setLoading(false);
    
    // Handle browser close/tab close for automatic logout
    const handleTabClose = () => {
      localStorage.removeItem("token");
    };
    
    // Add event listeners for page unload/visibility change
    window.addEventListener('beforeunload', handleTabClose);
    
    // To handle browser tab visibility change (helps with some mobile browsers)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        localStorage.removeItem("token");
      }
    });
    
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      document.removeEventListener('visibilitychange', handleTabClose);
    };
  }, []);

  // Show welcome message when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Logged in successfully!');
    }
  }, [isAuthenticated]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Navbar isAuthenticated={isAuthenticated} />
          <Routes>
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? "/upload" : "/login"} />}
            />
            <Route 
              path="/login" 
              element={<Login setIsAuthenticated={setIsAuthenticated} />} 
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/upload"
              element={isAuthenticated ? <ImageUpload /> : <Navigate to="/login" />}
            />
            <Route
              path="/history"
              element={isAuthenticated ? <History /> : <Navigate to="/login" />}
            />
          </Routes>
          {/* Toast Container for notifications */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
