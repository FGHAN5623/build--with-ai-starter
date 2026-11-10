import React from 'react';
import { MarketAsset } from '../types/market';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TickerTapeProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const TickerTape: React.FC<TickerTapeProps> = ({ assets, onSelectAsset }) => {
  // Select top representative benchmark symbols for the tape
  const tapeSymbols = ['SPX', 'NDX', 'DJI', 'BTC/USD', 'ETH/USD', 'NVDA', 'AAPL', 'GC1!', 'CL1!', 'US10Y', 'EUR/USD', 'TSLA'];
  const tapeAssets = assets.filter(a => tapeSymbols.includes(a.symbol));

  // Duplicate for seamless infinite loop ticker tape effect
  const loopedAssets = [...tapeAssets, ...tapeAssets];

  return (
    <div className="w-full bg-[#181b24] dark:bg-[#181b24] bg-slate-50 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 overflow-hidden select-none">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        {loopedAssets.map((asset, idx) => {
          const isPositive = asset.changePercent >= 0;
          return (
            <button
              key={`${asset.symbol}-${idx}`}
              onClick={() => onSelectAsset(asset)}
              className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#202531] dark:hover:bg-[#202531] hover:bg-slate-200/70 border-r border-[#2a2e39]/60 dark:border-[#2a2e39]/60 border-slate-200 transition-colors text-left group cursor-pointer"
            >
              <span className="text-xs font-bold text-white dark:text-white text-slate-800 tracking-wide group-hover:text-[#2962ff] transition-colors">
                {asset.symbol}
              </span>
              <span className="text-xs font-mono tabular-nums text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700">
                {asset.category === 'bonds' ? `${asset.price.toFixed(3)}%` : asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-[11px] font-mono tabular-nums font-semibold ${
                  isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 inline mr-0.5" />
                )}
                {isPositive ? '+' : ''}
                {asset.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
