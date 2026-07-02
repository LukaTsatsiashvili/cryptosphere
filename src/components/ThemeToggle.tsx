import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        color: 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem',
        borderRadius: '50%',
        transition: 'background-color 0.2s'
      }}
      title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};