import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { themeName, toggleTheme, themes } = useContext(ThemeContext);

  return (
    <div className="theme-switcher">
      <div className="theme-options">
        {themes.map((theme) => (
          <button
            key={theme}
            className={`theme-option ${themeName === theme ? 'active' : ''}`}
            onClick={() => toggleTheme(theme)}
            aria-label={`Switch to ${theme} theme`}
          >
            <span className="theme-dot" data-theme={theme}></span>
            <span className="theme-name">{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher; 