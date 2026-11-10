import React from 'react';
import { Portfolio, Position } from '../types/market';
import { X, RotateCcw, TrendingUp, TrendingDown, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PaperTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  onClosePosition: (positionId: string) => void;
  onResetPortfolio: () => void;
}

export const PaperTradingModal: React.FC<PaperTradingModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onClosePosition,
  onResetPortfolio,
}) => {
  if (!isOpen) return null;

  // Calculate current positions market value & unrealized P&L
  const positionsValue = portfolio.positions.reduce((sum, pos) => {
    return sum + pos.shares * pos.currentPrice;
  }, 0);

  const totalEquity = portfolio.cash + positionsValue;
  const totalReturn = totalEquity - portfolio.initialBalance;
  const totalReturnPct = (totalReturn / portfolio.initialBalance) * 100;
  const isPositive = totalReturn >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-[#131722] dark:bg-[#131722] bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 bg-[#1e222d] dark:bg-[#1e222d] bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white dark:text-white text-slate-900 tracking-tight">
              TradingView Simulated Paper Account
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#089981]/20 text-[#089981] font-bold">
              Live Demo
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portfolio KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#181b24] dark:bg-[#181b24] bg-slate-100 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 shrink-0 text-xs">
          <div>
            <span className="text-[#787b86] font-medium block">Total Equity</span>
            <span className="text-base font-mono tabular-nums font-bold text-white dark:text-white text-slate-900">
              ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[#787b86] font-medium block">Available Cash</span>
            <span className="text-base font-mono tabular-nums font-bold text-white dark:text-white text-slate-900">
              ${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[#787b86] font-medium block">Invested Capital</span>
            <span className="text-base font-mono tabular-nums font-bold text-white dark:text-white text-slate-900">
              ${positionsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[#787b86] font-medium block">Total Profit / Loss</span>
            <span className={`text-base font-mono tabular-nums font-bold flex items-center gap-1 ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {isPositive ? '+' : ''}${totalReturn.toFixed(2)} ({isPositive ? '+' : ''}{totalReturnPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Positions Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white dark:text-white text-slate-900">
              Open Positions ({portfolio.positions.length})
            </h4>
            <button
              onClick={onResetPortfolio}
              className="flex items-center gap-1 text-xs font-semibold text-[#787b86] hover:text-[#f23645] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Account to $100,000
            </button>
          </div>

          {portfolio.positions.length === 0 ? (
            <div className="py-12 text-center text-[#787b86] text-xs">
              <p>No open positions currently in your paper portfolio.</p>
              <p className="mt-1">Open any stock or crypto chart and click "Buy / Long" to place simulated trades.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#181b24] dark:bg-[#181b24] bg-slate-100 text-[#787b86] font-semibold border-b border-[#2a2e39]">
                  <tr>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Shares</th>
                    <th className="py-2.5 px-3 text-right">Entry Price</th>
                    <th className="py-2.5 px-3 text-right">Current Price</th>
                    <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2e39]/50 dark:divide-[#2a2e39]/50 divide-slate-100 font-mono tabular-nums">
                  {portfolio.positions.map((pos) => {
                    const diff = (pos.currentPrice - pos.entryPrice) * pos.shares;
                    const pnl = pos.type === 'buy' ? diff : -diff;
                    const pnlPct = (pnl / (pos.entryPrice * pos.shares)) * 100;
                    const isPos = pnl >= 0;

                    return (
                      <tr key={pos.id} className="hover:bg-[#1e222d] dark:hover:bg-[#1e222d] hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-bold text-white dark:text-white text-slate-900">
                          {pos.symbol}
                        </td>
                        <td className="py-2.5 px-3 uppercase font-bold text-[10px]">
                          <span className={pos.type === 'buy' ? 'text-[#089981]' : 'text-[#f23645]'}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-white dark:text-white text-slate-900">
                          {pos.shares}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#787b86]">
                          ${pos.entryPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-white dark:text-white text-slate-900 font-semibold">
                          ${pos.currentPrice.toFixed(2)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {isPos ? '+' : ''}${pnl.toFixed(2)} ({isPos ? '+' : ''}{pnlPct.toFixed(2)}%)
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className="px-2 py-1 rounded bg-[#2a2e39] hover:bg-[#f23645] hover:text-white text-[#d1d4dc] text-[11px] font-semibold transition-colors font-sans"
                          >
                            Close Position
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
