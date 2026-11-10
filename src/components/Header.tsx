import React from 'react';
import { Search, Bookmark, Moon, Sun, Wallet, Activity, TrendingUp } from 'lucide-react';
import { AssetCategory } from '../types/market';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearch: () => void;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  onOpenPortfolio: () => void;
  portfolioEquity: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  onToggleWatchlist,
  watchlistCount,
  onOpenPortfolio,
  portfolioEquity,
  isDarkMode,
  onToggleTheme,
}) => {
  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'indices', label: 'Indices' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
    { id: 'heatmaps', label: 'Heatmaps' },
    { id: 'screener', label: 'Screener' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#131722]/95 dark:bg-[#131722]/95 bg-white/95 backdrop-blur border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Header Bar: Brand, Search, Tools */}
        <div className="h-14 flex items-center justify-between gap-4">
          
          {/* Brand & Market Status */}
          <div className="flex items-center gap-6 shrink-0">
            <button 
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              {/* TradingView signature TV logo mark */}
              <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 28 28" fill="currentColor" className="w-5 h-5">
                  <path d="M4 19h5V9H4v10zm7-14v19h5V5h-5zm7 5v9h5v-9h-5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white dark:text-white text-slate-900 leading-none">
                  TradingView
                </span>
                <span className="text-[11px] text-[#787b86] dark:text-[#787b86] text-slate-500 font-medium">
                  Markets
                </span>
              </div>
            </button>

            {/* Market Session indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-[#787b86] dark:text-[#787b86] text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-[#089981]"></span>
              <span>US Markets Open</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">NYSE / NASDAQ</span>
            </div>
          </div>

          {/* Quick Search Bar (Command / Ctrl+K) */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#1e222d] dark:bg-[#1e222d] bg-slate-100 hover:bg-[#2a2e39] dark:hover:bg-[#2a2e39] hover:bg-slate-200 text-sm text-[#787b86] dark:text-[#787b86] text-slate-500 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#787b86]" />
                <span>Search markets, symbols, news...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-[#131722] dark:bg-[#131722] bg-white border border-[#363a45] dark:border-[#363a45] border-slate-300 text-[#787b86] dark:text-[#787b86] text-slate-600">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile search icon */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-lg text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-[#1e222d] dark:hover:bg-[#1e222d] hover:bg-slate-100 transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Paper Trading Portfolio button */}
            <button
              onClick={onOpenPortfolio}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e222d] dark:bg-[#1e222d] bg-slate-100 hover:bg-[#2a2e39] dark:hover:bg-[#2a2e39] hover:bg-slate-200 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 transition-colors"
              title="Paper Trading Portfolio"
            >
              <Wallet className="w-4 h-4 text-[#2962ff]" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] uppercase font-semibold text-[#787b86] leading-none">Paper Account</div>
                <div className="text-xs font-mono tabular-nums font-bold text-white dark:text-white text-slate-900 leading-tight">
                  ${portfolioEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </button>

            {/* Watchlist button */}
            <button
              onClick={onToggleWatchlist}
              className="relative p-2 rounded-lg text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700 hover:bg-[#1e222d] dark:hover:bg-[#1e222d] hover:bg-slate-100 border border-transparent hover:border-[#2a2e39] dark:hover:border-[#2a2e39] hover:border-slate-300 transition-colors"
              title="Toggle Watchlist"
            >
              <Bookmark className="w-5 h-5" />
              {watchlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#2962ff] text-white text-[10px] font-bold flex items-center justify-center">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* Dark/Light mode switcher */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700 hover:bg-[#1e222d] dark:hover:bg-[#1e222d] hover:bg-slate-100 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Sub-Navigation Asset Class Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none border-t border-[#2a2e39]/50 dark:border-[#2a2e39]/50 border-slate-100">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-md transition-all ${
                  isActive
                    ? 'bg-[#2962ff] text-white shadow-sm'
                    : 'text-[#787b86] dark:text-[#787b86] text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-[#1e222d] dark:hover:bg-[#1e222d] hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
