import React, { useEffect, useRef, useState } from 'react';
import type { MarketCoin } from '../utils/marketCache';
import { useLanguage } from '../context/LanguageContext';

interface CoinSelectProps {
  coins: MarketCoin[];
  value: string;
  onChange: (coinId: string) => void;
  disabled?: boolean;
  label?: string;
}

export const CoinSelect: React.FC<CoinSelectProps> = ({
  coins,
  value,
  onChange,
  disabled = false,
  label,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = coins.find((coin) => coin.id === value);

  const filtered = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (coinId: string) => {
    onChange(coinId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: '1.2rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.4rem',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
        }}
      >
        {label ?? t('selectCoin')}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-color)',
          color: 'var(--text-main)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          textAlign: 'left',
        }}
      >
        {selected ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src={selected.image} alt="" style={{ width: '20px', height: '20px' }} />
            {selected.name} ({selected.symbol.toUpperCase()})
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>{t('selectCoinPlaceholder')}</span>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 10,
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            overflow: 'hidden',
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            autoFocus
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: 'none',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
              color: 'var(--text-main)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p
                style={{
                  padding: '0.75rem',
                  margin: 0,
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                }}
              >
                {t('noResults')}
              </p>
            ) : (
              filtered.map((coin) => (
                <button
                  key={coin.id}
                  type="button"
                  onClick={() => handleSelect(coin.id)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    border: 'none',
                    background: coin.id === value ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (coin.id !== value) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (coin.id !== value) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <img src={coin.image} alt="" style={{ width: '22px', height: '22px' }} />
                  <span style={{ flex: 1 }}>{coin.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {coin.symbol.toUpperCase()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
