import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCoins } from '../context/CoinsContext';
import { usePortfolio } from '../context/PortfolioContext';
import type { MarketCoin } from '../utils/marketCache';
import { CoinSelect } from '../components/CoinSelect';

const USD_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%2310b981"/><text x="16" y="22" font-size="18" font-family="Arial" text-anchor="middle" fill="white">$</text></svg>'
  );

const USD_COIN: MarketCoin = {
  id: 'usd',
  name: 'US Dollar',
  symbol: 'usd',
  image: USD_IMAGE,
  current_price: 1,
  price_change_percentage_24h: 0,
};

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '0';
  if (value !== 0 && Math.abs(value) < 0.000001) return value.toExponential(4);
  return value.toLocaleString(undefined, { maximumFractionDigits: 8 });
};

type Feedback = { type: 'success' | 'error'; text: string } | null;

export const Conversion: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { marketCoins, marketLoading } = useCoins();
  const { getAsset, convertAsset } = usePortfolio();

  const options = useMemo(() => [USD_COIN, ...marketCoins], [marketCoins]);

  const [fromId, setFromId] = useState('bitcoin');
  const [toId, setToId] = useState('usd');
  const [amount, setAmount] = useState('1');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const fromCoin = options.find((c) => c.id === fromId);
  const toCoin = options.find((c) => c.id === toId);

  const ownedQuantity = getAsset(fromId)?.quantity ?? 0;

  const numericAmount = parseFloat(amount);
  const hasValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;

  const rate =
    fromCoin && toCoin && toCoin.current_price > 0
      ? fromCoin.current_price / toCoin.current_price
      : null;

  const result = rate != null && hasValidAmount ? numericAmount * rate : null;

  const insufficient = hasValidAmount && numericAmount > ownedQuantity;
  const canConvert =
    fromId !== toId && hasValidAmount && !insufficient && rate != null && ownedQuantity > 0;

  const resetFeedback = () => setFeedback(null);

  const handleSwap = () => {
    setFromId(toId);
    setToId(fromId);
    resetFeedback();
  };

  const handleMax = () => {
    if (ownedQuantity > 0) {
      setAmount(String(ownedQuantity));
      resetFeedback();
    }
  };

  const handleConvert = () => {
    if (!fromCoin || !toCoin) return;

    const outcome = convertAsset({
      fromId,
      toId,
      toMeta: { name: toCoin.name, symbol: toCoin.symbol },
      fromAmount: numericAmount,
      toAmount: result ?? 0,
    });

    if (outcome.ok) {
      navigate('/portfolio');
      return;
    }

    const messages: Record<Exclude<typeof outcome, { ok: true }>['error'], string> = {
      invalid: t('enterAmount'),
      sameCoin: t('sameCoinError'),
      notOwned: t('notOwned'),
      insufficient: t('insufficientBalance'),
    };
    setFeedback({ type: 'error', text: messages[outcome.error] });
  };

  if (marketLoading && marketCoins.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</div>;
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '520px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>{t('conversion')}</h1>

      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.4rem',
          }}
        >
          <span style={{ ...labelStyle, marginBottom: 0 }}>{t('amount')}</span>
          {fromCoin && (
            <button
              type="button"
              onClick={handleMax}
              disabled={ownedQuantity <= 0}
              style={{
                background: 'none',
                border: 'none',
                color: ownedQuantity > 0 ? '#6366f1' : 'var(--text-muted)',
                cursor: ownedQuantity > 0 ? 'pointer' : 'not-allowed',
                fontSize: '0.8rem',
                fontWeight: '600',
                padding: 0,
              }}
            >
              {t('youOwn')}: {formatNumber(ownedQuantity)} {fromCoin.symbol.toUpperCase()} · {t('max')}
            </button>
          )}
        </div>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            resetFeedback();
          }}
          style={{
            width: '100%',
            padding: '0.7rem 0.75rem',
            marginBottom: '1.2rem',
            borderRadius: '6px',
            border: `1px solid ${insufficient ? '#ef4444' : 'var(--border-color)'}`,
            background: 'var(--bg-color)',
            color: 'var(--text-main)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <CoinSelect
          coins={options}
          value={fromId}
          onChange={(id) => {
            setFromId(id);
            resetFeedback();
          }}
          label={t('from')}
        />

        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0 1rem' }}>
          <button
            type="button"
            onClick={handleSwap}
            aria-label={t('swap')}
            title={t('swap')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
              color: '#6366f1',
              cursor: 'pointer',
            }}
          >
            <ArrowUpDown size={18} />
          </button>
        </div>

        <CoinSelect
          coins={options}
          value={toId}
          onChange={(id) => {
            setToId(id);
            resetFeedback();
          }}
          label={t('to')}
        />

        <div
          style={{
            marginTop: '1.2rem',
            padding: '1.2rem',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            {t('result')}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', wordBreak: 'break-all' }}>
            {result != null ? formatNumber(result) : '—'}{' '}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              {toCoin?.symbol.toUpperCase()}
            </span>
          </div>
          {rate != null && fromCoin && toCoin && (
            <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('exchangeRate')}: 1 {fromCoin.symbol.toUpperCase()} = {formatNumber(rate)}{' '}
              {toCoin.symbol.toUpperCase()}
            </div>
          )}
        </div>

        {feedback && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              background:
                feedback.type === 'success'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${
                feedback.type === 'success'
                  ? 'rgba(16, 185, 129, 0.35)'
                  : 'rgba(239, 68, 68, 0.35)'
              }`,
              color: feedback.type === 'success' ? '#10b981' : '#ef4444',
            }}
          >
            {feedback.text}
          </div>
        )}

        <button
          type="button"
          onClick={handleConvert}
          disabled={!canConvert}
          style={{
            width: '100%',
            marginTop: '1.2rem',
            padding: '0.85rem',
            borderRadius: '8px',
            border: 'none',
            background: canConvert ? '#6366f1' : 'var(--border-color)',
            color: canConvert ? 'white' : 'var(--text-muted)',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: canConvert ? 'pointer' : 'not-allowed',
          }}
        >
          {t('convertNow')}
        </button>
      </div>
    </div>
  );
};
