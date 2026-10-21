import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { authApi } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await authApi.post("/api/auth/register", form);
      console.log("Registration successful:", res.data);
      toast.success('Registration successful! Please log in.');
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
      toast.error(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "450px",
      margin: "3rem auto",
      padding: "2rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ 
          fontSize: "1.8rem", 
          color: "#2e7d32", 
          fontWeight: "600",
          marginBottom: "0.5rem"
        }}>
          Create Account
        </h2>
        <p style={{ color: "#666" }}>Join Plant Disease Detector to identify and treat plant diseases</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1.2rem" }}>
          <label 
            htmlFor="username" 
            style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontSize: "0.9rem", 
              color: "#555",
              fontWeight: "500"
            }}
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.2s ease",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "1.2rem" }}>
          <label 
            htmlFor="email" 
            style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontSize: "0.9rem", 
              color: "#555",
              fontWeight: "500"
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.2s ease",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label 
            htmlFor="password" 
            style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              fontSize: "0.9rem", 
              color: "#555",
              fontWeight: "500"
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "1rem",
              outline: "none",
              transition: "border-color 0.2s ease",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        {error && (
          <div style={{ 
            color: "#d32f2f", 
            padding: "0.8rem", 
            marginBottom: "1.5rem",
            backgroundColor: "#ffebee",
            borderRadius: "4px",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.9rem",
            backgroundColor: loading ? "#93c893" : "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {loading ? (
            <>
              <div style={{ 
                width: "20px", 
                height: "20px", 
                border: "3px solid rgba(255,255,255,0.3)",
                borderTop: "3px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginRight: "10px"
              }}></div>
              Creating Account...
            </>
          ) : (
            "Register"
          )}
        </button>
        
        <div style={{ 
          marginTop: "1.5rem", 
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#666"
        }}>
          Already have an account?{" "}
          <Link to="/login" style={{ 
            color: "#2e7d32", 
            textDecoration: "none",
            fontWeight: "500"
          }}>
            Login
          </Link>
        </div>
      </form>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          border-color: #2e7d32;
          box-shadow: 0 0 0 1px #2e7d32;
        }
      `}</style>
    </div>
  );
};

export default Register;
