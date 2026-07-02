import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCoins } from '../context/CoinsContext';
import type { MarketCoin } from '../utils/marketCache';

const MoverRow: React.FC<{ coin: MarketCoin }> = ({ coin }) => {
  const positive = coin.price_change_percentage_24h >= 0;
  return (
    <Link
      to={`/coin/${coin.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1rem',
        background: 'var(--card-bg)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <img src={coin.image} alt={coin.name} style={{ width: '28px', height: '28px' }} />
        <span
          style={{
            fontWeight: '500',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {coin.name}{' '}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            ({coin.symbol.toUpperCase()})
          </span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <span style={{ fontWeight: '600' }}>${coin.current_price.toLocaleString()}</span>
        <span
          style={{
            color: positive ? '#10b981' : '#ef4444',
            fontWeight: '600',
            minWidth: '72px',
            textAlign: 'right',
          }}
        >
          {positive ? '+' : ''}
          {coin.price_change_percentage_24h.toFixed(2)}%
        </span>
      </div>
    </Link>
  );
};

const MoverColumn: React.FC<{
  title: string;
  icon: React.ReactNode;
  accent: string;
  coins: MarketCoin[];
  emptyLabel: string;
}> = ({ title, icon, accent, coins, emptyLabel }) => (
  <div style={{ flex: 1, minWidth: '280px' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        color: accent,
        fontWeight: '700',
        fontSize: '1.15rem',
      }}
    >
      {icon}
      <span>{title}</span>
    </div>
    {coins.length === 0 ? (
      <p style={{ color: 'var(--text-muted)' }}>{emptyLabel}</p>
    ) : (
      <div style={{ display: 'grid', gap: '0.6rem' }}>
        {coins.map((coin) => (
          <MoverRow key={coin.id} coin={coin} />
        ))}
      </div>
    )}
  </div>
);

export const TopMovers: React.FC = () => {
  const { t } = useLanguage();
  const { marketCoins, marketLoading } = useCoins();

  if (marketLoading && marketCoins.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</div>;
  }

  const sorted = [...marketCoins]
    .filter((c) => typeof c.price_change_percentage_24h === 'number')
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);

  const gainers = sorted.filter((c) => c.price_change_percentage_24h > 0).slice(0, 10);
  const losers = sorted
    .filter((c) => c.price_change_percentage_24h < 0)
    .slice(-10)
    .reverse();

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>{t('gainersLosers')}</h1>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <MoverColumn
          title={t('topGainers')}
          icon={<TrendingUp size={22} />}
          accent="#10b981"
          coins={gainers}
          emptyLabel={t('noData')}
        />
        <MoverColumn
          title={t('topLosers')}
          icon={<TrendingDown size={22} />}
          accent="#ef4444"
          coins={losers}
          emptyLabel={t('noData')}
        />
      </div>
    </div>
  );
};
