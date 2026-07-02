import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { Layers, Menu, X } from 'lucide-react';
import './Navbar.scss';

export const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <Layers size={24} />
          <span>CryptoSphere</span>
        </Link>

        <div className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
          <Link to="/" onClick={closeMenu}>{t('market')}</Link>
          <Link to="/movers" onClick={closeMenu}>{t('gainersLosers')}</Link>
          <Link to="/convert" onClick={closeMenu}>{t('convert')}</Link>
          <Link to="/portfolio" onClick={closeMenu}>{t('portfolio')}</Link>
        </div>
      </div>

      <div className="navbar__right">
        <div className="navbar__actions">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};
