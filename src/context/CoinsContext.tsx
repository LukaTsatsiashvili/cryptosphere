import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import type { MarketCoin } from '../utils/marketCache';
import {
  pricesFromMarketCoins,
  readMarketCache,
  readStaleMarketCache,
  writeMarketCache,
} from '../utils/marketCache';
import {
  fetchCoinMeta,
  fetchMarketCoins,
  fetchSimplePrices,
} from '../services/coinGeckoApi';

type CoinsContextType = {
  marketCoins: MarketCoin[];
  marketLoading: boolean;
  marketError: string | null;
  refreshMarket: () => void;
  getMarketCoin: (id: string) => MarketCoin | undefined;
  resolveCoin: (id: string) => Promise<Pick<MarketCoin, 'id' | 'name' | 'symbol'> | null>;
  prices: Record<string, { usd: number }>;
  pricesLoading: boolean;
  pricesError: string | null;
  loadPrices: (ids: string[]) => void;
};

const CoinsContext = createContext<CoinsContextType | undefined>(undefined);

const BASE_PRICES: Record<string, { usd: number }> = { usd: { usd: 1 } };

export const CoinsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketCoins, setMarketCoins] = useState<MarketCoin[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [prices, setPrices] = useState<Record<string, { usd: number }>>(BASE_PRICES);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesError, setPricesError] = useState<string | null>(null);

  const marketAbortRef = useRef<AbortController | null>(null);
  const pricesAbortRef = useRef<AbortController | null>(null);
  const marketRequestId = useRef(0);
  const pricesRequestId = useRef(0);

  const fetchMarket = useCallback(async (options?: { showLoading?: boolean }) => {
    const showLoading = options?.showLoading ?? false;
    const requestId = ++marketRequestId.current;

    marketAbortRef.current?.abort();
    const controller = new AbortController();
    marketAbortRef.current = controller;

    if (showLoading) setMarketLoading(true);
    setMarketError(null);

    const freshCache = readMarketCache();
    if (freshCache) {
      setMarketCoins(freshCache);
      setMarketLoading(false);
    } else {
      const staleCache = readStaleMarketCache();
      if (staleCache) {
        setMarketCoins(staleCache);
        setMarketLoading(false);
      } else if (showLoading) {
        setMarketLoading(true);
      }
    }

    try {
      const data = await fetchMarketCoins(controller.signal);

      if (requestId !== marketRequestId.current) return;

      setMarketCoins(data);
      writeMarketCache(data);
      setMarketError(null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      if (requestId !== marketRequestId.current) return;

      const staleCache = readStaleMarketCache();
      if (staleCache) {
        setMarketCoins(staleCache);
        setMarketError(null);
      } else {
        setMarketError('Failed to load coins. Please try again.');
      }
    } finally {
      if (requestId === marketRequestId.current) {
        setMarketLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchMarket({ showLoading: true });
    return () => marketAbortRef.current?.abort();
  }, [fetchMarket]);

  const refreshMarket = useCallback(() => {
    fetchMarket({ showLoading: true });
  }, [fetchMarket]);

  const getMarketCoin = useCallback(
    (id: string) => marketCoins.find((coin) => coin.id === id),
    [marketCoins]
  );

  const resolveCoin = useCallback(
    async (id: string): Promise<Pick<MarketCoin, 'id' | 'name' | 'symbol'> | null> => {
      const normalizedId = id.trim().toLowerCase();
      const cached = getMarketCoin(normalizedId);
      if (cached) {
        return { id: cached.id, name: cached.name, symbol: cached.symbol };
      }

      try {
        const data = await fetchCoinMeta(normalizedId);
        return { id: data.id, name: data.name, symbol: data.symbol };
      } catch {
        return null;
      }
    },
    [getMarketCoin]
  );

  const loadPrices = useCallback((ids: string[]) => {
    const uniqueIds = [...new Set(ids.map((id) => id.trim().toLowerCase()).filter(Boolean))]
      .filter((id) => id !== 'usd');

    if (uniqueIds.length === 0) {
      pricesAbortRef.current?.abort();
      setPrices(BASE_PRICES);
      setPricesLoading(false);
      setPricesError(null);
      return;
    }

    const requestId = ++pricesRequestId.current;
    pricesAbortRef.current?.abort();
    const controller = new AbortController();
    pricesAbortRef.current = controller;

    const cachedPrices = pricesFromMarketCoins(marketCoins);
    const optimistic: Record<string, { usd: number }> = {};
    uniqueIds.forEach((id) => {
      if (cachedPrices[id]) optimistic[id] = cachedPrices[id];
    });
    if (Object.keys(optimistic).length > 0) {
      setPrices((prev) => ({ ...prev, ...optimistic }));
    }

    setPricesLoading(true);
    setPricesError(null);

    fetchSimplePrices(uniqueIds, controller.signal)
      .then((res) => {
        if (requestId !== pricesRequestId.current) return;

        if (res && Object.keys(res).length > 0) {
          setPrices((prev) => ({ ...prev, ...res }));
          setPricesError(null);
        } else {
          const fallback = readStaleMarketCache();
          if (fallback) {
            setPrices((prev) => ({ ...prev, ...pricesFromMarketCoins(fallback) }));
            setPricesError(null);
          } else {
            setPricesError('Failed to load prices.');
          }
        }
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        if (requestId !== pricesRequestId.current) return;

        const fallback = readStaleMarketCache();
        if (fallback) {
          setPrices((prev) => ({ ...prev, ...pricesFromMarketCoins(fallback) }));
          setPricesError(null);
        } else {
          setPricesError('Failed to load prices.');
        }
      })
      .finally(() => {
        if (requestId === pricesRequestId.current) {
          setPricesLoading(false);
        }
      });
  }, [marketCoins]);

  return (
    <CoinsContext.Provider
      value={{
        marketCoins,
        marketLoading,
        marketError,
        refreshMarket,
        getMarketCoin,
        resolveCoin,
        prices,
        pricesLoading,
        pricesError,
        loadPrices,
      }}
    >
      {children}
    </CoinsContext.Provider>
  );
};

export const useCoins = () => {
  const context = useContext(CoinsContext);
  if (!context) throw new Error('useCoins must be used within a CoinsProvider');
  return context;
};
