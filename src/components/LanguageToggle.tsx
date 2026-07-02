import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value as 'ka' | 'en')}
      style={{ 
        padding: '0.4rem 0.8rem', 
        borderRadius: '6px', 
        background: 'var(--bg-color)', 
        color: 'var(--text-main)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        outline: 'none'
      }}
    >
      <option value="ka">KA</option>
      <option value="en">EN</option>
    </select>
  );
};