import React from 'react';
import { TechnicalRating } from '../types/market';

interface TechnicalGaugeProps {
  rating: TechnicalRating;
  oscillators: { buy: number; neutral: number; sell: number };
  movingAverages: { buy: number; neutral: number; sell: number };
}

export const TechnicalGauge: React.FC<TechnicalGaugeProps> = ({
  rating,
  oscillators,
  movingAverages,
}) => {
  // Map rating to angle on 180-degree semi-circle (-90 to +90 degrees)
  const ratingToAngle: Record<TechnicalRating, number> = {
    'Strong Sell': -70,
    'Sell': -35,
    'Neutral': 0,
    'Buy': 35,
    'Strong Buy': 70,
  };

  const ratingToColor: Record<TechnicalRating, string> = {
    'Strong Sell': '#f23645',
    'Sell': '#f77c80',
    'Neutral': '#787b86',
    'Buy': '#4caf50',
    'Strong Buy': '#089981',
  };

  const needleAngle = ratingToAngle[rating] ?? 0;
  const ratingColor = ratingToColor[rating] ?? '#787b86';

  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-slate-100 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#787b86] dark:text-[#787b86] text-slate-500">
          Technical Analysis
        </span>
        <span
          className="text-xs font-bold uppercase px-2 py-0.5 rounded text-white"
          style={{ backgroundColor: ratingColor }}
        >
          {rating}
        </span>
      </div>

      {/* Speedometer semi-circle arc */}
      <div className="relative w-48 h-24 my-2 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background Track Arcs */}
          {/* Strong Sell (Ruby Red) */}
          <path
            d="M 20 100 A 80 80 0 0 1 45 43"
            fill="none"
            stroke="#f23645"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Sell (Soft Red) */}
          <path
            d="M 50 38 A 80 80 0 0 1 85 22"
            fill="none"
            stroke="#f77c80"
            strokeWidth="12"
          />
          {/* Neutral (Gray) */}
          <path
            d="M 90 21 A 80 80 0 0 1 110 21"
            fill="none"
            stroke="#787b86"
            strokeWidth="12"
          />
          {/* Buy (Light Green) */}
          <path
            d="M 115 22 A 80 80 0 0 1 150 38"
            fill="none"
            stroke="#4caf50"
            strokeWidth="12"
          />
          {/* Strong Buy (Emerald) */}
          <path
            d="M 155 43 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#089981"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Pivot point */}
          <circle cx="100" cy="98" r="7" fill="#2a2e39" />
          <circle cx="100" cy="98" r="4" fill="#ffffff" />

          {/* Needle */}
          <g transform={`rotate(${needleAngle}, 100, 98)`}>
            <polygon points="98,98 102,98 100,28" fill="#ffffff" />
          </g>
        </svg>

        {/* Labels under arc */}
        <div className="absolute bottom-0 w-full flex justify-between px-2 text-[10px] text-[#787b86] font-semibold">
          <span>SELL</span>
          <span>NEUTRAL</span>
          <span>BUY</span>
        </div>
      </div>

      {/* Oscillators and Moving Averages breakdown */}
      <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 text-xs">
        {/* Oscillators */}
        <div className="p-2 rounded-lg bg-[#131722]/50 dark:bg-[#131722]/50 bg-white/60">
          <div className="text-[11px] font-semibold text-[#787b86] mb-1">Oscillators</div>
          <div className="flex items-center justify-between font-mono tabular-nums text-[11px]">
            <span className="text-[#089981] font-bold">{oscillators.buy} Buy</span>
            <span className="text-[#787b86]">{oscillators.neutral} Neut</span>
            <span className="text-[#f23645] font-bold">{oscillators.sell} Sell</span>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="p-2 rounded-lg bg-[#131722]/50 dark:bg-[#131722]/50 bg-white/60">
          <div className="text-[11px] font-semibold text-[#787b86] mb-1">Moving Averages</div>
          <div className="flex items-center justify-between font-mono tabular-nums text-[11px]">
            <span className="text-[#089981] font-bold">{movingAverages.buy} Buy</span>
            <span className="text-[#787b86]">{movingAverages.neutral} Neut</span>
            <span className="text-[#f23645] font-bold">{movingAverages.sell} Sell</span>
          </div>
        </div>
      </div>
    </div>
  );
};
