import React, { useState } from 'react';
import { HeatmapSector, HeatmapItem, MarketAsset } from '../types/market';
import { SECTOR_HEATMAP_DATA, CRYPTO_HEATMAP_DATA } from '../data/mockMarketData';
import { Search, Info, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HeatmapViewProps {
  onSelectSymbol: (symbol: string) => void;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ onSelectSymbol }) => {
  const [heatmapType, setHeatmapType] = useState<'stocks' | 'crypto'>('stocks');
  const [filterQuery, setFilterQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<HeatmapItem | null>(null);

  const activeData: HeatmapSector[] = heatmapType === 'stocks' ? SECTOR_HEATMAP_DATA : CRYPTO_HEATMAP_DATA;

  // Filter sectors and items based on search query
  const filteredData = activeData
    .map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (item) =>
          item.symbol.toLowerCase().includes(filterQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          sec.sector.toLowerCase().includes(filterQuery.toLowerCase())
      ),
    }))
    .filter((sec) => sec.items.length > 0);

  // Helper to get color according to TradingView heatmap spectrum
  const getPerformanceColor = (pct: number) => {
    if (pct >= 4) return 'bg-[#089981] text-white';
    if (pct >= 2) return 'bg-[#00b08b] text-white';
    if (pct > 0.5) return 'bg-[#15937a] text-white';
    if (pct > 0) return 'bg-[#1c7865] text-white';
    if (pct === 0) return 'bg-[#363a45] text-white';
    if (pct > -0.5) return 'bg-[#852932] text-white';
    if (pct > -2) return 'bg-[#ad2b37] text-white';
    if (pct > -4) return 'bg-[#d32f2f] text-white';
    return 'bg-[#f23645] text-white';
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-white dark:text-white text-slate-900 tracking-tight">
            {heatmapType === 'stocks' ? 'S&P 500 Stock Market Heatmap' : 'Cryptocurrency Market Heatmap'}
          </h1>
          <p className="text-xs text-[#787b86] dark:text-[#787b86] text-slate-500 mt-0.5">
            Tile size scaled proportionally by Market Capitalization · Colors represent 1-Day Performance (%)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Heatmap Type Switcher */}
          <div className="flex rounded-lg bg-[#131722] dark:bg-[#131722] bg-slate-100 p-1 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
            <button
              onClick={() => setHeatmapType('stocks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                heatmapType === 'stocks'
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900'
              }`}
            >
              S&P 500
            </button>
            <button
              onClick={() => setHeatmapType('crypto')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                heatmapType === 'crypto'
                  ? 'bg-[#2962ff] text-white shadow-sm'
                  : 'text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900'
              }`}
            >
              Crypto Top 50
            </button>
          </div>

          {/* Search in Heatmap */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#787b86]" />
            <input
              type="text"
              placeholder="Filter ticker..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-[#131722] dark:bg-[#131722] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 text-white dark:text-white text-slate-900 placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
            />
          </div>
        </div>
      </div>

      {/* Heatmap Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-lg bg-[#181b24] dark:bg-[#181b24] bg-slate-100 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-[#787b86]">
          <Info className="w-3.5 h-3.5" />
          <span>Click any block to open full interactive chart & trading panel</span>
        </div>

        {/* Color spectrum legend */}
        <div className="flex items-center gap-1 font-mono text-[10px] tabular-nums text-[#787b86]">
          <span>-4%</span>
          <div className="flex h-3 w-36 rounded overflow-hidden">
            <div className="flex-1 bg-[#f23645]" />
            <div className="flex-1 bg-[#d32f2f]" />
            <div className="flex-1 bg-[#ad2b37]" />
            <div className="flex-1 bg-[#363a45]" />
            <div className="flex-1 bg-[#15937a]" />
            <div className="flex-1 bg-[#00b08b]" />
            <div className="flex-1 bg-[#089981]" />
          </div>
          <span>+4%</span>
        </div>
      </div>

      {/* Treemap Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredData.map((sector) => {
          // Calculate total market cap of filtered sector items to scale relative widths
          const sectorCap = sector.items.reduce((sum, item) => sum + item.marketCap, 0);

          return (
            <div
              key={sector.sector}
              className="p-3 rounded-xl bg-[#181b24] dark:bg-[#181b24] bg-slate-50 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 flex flex-col"
            >
              {/* Sector Title & Summary */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-white dark:text-white text-slate-800 tracking-wide">
                  {sector.sector}
                </span>
                <span
                  className={`text-[11px] font-mono tabular-nums font-semibold ${
                    sector.avgPerformance >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {sector.avgPerformance >= 0 ? '+' : ''}
                  {sector.avgPerformance.toFixed(2)}%
                </span>
              </div>

              {/* Sector Tiles Container */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 flex-1 min-h-[180px]">
                {sector.items.map((item) => {
                  const isPositive = item.changePercent >= 0;
                  const colorClass = getPerformanceColor(item.changePercent);
                  
                  // Adjust tile spanning for giant large-cap leaders (e.g. NVDA, AAPL, MSFT, BTC, ETH)
                  const isMegaCap = item.marketCap > 1000;
                  const isLargeCap = item.marketCap > 300 && !isMegaCap;

                  return (
                    <button
                      key={item.symbol}
                      onClick={() => onSelectSymbol(item.symbol)}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`relative p-2.5 rounded-lg flex flex-col justify-between transition-all hover:scale-[1.02] hover:z-10 shadow-sm cursor-pointer text-left ${colorClass} ${
                        isMegaCap ? 'col-span-2 row-span-2' : isLargeCap ? 'col-span-1 row-span-1' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className={`font-mono font-bold tracking-tight ${isMegaCap ? 'text-lg' : 'text-xs'}`}>
                          {item.symbol}
                        </span>
                        <span className="text-[10px] opacity-75 font-mono tabular-nums">
                          ${item.marketCap >= 1000 ? `${(item.marketCap / 1000).toFixed(1)}T` : `${item.marketCap}B`}
                        </span>
                      </div>

                      <div className="mt-1">
                        <div className={`font-mono tabular-nums font-bold leading-tight ${isMegaCap ? 'text-base' : 'text-xs'}`}>
                          ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center text-[11px] font-mono tabular-nums font-semibold">
                          {isPositive ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hovered details drawer bar */}
      {hoveredItem && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-[#1e222d]/95 dark:bg-[#1e222d]/95 bg-white/95 backdrop-blur border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 shadow-xl flex items-center gap-4 text-xs z-30">
          <span className="font-bold font-mono text-white dark:text-white text-slate-900">{hoveredItem.symbol}</span>
          <span className="text-[#787b86]">{hoveredItem.name}</span>
          <span className="text-[#787b86]">Sector: <strong className="text-white dark:text-white text-slate-800">{hoveredItem.sector}</strong></span>
          <span className="font-mono tabular-nums text-white dark:text-white text-slate-900">${hoveredItem.price.toFixed(2)}</span>
          <span className={`font-mono tabular-nums font-bold ${hoveredItem.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {hoveredItem.changePercent >= 0 ? '+' : ''}{hoveredItem.changePercent.toFixed(2)}%
          </span>
          <span className="text-[11px] text-[#2962ff] font-semibold flex items-center gap-1">
            Click to view chart <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      )}
    </div>
  );
};
