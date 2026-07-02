import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCoins } from '../context/CoinsContext';

export const Market: React.FC = () => {
  const { t } = useLanguage();
  const { marketCoins, marketLoading, marketError, refreshMarket } = useCoins();
  const [search, setSearch] = useState('');

  const filteredCoins = marketCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (marketLoading && marketCoins.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {marketError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span>{marketError}</span>
          <button
            onClick={refreshMarket}
            style={{
              padding: '0.4rem 0.8rem',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {t('retry')}
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder={t('searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '0.8rem 1rem',
          marginBottom: '1.5rem',
          width: '100%',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          background: 'var(--card-bg)',
          color: 'var(--text-main)',
          outline: 'none',
        }}
      />

      {filteredCoins.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
          {marketCoins.length === 0 ? t('noCoins') : t('noResults')}
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filteredCoins.map((coin) => (
            <Link
              to={`/coin/${coin.id}`}
              key={coin.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                background: 'var(--card-bg)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={coin.image} alt={coin.name} style={{ width: '32px', height: '32px' }} />
                <span style={{ fontWeight: '500' }}>
                  {coin.name}{' '}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ({coin.symbol.toUpperCase()})
                  </span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <span style={{ fontWeight: '600' }}>${coin.current_price.toLocaleString()}</span>
                <span
                  style={{
                    color: coin.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: '500',
                    minWidth: '70px',
                    textAlign: 'right',
                  }}
                >
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
