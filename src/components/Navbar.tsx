import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t } = useLanguage();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'var(--card-bg)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#6366f1' }}>
          <Layers size={24} />
          <span>CryptoSphere</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '1.5rem', fontWeight: '500' }}>
          <Link to="/" style={{ transition: 'color 0.2s' }}>{t('market')}</Link>
          <Link to="/movers" style={{ transition: 'color 0.2s' }}>{t('gainersLosers')}</Link>
          <Link to="/convert" style={{ transition: 'color 0.2s' }}>{t('convert')}</Link>
          <Link to="/portfolio" style={{ transition: 'color 0.2s' }}>{t('portfolio')}</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </nav>
  );
};