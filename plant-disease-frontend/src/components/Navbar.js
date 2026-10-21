import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from 'react-toastify';
import "./Navbar.css";

const Navbar = ({ isAuthenticated }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useContext(ThemeContext);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.info('You have been logged out');
    navigate("/login");
    // Force refresh to update auth state throughout app
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🌿</span>
          <span className="navbar-logo-text">Plant Disease Detector</span>
        </Link>
      </div>
      
      {/* Mobile menu button */}
      <div 
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <div className="menu-line"></div>
        <div className="menu-line"></div>
        <div className="menu-line"></div>
      </div>
      
      {/* Desktop menu */}
      <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {token ? (
          <>
            <Link to="/upload" className={`nav-link ${isActive("/upload") ? 'active' : ''}`}>
              Upload
            </Link>
            <Link to="/history" className={`nav-link ${isActive("/history") ? 'active' : ''}`}>
              History
            </Link>
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${isActive("/login") ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/register" className={`nav-link ${isActive("/register") ? 'active' : ''}`}>
              Register
            </Link>
          </>
        )}
        
        <div className="theme-switcher-container">
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
