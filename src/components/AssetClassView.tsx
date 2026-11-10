import React from 'react';
import { MarketAsset, AssetCategory } from '../types/market';
import { Sparkline } from './Sparkline';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Info } from 'lucide-react';

interface AssetClassViewProps {
  category: AssetCategory;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
}

export const AssetClassView: React.FC<AssetClassViewProps> = ({
  category,
  assets,
  onSelectAsset,
  watchlistSymbols,
  onToggleWatchlist,
}) => {
  const categoryAssets = assets.filter((a) => a.category === category);

  // Metadata headers per category
  const categoryHeaders: Record<AssetCategory, { title: string; subtitle: string }> = {
    indices: {
      title: 'World Stock Market Indices',
      subtitle: 'Real-time performance of benchmark indices across the Americas, Europe, and Asia-Pacific',
    },
    stocks: {
      title: 'World Equity Markets & Stocks',
      subtitle: 'Leading public enterprises tracked by market capitalization, volume, and daily momentum',
    },
    crypto: {
      title: 'Cryptocurrency & Digital Assets',
      subtitle: 'Live quotes, 24h volume, circulating market cap, and decentralized finance tokens',
    },
    forex: {
      title: 'Foreign Exchange & Currencies (FX)',
      subtitle: 'Major and cross currency pairs, US Dollar Index (DXY), and central bank monetary dynamics',
    },
    futures: {
      title: 'Commodities & Financial Futures',
      subtitle: 'Energy contracts (WTI, Brent), precious metals (Gold, Silver), and index futures',
    },
    bonds: {
      title: 'Sovereign Government Bonds & Yield Curves',
      subtitle: 'US Treasury yields across 2Y, 10Y, 30Y tenors, yield curve spread, and international debt',
    },
    etfs: {
      title: 'Exchange-Traded Funds (ETFs)',
      subtitle: 'Broad-market index trackers, thematic semiconductor funds, and commodity trusts',
    },
  };

  const currentHeader = categoryHeaders[category] || {
    title: `${category.toUpperCase()} Markets`,
    subtitle: 'Global market instruments and real-time quotes',
  };

  return (
    <div className="space-y-6">
      {/* Category Header Banner */}
      <div className="p-4 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
        <h1 className="text-xl font-bold text-white dark:text-white text-slate-900 tracking-tight">
          {currentHeader.title}
        </h1>
        <p className="text-xs text-[#787b86] dark:text-[#787b86] text-slate-500 mt-0.5">
          {currentHeader.subtitle}
        </p>
      </div>

      {/* Special Bond Yield Curve Visualizer if category === 'bonds' */}
      {category === 'bonds' && (
        <div className="p-4 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white dark:text-white text-slate-900">
                US Treasury Yield Curve Benchmark
              </h3>
              <p className="text-xs text-[#787b86]">
                2Y Yield: 4.285% · 10Y Yield: 4.435% · 10Y-2Y Spread: +15 bps (Normal Upward Sloping Curve)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#089981]/20 text-[#089981]">
              Un-inverted
            </span>
          </div>

          {/* Simulated Yield Curve Chart */}
          <div className="h-32 w-full pt-2">
            <svg viewBox="0 0 600 100" className="w-full h-full">
              {/* Grid lines */}
              <line x1="0" y1="25" x2="600" y2="25" stroke="#2a2e39" strokeDasharray="3 3" opacity="0.4" />
              <line x1="0" y1="50" x2="600" y2="50" stroke="#2a2e39" strokeDasharray="3 3" opacity="0.4" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#2a2e39" strokeDasharray="3 3" opacity="0.4" />

              {/* Curve Points: 1M (4.6%), 3M (4.55%), 2Y (4.28%), 5Y (4.32%), 10Y (4.43%), 30Y (4.61%) */}
              <polyline
                points="50,20 150,25 260,65 370,55 480,40 570,18"
                fill="none"
                stroke="#2962ff"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Circles on Tenors */}
              {[
                { x: 50, y: 20, label: '1M', rate: '4.60%' },
                { x: 150, y: 25, label: '3M', rate: '4.55%' },
                { x: 260, y: 65, label: '2Y', rate: '4.28%' },
                { x: 370, y: 55, label: '5Y', rate: '4.32%' },
                { x: 480, y: 40, label: '10Y', rate: '4.43%' },
                { x: 570, y: 18, label: '30Y', rate: '4.61%' },
              ].map((pt) => (
                <g key={pt.label}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#2962ff" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 8} fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    {pt.rate}
                  </text>
                  <text x={pt.x} y="95" fill="#787b86" fontSize="9" textAnchor="middle" fontWeight="bold">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* High-Density Category Table */}
      <div className="rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 overflow-x-auto bg-[#1e222d] dark:bg-[#1e222d] bg-white shadow-sm">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#181b24] dark:bg-[#181b24] bg-slate-100 text-[#787b86] font-semibold border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
            <tr>
              <th className="py-3 px-4">Symbol & Name</th>
              <th className="py-3 px-4">Exchange / Market</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-right">Change ($)</th>
              <th className="py-3 px-4 text-right">Change (%)</th>
              <th className="py-3 px-4 text-right">24h High</th>
              <th className="py-3 px-4 text-right">24h Low</th>
              <th className="py-3 px-4 text-center">Technical Rating</th>
              <th className="py-3 px-4 text-center">Trend (24h)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100 font-mono tabular-nums">
            {categoryAssets.map((asset) => {
              const isPositive = asset.changePercent >= 0;

              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="hover:bg-[#202531] dark:hover:bg-[#202531] hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center gap-2">
                      {asset.flag && <span className="text-base leading-none">{asset.flag}</span>}
                      <span className="font-bold text-white dark:text-white text-slate-900 group-hover:text-[#2962ff] transition-colors">
                        {asset.symbol}
                      </span>
                      <span className="text-xs text-[#787b86] truncate max-w-[200px]">
                        {asset.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#787b86] font-mono">
                    {asset.exchange}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white dark:text-white text-slate-900">
                    {asset.category === 'bonds' ? `${asset.price.toFixed(3)}%` : `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </td>
                  <td className={`py-3 px-4 text-right ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {isPositive ? '+' : ''}{asset.change.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center font-bold ${
                        isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                      {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#787b86]">
                    ${asset.high24h.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-[#787b86]">
                    ${asset.low24h.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#131722] dark:bg-[#131722] bg-slate-100 text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700">
                      {asset.technicalRating}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <Sparkline data={asset.sparkline} isPositive={isPositive} width={80} height={24} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
