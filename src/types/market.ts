export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'bonds' | 'etfs';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  sector?: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  volumeNumeric: number;
  marketCap?: string;
  marketCapNumeric?: number;
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
  range52w: { low: number; high: number };
  technicalRating: TechnicalRating;
  ratingScores: {
    oscillators: { buy: number; neutral: number; sell: number };
    movingAverages: { buy: number; neutral: number; sell: number };
    summary: TechnicalRating;
  };
  sparkline: number[];
  historicalData: CandleData[];
  description: string;
  currency: string;
  flag?: string;
}

export interface HeatmapItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number; // in billions
  sector: string;
}

export interface HeatmapSector {
  sector: string;
  totalMarketCap: number;
  avgPerformance: number;
  items: HeatmapItem[];
}

export interface EconomicEvent {
  id: string;
  country: string;
  flag: string;
  title: string;
  time: string;
  date: string;
  impact: 'High' | 'Medium' | 'Low';
  actual: string;
  forecast: string;
  previous: string;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  symbols: string[];
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  readTime: string;
  snippet: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
  alertPrice?: number;
  alertDirection?: 'above' | 'below';
  alertTriggered?: boolean;
}

export interface Position {
  id: string;
  symbol: string;
  assetName: string;
  type: 'buy' | 'sell';
  shares: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: number;
}

export interface Portfolio {
  cash: number;
  initialBalance: number;
  positions: Position[];
}
