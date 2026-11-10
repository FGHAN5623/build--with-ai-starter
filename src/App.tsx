import React, { useState, useEffect, useCallback } from 'react';
import { MarketAsset, Portfolio, Position, WatchlistItem, AssetCategory } from './types/market';
import { INITIAL_ASSETS } from './data/mockMarketData';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketOverview } from './components/MarketOverview';
import { AssetClassView } from './components/AssetClassView';
import { HeatmapView } from './components/HeatmapView';
import { ScreenerView } from './components/ScreenerView';
import { InteractiveChart } from './components/InteractiveChart';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { PaperTradingModal } from './components/PaperTradingModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Bell, Check, TrendingUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);

  // Modals & Panels
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  // Theme State (default dark mode for authentic TradingView)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Notifications / Alert toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Watchlist State
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { symbol: 'NVDA', addedAt: Date.now() - 3600000, alertPrice: 155, alertDirection: 'above' },
    { symbol: 'AAPL', addedAt: Date.now() - 7200000 },
    { symbol: 'BTC/USD', addedAt: Date.now() - 10800000, alertPrice: 90000, alertDirection: 'above' },
    { symbol: 'SPX', addedAt: Date.now() - 14400000 },
    { symbol: 'TSLA', addedAt: Date.now() - 18000000 },
    { symbol: 'GC1!', addedAt: Date.now() - 21600000 },
  ]);

  // Paper Trading Portfolio State
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash: 72450.00,
    initialBalance: 100000.00,
    positions: [
      {
        id: 'pos-1',
        symbol: 'NVDA',
        assetName: 'NVIDIA Corporation',
        type: 'buy',
        shares: 100,
        entryPrice: 135.20,
        currentPrice: 147.50,
        timestamp: Date.now() - 86400000 * 2,
      },
      {
        id: 'pos-2',
        symbol: 'BTC/USD',
        assetName: 'Bitcoin',
        type: 'buy',
        shares: 0.15,
        entryPrice: 84200.00,
        currentPrice: 88450.00,
        timestamp: Date.now() - 86400000 * 4,
      },
    ],
  });

  // Calculate live portfolio equity
  const portfolioEquity = portfolio.cash + portfolio.positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);

  // Toggle Theme handler
  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Keyboard shortcut listener (⌘K for Search, W for Watchlist)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsPortfolioOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time micro-fluctuations simulator (runs every 3.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setAssets((prevAssets) => {
        return prevAssets.map((asset) => {
          // 40% chance of price update on this tick
          if (Math.random() > 0.4) return asset;

          const deltaFactor = (Math.random() - 0.48) * 0.003;
          const newPrice = Number(Math.max(0.01, asset.price * (1 + deltaFactor)).toFixed(asset.category === 'bonds' ? 3 : 2));
          const priceDiff = newPrice - asset.price;
          const newChange = Number((asset.change + priceDiff).toFixed(2));
          const newChangePercent = Number((asset.changePercent + (priceDiff / asset.price) * 100).toFixed(2));

          // Check price alerts for this symbol
          watchlist.forEach((w) => {
            if (w.symbol === asset.symbol && w.alertPrice) {
              if (w.alertDirection === 'above' && newPrice >= w.alertPrice && !w.alertTriggered) {
                showToast(`🔔 Price Alert: ${asset.symbol} crossed above $${w.alertPrice}! Current: $${newPrice}`);
                w.alertTriggered = true;
              } else if (w.alertDirection === 'below' && newPrice <= w.alertPrice && !w.alertTriggered) {
                showToast(`🔔 Price Alert: ${asset.symbol} crossed below $${w.alertPrice}! Current: $${newPrice}`);
                w.alertTriggered = true;
              }
            }
          });

          // Update latest point on sparkline
          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          return {
            ...asset,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            sparkline: newSparkline,
            high24h: Math.max(asset.high24h, newPrice),
            low24h: Math.min(asset.low24h, newPrice),
          };
        });
      });

      // Update positions currentPrice in portfolio
      setPortfolio((prevPort) => {
        let changed = false;
        const updatedPositions = prevPort.positions.map((pos) => {
          const match = assets.find((a) => a.symbol === pos.symbol);
          if (match && match.price !== pos.currentPrice) {
            changed = true;
            return { ...pos, currentPrice: match.price };
          }
          return pos;
        });
        return changed ? { ...prevPort, positions: updatedPositions } : prevPort;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [watchlist, assets]);

  // Keep selectedAsset in sync with updated live assets
  useEffect(() => {
    if (selectedAsset) {
      const updated = assets.find((a) => a.symbol === selectedAsset.symbol);
      if (updated && updated.price !== selectedAsset.price) {
        setSelectedAsset(updated);
      }
    }
  }, [assets, selectedAsset]);

  // Watchlist Actions
  const handleToggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      const exists = prev.some((w) => w.symbol === symbol);
      if (exists) {
        showToast(`Removed ${symbol} from Watchlist`);
        return prev.filter((w) => w.symbol !== symbol);
      } else {
        showToast(`Added ${symbol} to Watchlist`);
        return [...prev, { symbol, addedAt: Date.now() }];
      }
    });
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
    showToast(`Removed ${symbol} from Watchlist`);
  };

  const handleAddToWatchlist = (symbol: string) => {
    if (!watchlist.some((w) => w.symbol === symbol)) {
      setWatchlist((prev) => [...prev, { symbol, addedAt: Date.now() }]);
      showToast(`Added ${symbol} to Watchlist`);
    }
  };

  const handleSetAlert = (symbol: string, alertPrice: number, alertDirection: 'above' | 'below') => {
    setWatchlist((prev) =>
      prev.map((w) => (w.symbol === symbol ? { ...w, alertPrice, alertDirection, alertTriggered: false } : w))
    );
    showToast(`Alert set: ${symbol} ${alertDirection} $${alertPrice}`);
  };

  // Paper Trade Execution Handler
  const handleExecuteTrade = (trade: {
    symbol: string;
    assetName: string;
    type: 'buy' | 'sell';
    shares: number;
    price: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => {
    const totalCost = trade.shares * trade.price;

    if (trade.type === 'buy' && totalCost > portfolio.cash) {
      showToast(`Order rejected: Insufficient cash balance ($${portfolio.cash.toFixed(2)}) for order ($${totalCost.toFixed(2)})`);
      return;
    }

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: trade.symbol,
      assetName: trade.assetName,
      type: trade.type,
      shares: trade.shares,
      entryPrice: trade.price,
      currentPrice: trade.price,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      timestamp: Date.now(),
    };

    setPortfolio((prev) => ({
      ...prev,
      cash: trade.type === 'buy' ? prev.cash - totalCost : prev.cash + totalCost,
      positions: [newPosition, ...prev.positions],
    }));

    showToast(`Executed ${trade.type.toUpperCase()} order: ${trade.shares} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
  };

  // Close Position Handler
  const handleClosePosition = (positionId: string) => {
    const pos = portfolio.positions.find((p) => p.id === positionId);
    if (!pos) return;

    const returnAmount = pos.shares * pos.currentPrice;
    setPortfolio((prev) => ({
      ...prev,
      cash: prev.cash + returnAmount,
      positions: prev.positions.filter((p) => p.id !== positionId),
    }));

    showToast(`Closed position for ${pos.shares} ${pos.symbol} at $${pos.currentPrice.toFixed(2)}`);
  };

  // Reset Portfolio Handler
  const handleResetPortfolio = () => {
    setPortfolio({
      cash: 100000.0,
      initialBalance: 100000.0,
      positions: [],
    });
    showToast(`Paper trading portfolio reset to $100,000 cash.`);
  };

  const watchlistSymbols = watchlist.map((w) => w.symbol);

  return (
    <div className="min-h-screen bg-[#131722] dark:bg-[#131722] bg-[#f8fafd] text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-800 flex flex-col font-sans transition-colors">
      {/* 1. Header Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        watchlistCount={watchlist.length}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        portfolioEquity={portfolioEquity}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Live Running Ticker Tape */}
      <TickerTape
        assets={assets}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <MarketOverview
            assets={assets}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'heatmaps' && (
          <HeatmapView
            onSelectSymbol={(symbol) => {
              const found = assets.find((a) => a.symbol === symbol || a.symbol.replace('/USD', '') === symbol);
              if (found) setSelectedAsset(found);
            }}
          />
        )}

        {activeTab === 'screener' && (
          <ScreenerView
            assets={assets}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            watchlistSymbols={watchlistSymbols}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {['indices', 'stocks', 'crypto', 'forex', 'futures', 'bonds', 'etfs'].includes(activeTab) && (
          <AssetClassView
            category={activeTab as AssetCategory}
            assets={assets}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            watchlistSymbols={watchlistSymbols}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}
      </main>

      {/* 4. Interactive Chart Modal (Full TradingView View) */}
      {selectedAsset && (
        <InteractiveChart
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onExecuteTrade={handleExecuteTrade}
          isWatchlisted={watchlistSymbols.includes(selectedAsset.symbol)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* 5. Watchlist Slide-over Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        assets={assets}
        onSelectAsset={(asset) => {
          setSelectedAsset(asset);
          setIsWatchlistOpen(false);
        }}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        onAddToWatchlist={handleAddToWatchlist}
        onSetAlert={handleSetAlert}
      />

      {/* 6. Paper Trading Account Modal */}
      <PaperTradingModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        portfolio={portfolio}
        onClosePosition={handleClosePosition}
        onResetPortfolio={handleResetPortfolio}
      />

      {/* 7. Global Search Modal (⌘K Command Palette) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={assets}
        onSelectAsset={(asset) => {
          setSelectedAsset(asset);
        }}
      />

      {/* Notification Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2962ff]/50 shadow-2xl text-xs text-white dark:text-white text-slate-900 flex items-center gap-2 animate-bounce">
          <Bell className="w-4 h-4 text-[#2962ff] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 py-6 bg-[#181b24] dark:bg-[#181b24] bg-white text-xs text-[#787b86]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white dark:text-white text-slate-800">TradingView Markets</span>
            <span aria-hidden="true">·</span>
            <span>Real-time global financial data & interactive charting</span>
          </div>
          <div className="flex items-center gap-4 text-[#787b86]">
            <span>Indices</span>
            <span>Stocks</span>
            <span>Crypto</span>
            <span>Forex</span>
            <span>Futures</span>
            <span>Bonds</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
