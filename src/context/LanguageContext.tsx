import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Language = 'ka' | 'en';

const translations = {
  ka: {
    searchPlaceholder: 'მოძებნე მონეტა...',
    loading: 'იტვირთება...',
    market: 'ბაზარი',
    portfolio: 'პორტფოლიო',
    price: 'ფასი',
    change24h: '24სმ ცვლილება',
    addAsset: 'აქტივის დამატება',
    balance: 'ჯამური ბალანსი',
    quantity: 'რაოდენობა',
    save: 'შენახვა',
    close: 'დახურვა',
    retry: 'თავიდან ცდა',
    noCoins: 'მონეტები ვერ ჩაიტვირთა.',
    noResults: 'შედეგი ვერ მოიძებნა.',
    invalidCoin: 'მონეტა ვერ მოიძებნა. გამოიყენეთ CoinGecko ID (მაგ. bitcoin).',
    unavailable: 'მიუწვდომელი',
    loadingPrices: 'ფასები იტვირთება...',
    backToMarket: 'ბაზარზე დაბრუნება',
    selectCoin: 'აირჩიეთ მონეტა',
    selectCoinPlaceholder: 'აირჩიეთ მონეტა სიიდან',
    priceChart: 'ფასის გრაფიკი',
    marketCap: 'საბაზრო კაპიტალიზაცია',
    volume24h: '24სთ მოცულობა',
    high24h: '24სთ მაქს.',
    low24h: '24სთ მინ.',
    about: 'შესახებ',
    aboutUnavailable: 'აღწერა დროებით მიუწვდომელია.',
    convert: 'კონვერტაცია',
    conversion: 'ვალუტის კონვერტაცია',
    from: 'დან',
    to: 'მდე',
    amount: 'რაოდენობა',
    swap: 'გაცვლა',
    result: 'შედეგი',
    exchangeRate: 'გაცვლის კურსი',
    gainersLosers: 'მოგებულები და წაგებულები',
    topGainers: 'ტოპ მოგებულები',
    topLosers: 'ტოპ წაგებულები',
    noData: 'მონაცემები არ არის.',
    youOwn: 'ფლობთ',
    max: 'მაქს.',
    convertNow: 'კონვერტაცია',
    notOwned: 'თქვენ არ ფლობთ ამ აქტივს.',
    insufficientBalance: 'არასაკმარისი ბალანსი.',
    sameCoinError: 'აირჩიეთ ორი განსხვავებული აქტივი.',
    enterAmount: 'შეიყვანეთ სწორი რაოდენობა.',
    conversionSuccess: 'კონვერტაცია წარმატებით შესრულდა!'
  },
  en: {
    searchPlaceholder: 'Search coin...',
    loading: 'Loading...',
    market: 'Market',
    portfolio: 'Portfolio',
    price: 'Price',
    change24h: '24h Change',
    addAsset: 'Add Asset',
    balance: 'Total Balance',
    quantity: 'Quantity',
    save: 'Save',
    close: 'Close',
    retry: 'Retry',
    noCoins: 'Could not load coins.',
    noResults: 'No results found.',
    invalidCoin: 'Coin not found. Use a valid CoinGecko ID (e.g. bitcoin).',
    unavailable: 'Unavailable',
    loadingPrices: 'Loading prices...',
    backToMarket: 'Back to Market',
    selectCoin: 'Select Coin',
    selectCoinPlaceholder: 'Choose a coin from the list',
    priceChart: 'Price Chart',
    marketCap: 'Market Cap',
    volume24h: '24h Volume',
    high24h: '24h High',
    low24h: '24h Low',
    about: 'About',
    aboutUnavailable: 'Description is temporarily unavailable.',
    convert: 'Convert',
    conversion: 'Currency Conversion',
    from: 'From',
    to: 'To',
    amount: 'Amount',
    swap: 'Swap',
    result: 'Result',
    exchangeRate: 'Exchange Rate',
    gainersLosers: 'Gainers & Losers',
    topGainers: 'Top Gainers',
    topLosers: 'Top Losers',
    noData: 'No data available.',
    youOwn: 'You own',
    max: 'Max',
    convertNow: 'Convert',
    notOwned: "You don't own this asset.",
    insufficientBalance: 'Insufficient balance.',
    sameCoinError: 'Choose two different assets.',
    enterAmount: 'Enter a valid amount.',
    conversionSuccess: 'Conversion successful!'
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('lang', 'ka');

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};