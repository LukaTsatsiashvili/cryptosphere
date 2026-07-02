import {
  readCoinChartCache,
  readStaleCoinChartCache,
  writeCoinChartCache,
} from '../utils/coinDetailsCache';
import { fetchCoinChart } from '../services/coinGeckoApi';

export type ChartPeriod = 7 | 30 | 90;

const DAY_MS = 24 * 60 * 60 * 1000;
const memoryCache = new Map<string, [number, number][]>();
const inflightRequests = new Map<string, Promise<[number, number][] | null>>();

function sliceChartData(data: [number, number][], days: ChartPeriod): [number, number][] {
  const cutoff = Date.now() - days * DAY_MS;
  const filtered = data.filter(([timestamp]) => timestamp >= cutoff);
  return filtered.length >= 2 ? filtered : data;
}

export function sparklineToChartData(sparkline: number[]): [number, number][] {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  return sparkline.map((price, index) => [
    now - (sparkline.length - 1 - index) * hourMs,
    price,
  ]);
}

export function getCachedFullChart(coinId: string): [number, number][] | null {
  const fromMemory = memoryCache.get(coinId);
  if (fromMemory && fromMemory.length >= 2) return fromMemory;

  const fromSession = readCoinChartCache(coinId) ?? readStaleCoinChartCache(coinId);
  if (fromSession && fromSession.length >= 2) {
    memoryCache.set(coinId, fromSession);
    return fromSession;
  }

  return null;
}

function storeFullChart(coinId: string, prices: [number, number][]): void {
  if (prices.length < 2) return;
  memoryCache.set(coinId, prices);
  writeCoinChartCache(coinId, prices);
}

export function getChartForPeriod(
  coinId: string,
  period: ChartPeriod,
  sparkline?: number[]
): [number, number][] {
  const fullChart = getCachedFullChart(coinId);
  if (fullChart) return sliceChartData(fullChart, period);

  if (period === 7 && sparkline && sparkline.length >= 2) {
    return sparklineToChartData(sparkline);
  }

  return [];
}

export function ensureFullChart(coinId: string): Promise<[number, number][] | null> {
  const cached = getCachedFullChart(coinId);
  if (cached) return Promise.resolve(cached);

  const inflight = inflightRequests.get(coinId);
  if (inflight) return inflight;

  const request = fetchCoinChart(coinId)
    .then((data) => {
      if (data.prices.length >= 2) {
        storeFullChart(coinId, data.prices);
        return data.prices;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      inflightRequests.delete(coinId);
    });

  inflightRequests.set(coinId, request);
  return request;
}

export function hasFullChart(coinId: string): boolean {
  return getCachedFullChart(coinId) !== null;
}
