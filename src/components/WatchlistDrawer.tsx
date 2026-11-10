import React, { useState } from 'react';
import { MarketAsset, WatchlistItem } from '../types/market';
import { Sparkline } from './Sparkline';
import { 
  X, 
  Trash2, 
  Bell, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: WatchlistItem[];
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  onSetAlert: (symbol: string, alertPrice: number, direction: 'above' | 'below') => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  assets,
  onSelectAsset,
  onRemoveFromWatchlist,
  onAddToWatchlist,
  onSetAlert,
}) => {
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [alertSymbol, setAlertSymbol] = useState<string | null>(null);
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>('');
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');

  if (!isOpen) return null;

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbolInput.trim()) return;
    const found = assets.find(
      (a) => a.symbol.toLowerCase() === newSymbolInput.trim().toLowerCase()
    );
    if (found) {
      onAddToWatchlist(found.symbol);
      setNewSymbolInput('');
    } else {
      alert(`Symbol "${newSymbolInput}" not found in current market directory.`);
    }
  };

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(alertTargetPrice);
    if (alertSymbol && !isNaN(priceNum) && priceNum > 0) {
      onSetAlert(alertSymbol, priceNum, alertDirection);
      setAlertSymbol(null);
      setAlertTargetPrice('');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#181b24] dark:bg-[#181b24] bg-white border-l border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 flex items-center justify-between bg-[#1e222d] dark:bg-[#1e222d] bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white dark:text-white text-slate-900 tracking-tight">
            TradingView Watchlist
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2962ff]/20 text-[#2962ff] font-bold">
            {watchlist.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-[#2a2e39] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Add Symbol Input */}
      <form onSubmit={handleAddSymbol} className="p-3 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 bg-[#131722] dark:bg-[#131722] bg-white shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add symbol (e.g. NVDA, BTC/USD)..."
            value={newSymbolInput}
            onChange={(e) => setNewSymbolInput(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-[#1e222d] dark:bg-[#1e222d] bg-slate-100 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 text-white dark:text-white text-slate-900 placeholder-[#787b86] focus:outline-none focus:border-[#2962ff] font-mono uppercase"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2962ff] text-white hover:bg-[#2962ff]/90 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </form>

      {/* Alert Set Modal / Overlay */}
      {alertSymbol && (
        <div className="p-3 bg-[#1e222d] dark:bg-[#1e222d] bg-slate-100 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white dark:text-white text-slate-800">
              Set Price Alert for {alertSymbol}
            </span>
            <button onClick={() => setAlertSymbol(null)} className="text-[#787b86] hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form onSubmit={handleSaveAlert} className="space-y-2 text-xs">
            <div className="flex gap-2">
              <select
                value={alertDirection}
                onChange={(e) => setAlertDirection(e.target.value as 'above' | 'below')}
                className="px-2 py-1 rounded bg-[#131722] dark:bg-[#131722] bg-white text-white dark:text-white text-slate-900 border border-[#2a2e39]"
              >
                <option value="above">Crosses Above (&gt;)</option>
                <option value="below">Crosses Below (&lt;)</option>
              </select>
              <input
                type="number"
                step="any"
                placeholder="Target Price"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(e.target.value)}
                required
                className="flex-1 px-2 py-1 rounded bg-[#131722] dark:bg-[#131722] bg-white text-white dark:text-white text-slate-900 border border-[#2a2e39] font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded bg-[#2962ff] text-white font-semibold hover:bg-[#2962ff]/90"
            >
              Set Alert
            </button>
          </form>
        </div>
      )}

      {/* Watchlist Items list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100">
        {watchlist.length === 0 ? (
          <div className="p-8 text-center text-[#787b86] text-xs">
            <p>Your watchlist is currently empty.</p>
            <p className="mt-1">Add symbols or click ★ on any market table row.</p>
          </div>
        ) : (
          watchlist.map((item) => {
            const asset = assets.find((a) => a.symbol === item.symbol);
            if (!asset) return null;
            const isPositive = asset.changePercent >= 0;

            return (
              <div
                key={item.symbol}
                onClick={() => onSelectAsset(asset)}
                className="p-3 hover:bg-[#202531] dark:hover:bg-[#202531] hover:bg-slate-50 transition-colors cursor-pointer group flex items-center justify-between text-xs"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white dark:text-white text-slate-900 group-hover:text-[#2962ff] transition-colors">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] text-[#787b86]">{asset.exchange}</span>
                  </div>
                  <span className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                    {asset.name}
                  </span>
                  {item.alertPrice && (
                    <span className="text-[10px] text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                      <Bell className="w-2.5 h-2.5" />
                      Alert {item.alertDirection} ${item.alertPrice}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-white dark:text-white text-slate-900">
                      ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-[11px] font-bold ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                      {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAlertSymbol(item.symbol);
                        setAlertTargetPrice(asset.price.toString());
                      }}
                      className="p-1 text-[#787b86] hover:text-amber-400"
                      title="Set Alert"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(item.symbol);
                      }}
                      className="p-1 text-[#787b86] hover:text-[#f23645]"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
