export interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap?: number;
  total_volume?: number;
  sparkline_in_7d?: { price: number[] };
}

const CACHE_KEY = 'cached_market_coins';
const CACHE_TTL_MS = 60_000;

interface CachedMarket {
  data: MarketCoin[];
  timestamp: number;
}

export function readMarketCache(): MarketCoin[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed: CachedMarket = JSON.parse(raw);
    if (!parsed.data || !Array.isArray(parsed.data)) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    if (!parsed.data.some((coin) => coin.sparkline_in_7d?.price?.length)) return null;

    return parsed.data;
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function readStaleMarketCache(): MarketCoin[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed: CachedMarket = JSON.parse(raw);
    if (!parsed.data || !Array.isArray(parsed.data)) return null;

    return parsed.data;
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function writeMarketCache(data: MarketCoin[]): void {
  const payload: CachedMarket = { data, timestamp: Date.now() };
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export function pricesFromMarketCoins(
  coins: MarketCoin[]
): Record<string, { usd: number }> {
  return coins.reduce<Record<string, { usd: number }>>((acc, coin) => {
    if (coin.current_price != null) {
      acc[coin.id] = { usd: coin.current_price };
    }
    return acc;
  }, {});
}
