import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const THEMES = {
  light: {
    name: 'light',
    background: '#ffffff',
    text: '#333333',
    primary: '#4caf50',
    primaryRGB: '76, 175, 80',
    secondary: '#81c784',
    accent: '#66bb6a',
    surface: '#f8f9fa',
    cardBg: '#ffffff',
    navbarBg: '#4caf50',
    navbarText: '#ffffff',
    border: '#e0e0e0',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    name: 'dark',
    background: '#121212',
    text: '#e0e0e0',
    primary: '#66bb6a',
    primaryRGB: '102, 187, 106',
    secondary: '#81c784',
    accent: '#4caf50',
    surface: '#1e1e1e',
    cardBg: '#2d2d2d',
    navbarBg: '#1e1e1e',
    navbarText: '#e0e0e0',
    border: '#333333',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
  },
  nature: {
    name: 'nature',
    background: '#f5f7e8',
    text: '#2c3e50',
    primary: '#3e8914',
    primaryRGB: '62, 137, 20',
    secondary: '#8dc63f',
    accent: '#6a9b2d',
    surface: '#f5f7e8',
    cardBg: '#ffffff',
    navbarBg: '#3e8914',
    navbarText: '#ffffff',
    border: '#d4e4bc',
    shadow: '0 2px 8px rgba(62, 137, 20, 0.1)',
  }
};

export const ThemeProvider = ({ children }) => {
  // Try to get the theme from localStorage or default to 'light'
  const [themeName, setThemeName] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme && THEMES[savedTheme] ? savedTheme : 'light';
  });

  const theme = THEMES[themeName];

  // Toggle between themes
  const toggleTheme = (newTheme) => {
    setThemeName(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme to document when it changes
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--primary-color-rgb', theme.primaryRGB);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--accent-color', theme.accent);
    document.documentElement.style.setProperty('--background-color', theme.background);
    document.documentElement.style.setProperty('--text-color', theme.text);
    document.documentElement.style.setProperty('--surface-color', theme.surface);
    document.documentElement.style.setProperty('--card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--navbar-bg', theme.navbarBg);
    document.documentElement.style.setProperty('--navbar-text', theme.navbarText);
    document.documentElement.style.setProperty('--border-color', theme.border);
    document.documentElement.style.setProperty('--shadow', theme.shadow);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme, themes: Object.keys(THEMES) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 