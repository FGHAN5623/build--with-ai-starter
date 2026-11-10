import React, { useState, useMemo } from 'react';
import { MarketAsset, AssetCategory, TechnicalRating } from '../types/market';
import { Sparkline } from './Sparkline';
import { 
  Search, 
  ArrowUpDown, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Bookmark
} from 'lucide-react';

interface ScreenerViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlistSymbols: string[];
  onToggleWatchlist: (symbol: string) => void;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volumeNumeric' | 'marketCapNumeric';
type SortOrder = 'asc' | 'desc';

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  assets,
  onSelectAsset,
  watchlistSymbols,
  onToggleWatchlist,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filtered & Sorted Assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        // Category
        if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
        // Technical Rating
        if (ratingFilter !== 'all' && asset.technicalRating !== ratingFilter) return false;
        // Performance
        if (performanceFilter === 'positive' && asset.changePercent < 0) return false;
        if (performanceFilter === 'negative' && asset.changePercent >= 0) return false;
        if (performanceFilter === 'gainers' && asset.changePercent < 3) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            asset.symbol.toLowerCase().includes(q) ||
            asset.name.toLowerCase().includes(q) ||
            (asset.sector && asset.sector.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField] ?? 0;
        let valB: any = b[sortField] ?? 0;

        if (sortField === 'symbol') {
          return sortOrder === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [assets, categoryFilter, ratingFilter, performanceFilter, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = ['Symbol', 'Name', 'Category', 'Price', 'Change', 'ChangePercent', 'Volume', 'MarketCap', 'TechnicalRating'];
    const rows = filteredAssets.map(a => [
      a.symbol,
      `"${a.name}"`,
      a.category,
      a.price,
      a.change,
      `${a.changePercent}%`,
      a.volume,
      a.marketCap || 'N/A',
      a.technicalRating,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradingview_screener_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRatingBadge = (rating: TechnicalRating) => {
    switch (rating) {
      case 'Strong Buy':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#089981]/20 text-[#089981]">Strong Buy</span>;
      case 'Buy':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#4caf50]/20 text-[#4caf50]">Buy</span>;
      case 'Neutral':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#787b86]/20 text-[#787b86]">Neutral</span>;
      case 'Sell':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f77c80]/20 text-[#f77c80]">Sell</span>;
      case 'Strong Sell':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f23645]/20 text-[#f23645]">Strong Sell</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls Bar */}
      <div className="p-4 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white dark:text-white text-slate-900 tracking-tight">
              Markets Screener
            </h1>
            <p className="text-xs text-[#787b86] dark:text-[#787b86] text-slate-500 mt-0.5">
              Screen and filter across global stocks, indices, crypto, forex, futures, and bonds with technical ratings
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#131722] dark:bg-[#131722] bg-slate-100 hover:bg-[#2a2e39] dark:hover:bg-[#2a2e39] hover:bg-slate-200 text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#787b86]" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#131722] dark:bg-[#131722] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 text-white dark:text-white text-slate-900 placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#131722] dark:bg-[#131722] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 text-white dark:text-white text-slate-900 focus:outline-none focus:border-[#2962ff]"
            >
              <option value="all">All Asset Classes</option>
              <option value="stocks">Stocks</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="indices">Indices</option>
              <option value="forex">Forex</option>
              <option value="futures">Futures</option>
              <option value="bonds">Bonds</option>
              <option value="etfs">ETFs</option>
            </select>
          </div>

          {/* Technical Rating Filter */}
          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#131722] dark:bg-[#131722] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 text-white dark:text-white text-slate-900 focus:outline-none focus:border-[#2962ff]"
            >
              <option value="all">All Technical Ratings</option>
              <option value="Strong Buy">Strong Buy</option>
              <option value="Buy">Buy</option>
              <option value="Neutral">Neutral</option>
              <option value="Sell">Sell</option>
            </select>
          </div>

          {/* Performance Filter */}
          <div>
            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#131722] dark:bg-[#131722] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 text-white dark:text-white text-slate-900 focus:outline-none focus:border-[#2962ff]"
            >
              <option value="all">All Performance</option>
              <option value="gainers">Top Gainers (&gt; +3%)</option>
              <option value="positive">Positive Only</option>
              <option value="negative">Negative Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Screener Table */}
      <div className="rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 overflow-x-auto bg-[#1e222d] dark:bg-[#1e222d] bg-white shadow-sm">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#181b24] dark:bg-[#181b24] bg-slate-100 text-[#787b86] font-semibold border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 select-none">
            <tr>
              <th className="py-3 px-4 w-10">★</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-3 px-4 cursor-pointer hover:text-white dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <span>Symbol & Name</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Last Price</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Change %</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Technical Rating</th>
              <th
                onClick={() => handleSort('volumeNumeric')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>24h Volume</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('marketCapNumeric')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Market Cap</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">24h Sparkline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100 font-mono tabular-nums">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#787b86]">
                  No matching instruments found for your filter criteria.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const isPositive = asset.changePercent >= 0;
                const isWatchlisted = watchlistSymbols.includes(asset.symbol);

                return (
                  <tr
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className="hover:bg-[#202531] dark:hover:bg-[#202531] hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Watchlist star */}
                    <td
                      className="py-3 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(asset.symbol);
                      }}
                    >
                      <button className="text-[#787b86] hover:text-[#2962ff]">
                        <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-[#2962ff] text-[#2962ff]' : ''}`} />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white dark:text-white text-slate-900 group-hover:text-[#2962ff] transition-colors">
                          {asset.symbol}
                        </span>
                        <span className="text-xs text-[#787b86] truncate max-w-[180px]">
                          {asset.name}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-bold text-white dark:text-white text-slate-900">
                      {asset.category === 'bonds' ? `${asset.price.toFixed(3)}%` : `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </td>

                    {/* Change % */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center font-bold ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        {isPositive ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Technical Rating */}
                    <td className="py-3 px-4 text-center font-sans">
                      {getRatingBadge(asset.technicalRating)}
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-4 text-right text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700">
                      {asset.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-4 text-right text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700">
                      {asset.marketCap || '—'}
                    </td>

                    {/* Mini Sparkline */}
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <Sparkline data={asset.sparkline} isPositive={isPositive} width={90} height={28} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
