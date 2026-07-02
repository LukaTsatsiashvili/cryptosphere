  # CryptoSphere

  A responsive cryptocurrency tracking web application built with React and TypeScript. CryptoSphere lets users browse
  live market data, view detailed coin statistics with price charts, track top gainers and losers, convert between
  cryptocurrencies, and manage a personal portfolio — all with light/dark themes and bilingual support (Georgian /
  English).
  
  ## ✨ Features

  - **Live Market Data** — Real-time cryptocurrency prices, market cap, and 24h change powered by the CoinGecko API.
  - **Coin Details** — Dedicated page for each coin with an interactive price chart, market cap, volume, 24h high/low,
  and description.
  - **Top Movers** — View the biggest gainers and losers over the last 24 hours.
  - **Currency Converter** — Convert amounts between different cryptocurrencies with live rates.
  - **Portfolio Tracker** — Add assets and quantities to track your total balance; data persists in the browser via
  `localStorage`.
  - **Responsive Design** — Fully responsive layout with a collapsible hamburger navigation menu on mobile devices.
  - **Dark / Light Theme** — Toggle between themes; preference is saved locally.
  - **Bilingual (i18n)** — Switch between Georgian (ქართული) and English.

  ---

  ## 🛠️ Tech Stack

  | Category | Technology |
  |----------|-----------|
  | Framework | [React 19](https://react.dev/) |
  | Language | [TypeScript](https://www.typescriptlang.org/) |
  | Build Tool | [Vite](https://vitejs.dev/) |
  | Routing | [React Router DOM v7](https://reactrouter.com/) |
  | HTTP Client | [Axios](https://axios-http.com/) |
  | Animations | [Framer Motion](https://www.framer.com/motion/) |
  | Icons | [Lucide React](https://lucide.dev/) |
  | Styling | [Sass (SCSS)](https://sass-lang.com/) + CSS Variables |
  | Linting | [Oxlint](https://oxc.rs/docs/guide/usage/linter) |
  | Data Source | [CoinGecko API](https://www.coingecko.com/en/api) |

  ---

  ## 📋 Prerequisites

  - **Node.js** version 20.19+ or 22+ (required by Vite 8)
  - **npm** (comes bundled with Node.js)

  Check your version with:

  ```bash
  node -v
  ```

  ---

  ## 🚀 Getting Started

  1. **Clone the repository**

     ```bash
     git clone https://github.com/LukaTsatsiashvili/cryptosphere.git
     cd cryptosphere
     ```

  2. **Install dependencies**

     ```bash
     npm install
     ```

  3. **Start the development server**

     ```bash
     npm run dev
     ```

     Open the URL shown in the terminal (usually [http://localhost:5173](http://localhost:5173)) in your browser.

  ---

  ## 📜 Available Scripts

  | Command | Description |
  |---------|-------------|
  | `npm run dev` | Start the Vite development server with hot reload. |
  | `npm run build` | Type-check and build the app for production into the `dist/` folder. |
  | `npm run preview` | Preview the production build locally. |
  | `npm run lint` | Run Oxlint to check code quality. |

  ---

  ## 📁 Project Structure

  ```
  cryptosphere/
  ├── src/
  │   ├── components/      # Reusable UI components (Navbar, ThemeToggle, PriceChart, etc.)
  │   ├── context/         # React Context providers (Theme, Language, Coins, Portfolio)
  │   ├── pages/           # Route pages (Market, CoinDetails, TopMovers, Conversion, Portfolio)
  │   ├── services/        # API layer (CoinGecko requests, chart data)
  │   ├── hooks/           # Custom hooks (useLocalStorage)
  │   ├── utils/           # Caching helpers
  │   ├── styles/          # Global SCSS and variables
  │   ├── App.tsx          # App root with routing setup
  │   └── main.tsx         # Application entry point
  ├── index.html
  ├── package.json
  └── vite.config.ts
  ```

  ---

  ## 🌐 API

  This project uses the free, public [CoinGecko API](https://www.coingecko.com/en/api) to fetch market data. No API key
  is required for the endpoints used.

  ---

  ## 📝 License

  This project was created for educational purposes.
