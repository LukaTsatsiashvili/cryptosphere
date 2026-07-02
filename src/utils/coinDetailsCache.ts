const DETAILS_PREFIX = 'coin_details_';
const CHART_PREFIX = 'coin_chart_';
const DETAILS_CACHE_TTL_MS = 30 * 60 * 1000;
const CHART_CACHE_TTL_MS = 4 * 60 * 60 * 1000;

interface CachedEntry<T> {
  data: T;
  timestamp: number;
}

function readCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: CachedEntry<T> = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > ttlMs) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

function readStaleCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: CachedEntry<T> = JSON.parse(raw);
    return parsed.data ?? null;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

function writeCache<T>(key: string, data: T): void {
  const payload: CachedEntry<T> = { data, timestamp: Date.now() };
  sessionStorage.setItem(key, JSON.stringify(payload));
}

export function readCoinDetailsCache(coinId: string) {
  return readCache<Record<string, unknown>>(`${DETAILS_PREFIX}${coinId}`, DETAILS_CACHE_TTL_MS);
}

export function readStaleCoinDetailsCache(coinId: string) {
  return readStaleCache<Record<string, unknown>>(`${DETAILS_PREFIX}${coinId}`);
}

export function writeCoinDetailsCache(coinId: string, data: Record<string, unknown>): void {
  writeCache(`${DETAILS_PREFIX}${coinId}`, data);
}

export function readCoinChartCache(coinId: string): [number, number][] | null {
  return readCache<[number, number][]>(`${CHART_PREFIX}${coinId}`, CHART_CACHE_TTL_MS);
}

export function readStaleCoinChartCache(coinId: string): [number, number][] | null {
  return readStaleCache<[number, number][]>(`${CHART_PREFIX}${coinId}`);
}

export function writeCoinChartCache(coinId: string, data: [number, number][]): void {
  writeCache(`${CHART_PREFIX}${coinId}`, data);
}
