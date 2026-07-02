import axios, { type AxiosRequestConfig } from 'axios';
import type { MarketCoin } from '../utils/marketCache';

export const COINGECKO_BASE = import.meta.env.DEV
  ? '/api/coingecko'
  : 'https://api.coingecko.com/api/v3';

const MIN_REQUEST_GAP_MS = 1500;

let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = Math.max(0, MIN_REQUEST_GAP_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
    return task();
  });

  queue = run.catch(() => {});
  return run;
}

export function queuedCoinGeckoGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return enqueue(() => axios.get<T>(url, config).then((res) => res.data));
}

export function fetchMarketCoins(signal?: AbortSignal) {
  return queuedCoinGeckoGet<MarketCoin[]>(`${COINGECKO_BASE}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 50,
      page: 1,
      sparkline: true,
    },
    signal,
  });
}

export function fetchSimplePrices(ids: string[], signal?: AbortSignal) {
  return queuedCoinGeckoGet<Record<string, { usd: number }>>(`${COINGECKO_BASE}/simple/price`, {
    params: { ids: ids.join(','), vs_currencies: 'usd' },
    signal,
  });
}

export function fetchCoinDetails(coinId: string, signal?: AbortSignal) {
  return queuedCoinGeckoGet<Record<string, unknown>>(`${COINGECKO_BASE}/coins/${coinId}`, {
    signal,
  });
}

export function fetchCoinChart(coinId: string) {
  return queuedCoinGeckoGet<{ prices: [number, number][] }>(
    `${COINGECKO_BASE}/coins/${coinId}/market_chart`,
    { params: { vs_currency: 'usd', days: 90 } }
  );
}

export function fetchCoinMeta(coinId: string) {
  return queuedCoinGeckoGet<{ id: string; name: string; symbol: string }>(
    `${COINGECKO_BASE}/coins/${coinId}`
  );
}
