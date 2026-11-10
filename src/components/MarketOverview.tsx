import React, { useState } from 'react';
import { MarketAsset, EconomicEvent, MarketNews } from '../types/market';
import { Sparkline } from './Sparkline';
import { ECONOMIC_CALENDAR, MARKET_NEWS, SECTOR_HEATMAP_DATA } from '../data/mockMarketData';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface MarketOverviewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onNavigateToTab: (tab: string) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  assets,
  onSelectAsset,
  onNavigateToTab,
}) => {
  const [moverTab, setMoverTab] = useState<'gainers' | 'losers' | 'active' | 'leaders'>('gainers');

  // Key benchmark pulse cards
  const pulseSymbols = ['SPX', 'NDX', 'BTC/USD', 'US10Y'];
  const pulseAssets = pulseSymbols.map(sym => assets.find(a => a.symbol === sym)).filter(Boolean) as MarketAsset[];

  // Market Movers calculations
  const topGainers = [...assets].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...assets].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const mostActive = [...assets].sort((a, b) => b.volumeNumeric - a.volumeNumeric).slice(0, 5);
  const leaders = assets.filter(a => a.category === 'stocks' || a.category === 'crypto').slice(0, 5);

  const currentMovers = 
    moverTab === 'gainers' ? topGainers :
    moverTab === 'losers' ? topLosers :
    moverTab === 'active' ? mostActive : leaders;

  return (
    <div className="space-y-8">
      {/* 1. Global Market Pulse Barometer Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white dark:text-white text-slate-900 tracking-tight">
              Today's Market Pulse
            </h2>
            <p className="text-xs text-[#787b86] dark:text-[#787b86] text-slate-500">
              Macro performance across key global stock benchmarks, crypto, and sovereign debt
            </p>
          </div>
          <span className="text-xs font-mono text-[#787b86] hidden sm:inline-block">
            Real-time quotes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pulseAssets.map((asset) => {
            const isPositive = asset.changePercent >= 0;
            // Calculate Day's Range percentage
            const dayRangePct = Math.max(0, Math.min(100, ((asset.price - asset.low24h) / (asset.high24h - asset.low24h || 1)) * 100));

            return (
              <button
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="p-4 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 hover:border-[#787b86] transition-all hover:scale-[1.01] text-left flex flex-col justify-between group cursor-pointer shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono tracking-tight text-white dark:text-white text-slate-900 group-hover:text-[#2962ff] transition-colors">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#2a2e39] dark:bg-[#2a2e39] bg-slate-100 text-[#787b86] dark:text-[#787b86] text-slate-600">
                      {asset.exchange}
                    </span>
                  </div>
                  <div className="text-xs text-[#787b86] truncate mb-2 font-medium">
                    {asset.name}
                  </div>

                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xl font-bold font-mono tabular-nums text-white dark:text-white text-slate-900">
                      {asset.category === 'bonds' ? `${asset.price.toFixed(3)}%` : `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </span>
                    <span
                      className={`flex items-center text-xs font-mono tabular-nums font-bold ${
                        isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                      {isPositive ? '+' : ''}
                      {asset.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Sparkline chart */}
                <div className="my-2 flex justify-center">
                  <Sparkline data={asset.sparkline} isPositive={isPositive} width={220} height={42} />
                </div>

                {/* Day's Range bar */}
                <div className="mt-2 pt-2 border-t border-[#2a2e39]/60 dark:border-[#2a2e39]/60 border-slate-100 text-[10px] font-mono tabular-nums text-[#787b86]">
                  <div className="flex justify-between mb-1">
                    <span>L: ${asset.low24h.toFixed(1)}</span>
                    <span className="font-sans font-medium text-[9px] uppercase">Day's Range</span>
                    <span>H: ${asset.high24h.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#131722] dark:bg-[#131722] bg-slate-200 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPositive ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                      style={{ width: `${dayRangePct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Main 2-Column Grid: Market Movers (Left) + Sector Heatmap Preview & Dominance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Market Movers Tabs & Table (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-white dark:text-white text-slate-900 tracking-tight">
                Market Movers
              </h3>

              {/* Movers Tabs */}
              <div className="flex rounded-lg bg-[#131722] dark:bg-[#131722] bg-slate-100 p-1 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 text-xs">
                <button
                  onClick={() => setMoverTab('gainers')}
                  className={`px-3 py-1 font-semibold rounded-md transition-all ${
                    moverTab === 'gainers' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white dark:hover:text-white'
                  }`}
                >
                  Top Gainers
                </button>
                <button
                  onClick={() => setMoverTab('losers')}
                  className={`px-3 py-1 font-semibold rounded-md transition-all ${
                    moverTab === 'losers' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white dark:hover:text-white'
                  }`}
                >
                  Top Losers
                </button>
                <button
                  onClick={() => setMoverTab('active')}
                  className={`px-3 py-1 font-semibold rounded-md transition-all ${
                    moverTab === 'active' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white dark:hover:text-white'
                  }`}
                >
                  Most Active
                </button>
                <button
                  onClick={() => setMoverTab('leaders')}
                  className={`px-3 py-1 font-semibold rounded-md transition-all ${
                    moverTab === 'leaders' ? 'bg-[#2962ff] text-white shadow-sm' : 'text-[#787b86] hover:text-white dark:hover:text-white'
                  }`}
                >
                  Leaders
                </button>
              </div>
            </div>

            {/* High-Density Movers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-[#787b86] font-semibold border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Symbol & Name</th>
                    <th className="py-2.5 px-3 text-right">Last Price</th>
                    <th className="py-2.5 px-3 text-right">Change %</th>
                    <th className="py-2.5 px-3 text-right">24h Volume</th>
                    <th className="py-2.5 px-3 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100 font-mono tabular-nums">
                  {currentMovers.map((item) => {
                    const isPositive = item.changePercent >= 0;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => onSelectAsset(item)}
                        className="hover:bg-[#202531] dark:hover:bg-[#202531] hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white dark:text-white text-slate-900 group-hover:text-[#2962ff] transition-colors">
                              {item.symbol}
                            </span>
                            <span className="text-[11px] text-[#787b86] truncate max-w-[140px]">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white dark:text-white text-slate-900">
                          ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-flex items-center font-bold ${
                              isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {item.changePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#787b86]">
                          {item.volume}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex justify-center">
                            <Sparkline data={item.sparkline} isPositive={isPositive} width={65} height={20} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 mt-2 flex justify-end">
            <button
              onClick={() => onNavigateToTab('screener')}
              className="text-xs font-semibold text-[#2962ff] hover:underline flex items-center gap-1"
            >
              Open Complete Screener <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: S&P 500 Sector Heatmap Preview & Crypto Dominance (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Sector Performance Snapshot */}
          <div className="rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white dark:text-white text-slate-900 tracking-tight">
                  S&P 500 Sectors
                </h3>
                <p className="text-xs text-[#787b86]">Daily industry sector returns</p>
              </div>
              <button
                onClick={() => onNavigateToTab('heatmaps')}
                className="text-xs font-semibold text-[#2962ff] hover:underline flex items-center gap-1"
              >
                Full Heatmap <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sector bars */}
            <div className="space-y-2 text-xs">
              {SECTOR_HEATMAP_DATA.slice(0, 5).map((sec) => {
                const isPos = sec.avgPerformance >= 0;
                return (
                  <div key={sec.sector} className="flex items-center justify-between">
                    <span className="text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700 font-medium truncate max-w-[180px]">
                      {sec.sector}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#131722] dark:bg-[#131722] bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${isPos ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                          style={{ width: `${Math.min(100, Math.abs(sec.avgPerformance) * 25)}%` }}
                        />
                      </div>
                      <span className={`w-14 text-right font-mono tabular-nums font-bold ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isPos ? '+' : ''}{sec.avgPerformance.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crypto Macro Barometer */}
          <div className="rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white dark:text-white text-slate-900 tracking-tight">
                Crypto Market Overview
              </h3>
              <button
                onClick={() => onNavigateToTab('crypto')}
                className="text-xs font-semibold text-[#2962ff] hover:underline"
              >
                View Coins →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-[#131722] dark:bg-[#131722] bg-slate-100">
                <div className="text-[10px] text-[#787b86] font-semibold uppercase">Total Crypto Cap</div>
                <div className="text-base font-bold font-mono text-white dark:text-white text-slate-900 mt-0.5">$2.74 Trillion</div>
                <div className="text-[11px] font-mono text-[#089981] font-semibold">+2.84% 24h</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#131722] dark:bg-[#131722] bg-slate-100">
                <div className="text-[10px] text-[#787b86] font-semibold uppercase">BTC Dominance</div>
                <div className="text-base font-bold font-mono text-white dark:text-white text-slate-900 mt-0.5">58.2%</div>
                <div className="text-[11px] font-mono text-[#787b86]">ETH: 14.1%</div>
              </div>
            </div>

            {/* Quick BTC & ETH Mini rows */}
            <div className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100 text-xs">
              {assets.filter(a => a.symbol === 'BTC/USD' || a.symbol === 'ETH/USD').map(coin => (
                <div
                  key={coin.symbol}
                  onClick={() => onSelectAsset(coin)}
                  className="py-2 flex items-center justify-between hover:text-[#2962ff] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-white dark:text-white text-slate-900">{coin.symbol}</span>
                    <span className="text-[11px] text-[#787b86]">{coin.name}</span>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-white dark:text-white text-slate-900">${coin.price.toLocaleString()}</div>
                    <div className="text-[11px] text-[#089981] font-semibold">+{coin.changePercent.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Economic Calendar & Market Top Stories Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Economic Calendar (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2962ff]" />
              <h3 className="text-base font-bold text-white dark:text-white text-slate-900 tracking-tight">
                Economic Calendar
              </h3>
            </div>
            <span className="text-xs text-[#787b86]">Central Banks & Macro</span>
          </div>

          <div className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100 text-xs">
            {ECONOMIC_CALENDAR.map((event) => (
              <div key={event.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-base leading-none select-none">{event.flag}</span>
                  <div>
                    <div className="font-medium text-white dark:text-white text-slate-800 leading-snug">
                      {event.title}
                    </div>
                    <div className="text-[11px] text-[#787b86] flex items-center gap-1.5 mt-0.5">
                      <span>{event.time}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${event.impact === 'High' ? 'text-[#f23645]' : 'text-amber-400'}`}>
                        {event.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="font-bold text-white dark:text-white text-slate-900">
                    Act: {event.actual}
                  </div>
                  <div className="text-[10px] text-[#787b86]">
                    Fcst: {event.forecast}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market News & Editorial Flow (7 cols) */}
        <div className="lg:col-span-7 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2962ff]" />
              <h3 className="text-base font-bold text-white dark:text-white text-slate-900 tracking-tight">
                Market News & Top Stories
              </h3>
            </div>
            <span className="text-xs text-[#787b86]">Live Wire</span>
          </div>

          <div className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100">
            {MARKET_NEWS.map((story) => {
              const sentimentColor =
                story.sentiment === 'Bullish'
                  ? 'text-[#089981] bg-[#089981]/15'
                  : story.sentiment === 'Bearish'
                  ? 'text-[#f23645] bg-[#f23645]/15'
                  : 'text-[#787b86] bg-[#787b86]/15';

              return (
                <article key={story.id} className="py-3 group">
                  <div className="flex items-center justify-between text-xs text-[#787b86] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white dark:text-white text-slate-700">{story.source}</span>
                      <span aria-hidden="true">·</span>
                      <span>{story.timeAgo}</span>
                      <span aria-hidden="true">·</span>
                      <span>{story.readTime}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sentimentColor}`}>
                      {story.sentiment}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white dark:text-white text-slate-900 group-hover:text-[#2962ff] transition-colors leading-snug mb-1 cursor-pointer">
                    {story.title}
                  </h4>
                  <p className="text-xs text-[#787b86] dark:text-[#787b86] text-slate-500 leading-relaxed mb-2 line-clamp-2">
                    {story.snippet}
                  </p>

                  {/* Tickers mentioned in story */}
                  <div className="flex items-center gap-1.5">
                    {story.symbols.map((sym) => {
                      const asset = assets.find(a => a.symbol === sym);
                      return (
                        <button
                          key={sym}
                          onClick={() => asset && onSelectAsset(asset)}
                          className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#131722] dark:bg-[#131722] bg-slate-100 text-[#2962ff] hover:bg-[#2962ff] hover:text-white transition-colors border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200"
                        >
                          ${sym}
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
