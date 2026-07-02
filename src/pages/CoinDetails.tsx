import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCoins } from '../context/CoinsContext';
import { PriceChart } from '../components/PriceChart';
import type { MarketCoin } from '../utils/marketCache';
import { readStaleMarketCache } from '../utils/marketCache';
import {
  readCoinDetailsCache,
  readStaleCoinDetailsCache,
  writeCoinDetailsCache,
} from '../utils/coinDetailsCache';
import { fetchCoinDetails } from '../services/coinGeckoApi';
import {
  type ChartPeriod,
  ensureFullChart,
  getChartForPeriod,
  hasFullChart,
} from '../services/chartDataService';

interface CoinDetails {
  id: string;
  name: string;
  symbol: string;
  image: { large: string } | string;
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h?: { usd: number };
    low_24h?: { usd: number };
    price_change_percentage_24h: number;
    circulating_supply?: number;
  };
  description: { en: string };
}

function findMarketCoin(
  coinId: string,
  getMarketCoin: (id: string) => MarketCoin | undefined
): MarketCoin | undefined {
  return getMarketCoin(coinId) ?? readStaleMarketCache()?.find((c) => c.id === coinId);
}

function marketCoinToDetails(found: MarketCoin): CoinDetails {
  return {
    id: found.id,
    name: found.name,
    symbol: found.symbol,
    image: found.image,
    market_data: {
      current_price: { usd: found.current_price },
      market_cap: { usd: found.market_cap ?? 0 },
      total_volume: { usd: found.total_volume ?? 0 },
      price_change_percentage_24h: found.price_change_percentage_24h,
    },
    description: { en: '' },
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function buildFallbackDescription(coin: CoinDetails): string {
  const price = coin.market_data.current_price.usd;
  const change = coin.market_data.price_change_percentage_24h;
  const cap = formatLargeNumber(coin.market_data.market_cap.usd);
  return `${coin.name} (${coin.symbol.toUpperCase()}) is a cryptocurrency currently trading at $${price.toLocaleString()} with a 24-hour change of ${change >= 0 ? '+' : ''}${change.toFixed(2)}% and a market cap of ${cap}.`;
}

function getDescriptionFromApiData(data: Record<string, unknown>): string {
  const description = data.description as { en?: string } | undefined;
  return description?.en ? stripHtml(description.en) : '';
}

export const CoinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { getMarketCoin } = useCoins();
  const [coin, setCoin] = useState<CoinDetails | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<[number, number][]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>(7);
  const coinRequestId = useRef(0);
  const activeCoinIdRef = useRef<string | undefined>(undefined);
  const chartPeriodRef = useRef<ChartPeriod>(7);
  const loadedCoinRef = useRef<string | null>(null);

  chartPeriodRef.current = chartPeriod;

  const updateChartView = (coinId: string, period: ChartPeriod) => {
    const marketCoin = findMarketCoin(coinId, getMarketCoin);
    const sparkline = marketCoin?.sparkline_in_7d?.price;
    const display = getChartForPeriod(coinId, period, sparkline);

    if (display.length >= 2) {
      setChartData(display);
      setChartLoading(false);
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!id) return;

    const marketCoin = findMarketCoin(id, getMarketCoin);

    const freshDetails = readCoinDetailsCache(id);
    const cachedDetails = freshDetails ?? readStaleCoinDetailsCache(id);

    if (cachedDetails) {
      setCoin(cachedDetails as unknown as CoinDetails);
      const cachedDesc = getDescriptionFromApiData(cachedDetails);
      setDescription(cachedDesc || buildFallbackDescription(cachedDetails as unknown as CoinDetails));
      setLoading(false);
    } else if (marketCoin) {
      const fromMarket = marketCoinToDetails(marketCoin);
      setCoin(fromMarket);
      setDescription(buildFallbackDescription(fromMarket));
      setLoading(false);
    } else {
      setLoading(true);
    }

    if (freshDetails) return;

    const requestId = ++coinRequestId.current;
    const controller = new AbortController();

    fetchCoinDetails(id, controller.signal)
      .then((data) => {
        if (requestId !== coinRequestId.current) return;
        writeCoinDetailsCache(id, data);
        const details = data as unknown as CoinDetails;
        setCoin(details);
        const apiDesc = getDescriptionFromApiData(data);
        setDescription(apiDesc || buildFallbackDescription(details));
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        if (requestId !== coinRequestId.current) return;
        if (!cachedDetails && !marketCoin) {
          setCoin(null);
        }
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    activeCoinIdRef.current = id;
    const coinJustChanged = loadedCoinRef.current !== id;

    if (coinJustChanged) {
      loadedCoinRef.current = id;
      setChartPeriod(7);
      chartPeriodRef.current = 7;
    }

    const activePeriod = coinJustChanged ? 7 : chartPeriod;
    const hasChart = updateChartView(id, activePeriod);

    if (!hasChart) {
      setChartLoading(true);
    }

    if (!hasFullChart(id)) {
      ensureFullChart(id).then(() => {
        if (activeCoinIdRef.current !== id) return;
        const shown = updateChartView(id, chartPeriodRef.current);
        if (!shown) setChartLoading(false);
      });
    }
  }, [id, chartPeriod]);

  if (loading && !coin) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</div>;
  }

  if (!coin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Coin not found.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {t('backToMarket')}
        </button>
      </div>
    );
  }

  const imageSrc = typeof coin.image === 'string' ? coin.image : coin.image.large;
  const isPositive = coin.market_data.price_change_percentage_24h >= 0;
  const periods: ChartPeriod[] = [7, 30, 90];
  const aboutText =
    description ||
    buildFallbackDescription(coin);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: '0.5rem 1rem',
          marginBottom: '2rem',
          background: 'var(--card-bg)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        ← {t('close')}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <img src={imageSrc} alt={coin.name} style={{ width: '64px', height: '64px' }} />
        <div>
          <h1 style={{ margin: 0 }}>
            {coin.name} ({coin.symbol.toUpperCase()})
          </h1>
          <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            ${coin.market_data.current_price.usd.toLocaleString()}
            <span
              style={{
                marginLeft: '0.75rem',
                color: isPositive ? '#10b981' : '#ef4444',
                fontWeight: '600',
              }}
            >
              {isPositive ? '+' : ''}
              {coin.market_data.price_change_percentage_24h.toFixed(2)}%
            </span>
          </p>
        </div>
      </div>

      <div
        style={{
          padding: '1.25rem',
          background: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <h3 style={{ margin: 0 }}>{t('priceChart')}</h3>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: chartPeriod === period ? '#6366f1' : 'transparent',
                  color: chartPeriod === period ? 'white' : 'var(--text-main)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                }}
              >
                {period}D
              </button>
            ))}
          </div>
        </div>
        <PriceChart data={chartData} loading={chartLoading} positive={isPositive} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { label: t('marketCap'), value: formatLargeNumber(coin.market_data.market_cap.usd) },
          { label: t('volume24h'), value: formatLargeNumber(coin.market_data.total_volume.usd) },
          {
            label: t('high24h'),
            value: coin.market_data.high_24h
              ? `$${coin.market_data.high_24h.usd.toLocaleString()}`
              : '—',
          },
          {
            label: t('low24h'),
            value: coin.market_data.low_24h
              ? `$${coin.market_data.low_24h.usd.toLocaleString()}`
              : '—',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: '1rem',
              background: 'var(--card-bg)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
            }}
          >
            <small style={{ color: 'var(--text-muted)' }}>{stat.label}</small>
            <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.1rem' }}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '1.25rem',
          background: 'var(--card-bg)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>{t('about')}</h3>
        <p
          style={{
            margin: 0,
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            fontSize: '0.95rem',
          }}
        >
          {aboutText.length > 600 ? `${aboutText.slice(0, 600)}...` : aboutText}
        </p>
      </div>
    </div>
  );
};
