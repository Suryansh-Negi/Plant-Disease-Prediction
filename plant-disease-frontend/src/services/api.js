// src/services/api.js
import axios from "axios";

// Get backend URLs from environment variables or use defaults
const ML_BACKEND_URL = process.env.REACT_APP_ML_BACKEND_URL || "http://localhost:5000";
const AUTH_BACKEND_URL = process.env.REACT_APP_AUTH_BACKEND_URL || "http://localhost:5001";

console.log('ML Backend URL:', ML_BACKEND_URL);
console.log('Auth Backend URL:', AUTH_BACKEND_URL);

// Create axios instance for ML predictions
const mlApi = axios.create({
  baseURL: ML_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for authentication
const authApi = axios.create({
  baseURL: AUTH_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token refresh functionality
const refreshToken = (error) => {
  const shouldLogout = error?.response?.status === 401 ||
    (error?.response?.data?.error && 
     (error.response.data.error.includes("expired") || 
      error.response.data.error.includes("Invalid token")));
      
  if (shouldLogout) {
    console.log("Token is invalid or expired. Logging out...");
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  
  return Promise.reject(error);
};

// Add request interceptor to both instances
const addRequestInterceptor = (api) => {
  api.interceptors.request.use(
    (config) => {
      console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
      console.log('Request headers:', config.headers);
      
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      console.error("Request error:", error);
      return Promise.reject(error);
    }
  );
};

// Add response interceptor to both instances
const addResponseInterceptor = (api) => {
  api.interceptors.response.use(
    (response) => {
      console.log(`Response from ${response.config.url}:`, response.status);
      return response;
    },
    (error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response error data:", error.response.data);
        console.error("Response error status:", error.response.status);
        console.error("Response error headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
      }
      
      if (!error.config.url.includes('/auth/')) {
        return refreshToken(error);
      }
      
      return Promise.reject(error);
    }
  );
};

// Add interceptors to both instances
addRequestInterceptor(mlApi);
addRequestInterceptor(authApi);
addResponseInterceptor(mlApi);
addResponseInterceptor(authApi);

export { mlApi, authApi };

