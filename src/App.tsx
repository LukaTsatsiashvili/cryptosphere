import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { CoinsProvider } from './context/CoinsContext';
import { Navbar } from './components/Navbar';
import { Market } from './pages/Market';
import { Portfolio } from './pages/Portfolio';
import { CoinDetail } from './pages/CoinDetails';
import { Conversion } from './pages/Conversion';
import { TopMovers } from './pages/TopMovers';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CoinsProvider>
          <PortfolioProvider>
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<Market />} />
                <Route path="/convert" element={<Conversion />} />
                <Route path="/movers" element={<TopMovers />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/coin/:id" element={<CoinDetail />} />
                <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}>404 - Page Not Found</div>} />
              </Routes>
            </Router>
          </PortfolioProvider>
        </CoinsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;