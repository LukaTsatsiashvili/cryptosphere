import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useLanguage } from '../context/LanguageContext';
import { useCoins } from '../context/CoinsContext';
import { CoinSelect } from '../components/CoinSelect';
import { motion, AnimatePresence } from 'framer-motion';

export const Portfolio: React.FC = () => {
  const { assets, addAsset, removeAsset } = usePortfolio();
  const { t } = useLanguage();
  const { marketCoins, prices, pricesLoading, loadPrices } = useCoins();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadPrices(assets.map((a) => a.id));
  }, [assets, loadPrices]);

  const totalBalance = assets.reduce((sum, asset) => {
    const price = prices[asset.id]?.usd;
    if (price == null) return sum;
    return sum + asset.quantity * price;
  }, 0);

  const hasUnresolvedPrices = assets.some((asset) => prices[asset.id]?.usd == null);

  const handleOpenModal = () => {
    setValidationError(null);
    setSelectedCoinId(marketCoins[0]?.id ?? '');
    setQuantity(0);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (quantity <= 0 || !selectedCoinId) {
      setValidationError(t('selectCoinPlaceholder'));
      return;
    }

    const selected = marketCoins.find((coin) => coin.id === selectedCoinId);
    if (!selected) {
      setValidationError(t('invalidCoin'));
      return;
    }

    addAsset({
      id: selected.id,
      name: selected.name,
      symbol: selected.symbol,
      quantity,
    });

    setIsModalOpen(false);
    setSelectedCoinId('');
    setQuantity(0);
    setValidationError(null);
  };

  const formatValue = (assetId: string, qty: number) => {
    const price = prices[assetId]?.usd;
    if (pricesLoading && price == null) return '—';
    if (price == null) return t('unavailable');
    return `$${(qty * price).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            {t('balance')}:{' '}
            {pricesLoading && hasUnresolvedPrices
              ? '—'
              : `$${totalBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </h2>
          {pricesLoading && (
            <small style={{ color: 'var(--text-muted)' }}>{t('loadingPrices')}</small>
          )}
        </div>
        <button
          onClick={handleOpenModal}
          disabled={marketCoins.length === 0}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: marketCoins.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            opacity: marketCoins.length === 0 ? 0.6 : 1,
          }}
        >
          {t('addAsset')}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {assets.map((asset) => (
          <div
            key={asset.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              background: 'var(--card-bg)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>
                {asset.name}{' '}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ({asset.symbol.toUpperCase()})
                </span>
              </h4>
              <small style={{ color: 'var(--text-muted)' }}>
                {t('quantity')}: {asset.quantity}
              </small>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontWeight: '600' }}>{formatValue(asset.id, asset.quantity)}</span>
              <button
                onClick={() => removeAsset(asset.id)}
                style={{
                  color: '#ef4444',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {assets.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
            Your portfolio is empty.
          </p>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'var(--card-bg)',
                padding: '2rem',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '420px',
                border: '1px solid var(--border-color)',
              }}
            >
              <h3 style={{ marginBottom: '1rem' }}>{t('addAsset')}</h3>
              <div style={{ margin: '1rem 0' }}>
                <CoinSelect
                  coins={marketCoins}
                  value={selectedCoinId}
                  onChange={(id) => {
                    setSelectedCoinId(id);
                    setValidationError(null);
                  }}
                />
                {validationError && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0 0 0.75rem 0' }}>
                    {validationError}
                  </p>
                )}
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {t('quantity')}
                </label>
                <input
                  type="number"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-main)',
                    outline: 'none',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {t('close')}
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  {t('save')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
