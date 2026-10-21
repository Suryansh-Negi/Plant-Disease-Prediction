import React, { useState } from "react";
import { authApi } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const Login = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await authApi.post("/api/auth/login", form);
      console.log("Login successful:", res.data);
      
      // Store the token in localStorage
      localStorage.setItem("token", res.data.token);
      
      // Update auth state in parent component
      setIsAuthenticated(true);
      
      // Show success toast
      toast.success(`Welcome back, ${form.email}!`);
      
      // Navigate to the upload page
      navigate("/upload");
    } catch (err) {
      console.error("Login failed:", err);
      const errorMsg = err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Login</h2>
      
      {error && (
        <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ 
              width: "100%", 
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc" 
            }}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ 
              width: "100%", 
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc" 
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.5rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
