import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
}

export type ConvertResult =
  | { ok: true }
  | { ok: false; error: 'invalid' | 'sameCoin' | 'notOwned' | 'insufficient' };

type PortfolioContextType = {
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  getAsset: (id: string) => Asset | undefined;
  convertAsset: (params: {
    fromId: string;
    toId: string;
    toMeta: { name: string; symbol: string };
    fromAmount: number;
    toAmount: number;
  }) => ConvertResult;
};

const DUST_EPSILON = 1e-9;

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useLocalStorage<Asset[]>('portfolio_assets', []);

  const addAsset = (newAsset: Asset) => {
    setAssets((prev: Asset[]) => {
      const existing = prev.find((a) => a.id === newAsset.id);
      if (existing) {
        return prev.map((a) =>
          a.id === newAsset.id ? { ...a, quantity: a.quantity + newAsset.quantity } : a
        );
      }
      return [...prev, newAsset];
    });
  };

  const removeAsset = (id: string) => {
    setAssets((prev: Asset[]) => prev.filter((a) => a.id !== id));
  };

  const getAsset = (id: string) => assets.find((a) => a.id === id);

  const convertAsset: PortfolioContextType['convertAsset'] = ({
    fromId,
    toId,
    toMeta,
    fromAmount,
    toAmount,
  }) => {
    if (!(fromAmount > 0) || !(toAmount > 0)) return { ok: false, error: 'invalid' };
    if (fromId === toId) return { ok: false, error: 'sameCoin' };

    const fromAsset = assets.find((a) => a.id === fromId);
    if (!fromAsset) return { ok: false, error: 'notOwned' };
    if (fromAsset.quantity + DUST_EPSILON < fromAmount) {
      return { ok: false, error: 'insufficient' };
    }

    setAssets((prev: Asset[]) => {
      const debited = prev
        .map((a) => (a.id === fromId ? { ...a, quantity: a.quantity - fromAmount } : a))
        .filter((a) => a.quantity > DUST_EPSILON);

      const existingTo = debited.find((a) => a.id === toId);
      if (existingTo) {
        return debited.map((a) =>
          a.id === toId ? { ...a, quantity: a.quantity + toAmount } : a
        );
      }
      return [...debited, { id: toId, name: toMeta.name, symbol: toMeta.symbol, quantity: toAmount }];
    });

    return { ok: true };
  };

  return (
    <PortfolioContext.Provider
      value={{ assets, addAsset, removeAsset, getAsset, convertAsset }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};