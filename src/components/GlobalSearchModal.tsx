import React, { useState, useEffect, useRef } from 'react';
import { MarketAsset } from '../types/market';
import { Search, X, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter assets
  const filtered = assets.filter((asset) => {
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(filtered.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectAsset(filtered[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl bg-[#181b24] dark:bg-[#181b24] bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search input header */}
        <div className="p-3 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 flex items-center gap-3 bg-[#1e222d] dark:bg-[#1e222d] bg-slate-50">
          <Search className="w-5 h-5 text-[#787b86]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search symbol, company, or market..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-white dark:text-white text-slate-900 placeholder-[#787b86] focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#131722] dark:bg-[#131722] bg-slate-200 text-[#787b86]">
            ESC
          </kbd>
          <button onClick={onClose} className="text-[#787b86] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 p-2 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 overflow-x-auto text-xs bg-[#131722] dark:bg-[#131722] bg-white">
          {['all', 'stocks', 'crypto', 'indices', 'forex', 'futures', 'bonds', 'etfs'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md font-semibold capitalize whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100 text-xs">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#787b86]">
              No instruments found matching "{query}"
            </div>
          ) : (
            filtered.map((asset, idx) => {
              const isSelected = idx === selectedIndex;
              const isPositive = asset.changePercent >= 0;

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#2962ff]/20 text-white' : 'hover:bg-[#1e222d] dark:hover:bg-[#1e222d] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white dark:text-white text-slate-900 text-sm">
                      {asset.symbol}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-white dark:text-white text-slate-800 font-medium">{asset.name}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#787b86] font-mono">
                        <span>{asset.exchange}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{asset.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-white dark:text-white text-slate-900 text-sm">
                      ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-[11px] font-bold ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                      {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
