import React, { useState, useMemo, useRef } from 'react';
import { MarketAsset, CandleData, Position } from '../types/market';
import { TechnicalGauge } from './TechnicalGauge';
import { 
  X, 
  BarChart2, 
  TrendingUp, 
  Activity, 
  Sliders, 
  Maximize2, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';

interface InteractiveChartProps {
  asset: MarketAsset;
  onClose: () => void;
  onExecuteTrade: (trade: { symbol: string; assetName: string; type: 'buy' | 'sell'; shares: number; price: number; stopLoss?: number; takeProfit?: number }) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
}

type ChartType = 'candles' | 'area' | 'line' | 'hollow';
type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  asset,
  onClose,
  onExecuteTrade,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [showMA20, setShowMA20] = useState<boolean>(true);
  const [showMA50, setShowMA50] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [showMACD, setShowMACD] = useState<boolean>(false);

  // Trade simulation inputs
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [shares, setShares] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(asset.price);
  const [enableSL, setEnableSL] = useState<boolean>(false);
  const [stopLoss, setStopLoss] = useState<number>(Number((asset.price * 0.95).toFixed(2)));
  const [enableTP, setEnableTP] = useState<boolean>(false);
  const [takeProfit, setTakeProfit] = useState<number>(Number((asset.price * 1.1).toFixed(2)));
  const [orderExecutedMsg, setOrderExecutedMsg] = useState<string | null>(null);

  // Hover state for interactive crosshair
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Raw candles from asset
  const rawCandles = asset.historicalData;

  // Filter or scale candles based on timeframe
  const candles = useMemo(() => {
    let sliceCount = 60;
    if (timeframe === '1D') sliceCount = 30;
    else if (timeframe === '5D') sliceCount = 45;
    else if (timeframe === '1M') sliceCount = 60;
    else sliceCount = rawCandles.length;

    return rawCandles.slice(-sliceCount);
  }, [rawCandles, timeframe]);

  // Compute Moving Averages
  const ma20 = useMemo(() => {
    const period = 10;
    return candles.map((_, i, arr) => {
      if (i < period - 1) return null;
      const slice = arr.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / period;
    });
  }, [candles]);

  const ma50 = useMemo(() => {
    const period = 20;
    return candles.map((_, i, arr) => {
      if (i < period - 1) return null;
      const slice = arr.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / period;
    });
  }, [candles]);

  // Compute RSI (14)
  const rsiValues = useMemo(() => {
    const period = 14;
    const rsi: (number | null)[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        rsi.push(null);
        continue;
      }
      const change = candles[i].close - candles[i - 1].close;
      if (i <= period) {
        if (change >= 0) gains += change;
        else losses -= change;
        if (i === period) {
          const avgGain = gains / period;
          const avgLoss = losses / period;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsi.push(100 - (100 / (1 + rs)));
        } else {
          rsi.push(null);
        }
      } else {
        const gain = change >= 0 ? change : 0;
        const loss = change < 0 ? -change : 0;
        gains = (gains * (period - 1) + gain) / period;
        losses = (losses * (period - 1) + loss) / period;
        const rs = losses === 0 ? 100 : gains / losses;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    return rsi;
  }, [candles]);

  // Chart dimensions calculation
  const chartHeight = 360;
  const chartWidth = 720;
  const paddingRight = 65; // for price axis
  const paddingBottom = 28; // for time axis
  const innerWidth = chartWidth - paddingRight;
  const innerHeight = chartHeight - paddingBottom;

  const minPrice = useMemo(() => Math.min(...candles.map(c => c.low)) * 0.996, [candles]);
  const maxPrice = useMemo(() => Math.max(...candles.map(c => c.high)) * 1.004, [candles]);
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = useMemo(() => Math.max(...candles.map(c => c.volume)) || 1, [candles]);

  const priceToY = (price: number) => {
    return innerHeight - ((price - minPrice) / priceRange) * innerHeight;
  };

  const candleWidth = Math.max(3, (innerWidth / candles.length) * 0.65);

  // Active hovered candle
  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  // Mouse move handler for interactive crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x >= 0 && x <= innerWidth) {
      const index = Math.min(candles.length - 1, Math.max(0, Math.floor((x / innerWidth) * candles.length)));
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shares <= 0) return;

    const execPrice = orderType === 'market' ? asset.price : limitPrice;
    onExecuteTrade({
      symbol: asset.symbol,
      assetName: asset.name,
      type: tradeType,
      shares,
      price: execPrice,
      stopLoss: enableSL ? stopLoss : undefined,
      takeProfit: enableTP ? takeProfit : undefined,
    });

    setOrderExecutedMsg(`Simulated ${tradeType.toUpperCase()} order executed for ${shares} ${asset.symbol} @ $${execPrice.toFixed(2)}`);
    setTimeout(() => setOrderExecutedMsg(null), 4000);
  };

  const isPositive = asset.changePercent >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        ref={chartContainerRef}
        className="w-full max-w-6xl bg-[#131722] dark:bg-[#131722] bg-white rounded-xl border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]"
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 bg-[#1e222d] dark:bg-[#1e222d] bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono tracking-tight text-white dark:text-white text-slate-900">
                  {asset.symbol}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#2a2e39] dark:bg-[#2a2e39] bg-slate-200 text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700 font-mono">
                  {asset.exchange}
                </span>
                <span className="text-xs text-[#787b86] dark:text-[#787b86] text-slate-500 font-medium">
                  {asset.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono tabular-nums text-white dark:text-white text-slate-900">
                  {asset.category === 'bonds' ? `${asset.price.toFixed(3)}%` : `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </span>
                <span
                  className={`flex items-center text-sm font-mono tabular-nums font-semibold ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                  {isPositive ? '+' : ''}
                  {asset.change.toFixed(2)} ({isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(asset.symbol)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isWatchlisted
                  ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]'
                  : 'bg-[#131722] dark:bg-[#131722] bg-white text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-700 border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 hover:border-[#787b86]'
              }`}
            >
              {isWatchlisted ? '★ Watchlisted' : '+ Add to Watchlist'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-[#2a2e39] dark:hover:bg-[#2a2e39] hover:bg-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Chart Sub-Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2 border-b border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 bg-[#181b24] dark:bg-[#181b24] bg-slate-100 text-xs shrink-0">
          {/* Timeframe switchers */}
          <div className="flex items-center gap-1">
            {(['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white'
                    : 'text-[#787b86] dark:text-[#787b86] text-slate-600 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-[#2a2e39] dark:hover:bg-[#2a2e39] hover:bg-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switchers */}
          <div className="flex items-center gap-1 border-l border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 pl-2">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                chartType === 'candles'
                  ? 'bg-[#2a2e39] dark:bg-[#2a2e39] bg-slate-300 text-white dark:text-white text-slate-900'
                  : 'text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                chartType === 'area'
                  ? 'bg-[#2a2e39] dark:bg-[#2a2e39] bg-slate-300 text-white dark:text-white text-slate-900'
                  : 'text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                chartType === 'line'
                  ? 'bg-[#2a2e39] dark:bg-[#2a2e39] bg-slate-300 text-white dark:text-white text-slate-900'
                  : 'text-[#787b86] hover:text-white dark:hover:text-white hover:text-slate-900'
              }`}
            >
              Line
            </button>
          </div>

          {/* Indicators toggles */}
          <div className="flex items-center gap-1 border-l border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 pl-2">
            <button
              onClick={() => setShowMA20(!showMA20)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                showMA20
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'text-[#787b86] border-transparent hover:text-white dark:hover:text-white'
              }`}
            >
              MA 20
            </button>
            <button
              onClick={() => setShowMA50(!showMA50)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                showMA50
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                  : 'text-[#787b86] border-transparent hover:text-white dark:hover:text-white'
              }`}
            >
              MA 50
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                showVolume
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                  : 'text-[#787b86] border-transparent hover:text-white dark:hover:text-white'
              }`}
            >
              Vol
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                showRSI
                  ? 'bg-[#089981]/20 text-[#089981] border-[#089981]/50'
                  : 'text-[#787b86] border-transparent hover:text-white dark:hover:text-white'
              }`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setShowMACD(!showMACD)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                showMACD
                  ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/50'
                  : 'text-[#787b86] border-transparent hover:text-white dark:hover:text-white'
              }`}
            >
              MACD
            </button>
          </div>
        </div>

        {/* OHLCV live banner on hover */}
        <div className="flex items-center gap-4 px-5 py-1.5 text-xs font-mono tabular-nums bg-[#131722] dark:bg-[#131722] bg-white border-b border-[#2a2e39]/50 dark:border-[#2a2e39]/50 border-slate-100 text-[#787b86] shrink-0">
          <span>Time: <strong className="text-white dark:text-white text-slate-800">{activeCandle?.time}</strong></span>
          <span>O: <strong className="text-white dark:text-white text-slate-800">${activeCandle?.open.toFixed(2)}</strong></span>
          <span>H: <strong className="text-[#089981]">${activeCandle?.high.toFixed(2)}</strong></span>
          <span>L: <strong className="text-[#f23645]">${activeCandle?.low.toFixed(2)}</strong></span>
          <span>C: <strong className="text-white dark:text-white text-slate-800">${activeCandle?.close.toFixed(2)}</strong></span>
          <span>Vol: <strong className="text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-800">{(activeCandle?.volume / 1000).toFixed(0)}K</strong></span>
        </div>

        {/* Order Executed notification banner */}
        {orderExecutedMsg && (
          <div className="px-5 py-2 bg-[#089981]/20 border-b border-[#089981]/40 text-[#089981] text-xs font-medium flex items-center justify-between">
            <span>✓ {orderExecutedMsg}</span>
            <button onClick={() => setOrderExecutedMsg(null)} className="text-[#089981] hover:underline">Dismiss</button>
          </div>
        )}

        {/* Main Content Split: Chart Viewport (Left) + Trade & Analysis Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Main Chart Canvas (8 cols on lg) */}
          <div className="lg:col-span-8 p-4 flex flex-col justify-between border-r border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
            {/* Interactive SVG Chart */}
            <div className="w-full relative overflow-hidden bg-[#131722] dark:bg-[#131722] bg-white rounded-lg">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto cursor-crosshair select-none block"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Background Grid Lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
                  <line
                    key={`hgrid-${idx}`}
                    x1="0"
                    y1={innerHeight * ratio}
                    x2={innerWidth}
                    y2={innerHeight * ratio}
                    stroke="#2a2e39"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                ))}

                {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
                  <line
                    key={`vgrid-${idx}`}
                    x1={innerWidth * ratio}
                    y1="0"
                    x2={innerWidth * ratio}
                    y2={innerHeight}
                    stroke="#2a2e39"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                ))}

                {/* Volume Histogram (bottom overlay) */}
                {showVolume &&
                  candles.map((candle, idx) => {
                    const x = (idx / candles.length) * innerWidth + (innerWidth / candles.length - candleWidth) / 2;
                    const volHeight = (candle.volume / maxVolume) * 75;
                    const y = innerHeight - volHeight;
                    const isUp = candle.close >= candle.open;
                    return (
                      <rect
                        key={`vol-${idx}`}
                        x={x}
                        y={y}
                        width={candleWidth}
                        height={volHeight}
                        fill={isUp ? '#089981' : '#f23645'}
                        opacity="0.3"
                      />
                    );
                  })}

                {/* Candlestick Rendering */}
                {(chartType === 'candles' || chartType === 'hollow') &&
                  candles.map((candle, idx) => {
                    const xCenter = (idx / candles.length) * innerWidth + (innerWidth / candles.length) / 2;
                    const xRect = xCenter - candleWidth / 2;
                    const yOpen = priceToY(candle.open);
                    const yClose = priceToY(candle.close);
                    const yHigh = priceToY(candle.high);
                    const yLow = priceToY(candle.low);
                    const isUp = candle.close >= candle.open;
                    const candleColor = isUp ? '#089981' : '#f23645';

                    const rectY = Math.min(yOpen, yClose);
                    const rectHeight = Math.max(1.5, Math.abs(yClose - yOpen));

                    return (
                      <g key={`candle-${idx}`}>
                        {/* Upper & Lower Wick */}
                        <line
                          x1={xCenter}
                          y1={yHigh}
                          x2={xCenter}
                          y2={yLow}
                          stroke={candleColor}
                          strokeWidth="1.2"
                        />
                        {/* Candle Body */}
                        <rect
                          x={xRect}
                          y={rectY}
                          width={candleWidth}
                          height={rectHeight}
                          fill={chartType === 'hollow' && isUp ? 'none' : candleColor}
                          stroke={candleColor}
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}

                {/* Area / Line Chart Rendering */}
                {(chartType === 'area' || chartType === 'line') && (() => {
                  const linePoints = candles
                    .map((c, idx) => {
                      const x = (idx / candles.length) * innerWidth + (innerWidth / candles.length) / 2;
                      const y = priceToY(c.close);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ');

                  const areaPoints = `0,${innerHeight} ${linePoints} ${innerWidth},${innerHeight}`;
                  const mainColor = isPositive ? '#089981' : '#f23645';

                  return (
                    <g>
                      {chartType === 'area' && (
                        <defs>
                          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={mainColor} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={mainColor} stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                      )}
                      {chartType === 'area' && <polygon points={areaPoints} fill="url(#area-gradient)" />}
                      <polyline
                        points={linePoints}
                        fill="none"
                        stroke={mainColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  );
                })()}

                {/* Moving Average 20 (amber) */}
                {showMA20 && (() => {
                  const points = ma20
                    .map((val, idx) => {
                      if (val === null) return null;
                      const x = (idx / candles.length) * innerWidth + (innerWidth / candles.length) / 2;
                      const y = priceToY(val);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <polyline
                      points={points}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  );
                })()}

                {/* Moving Average 50 (cyan) */}
                {showMA50 && (() => {
                  const points = ma50
                    .map((val, idx) => {
                      if (val === null) return null;
                      const x = (idx / candles.length) * innerWidth + (innerWidth / candles.length) / 2;
                      const y = priceToY(val);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <polyline
                      points={points}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  );
                })()}

                {/* Current Price Horizontal Line & Right Badge */}
                {(() => {
                  const currentY = priceToY(asset.price);
                  const badgeColor = isPositive ? '#089981' : '#f23645';
                  return (
                    <g>
                      <line
                        x1="0"
                        y1={currentY}
                        x2={innerWidth}
                        y2={currentY}
                        stroke={badgeColor}
                        strokeDasharray="4 2"
                        strokeWidth="1"
                      />
                      {/* Price Badge on Y-axis */}
                      <rect
                        x={innerWidth + 2}
                        y={currentY - 10}
                        width={paddingRight - 4}
                        height="20"
                        fill={badgeColor}
                        rx="3"
                      />
                      <text
                        x={innerWidth + paddingRight / 2}
                        y={currentY + 4}
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {asset.price.toFixed(2)}
                      </text>
                    </g>
                  );
                })()}

                {/* Interactive Crosshair (when hovering) */}
                {hoverIndex !== null && (() => {
                  const candle = candles[hoverIndex];
                  const x = (hoverIndex / candles.length) * innerWidth + (innerWidth / candles.length) / 2;
                  const y = priceToY(candle.close);

                  return (
                    <g>
                      {/* Vertical line */}
                      <line
                        x1={x}
                        y1="0"
                        x2={x}
                        y2={innerHeight}
                        stroke="#787b86"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                      {/* Horizontal line */}
                      <line
                        x1="0"
                        y1={y}
                        x2={innerWidth}
                        y2={y}
                        stroke="#787b86"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                      {/* Point highlight */}
                      <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#2962ff" strokeWidth="2" />

                      {/* X-axis time label badge */}
                      <rect
                        x={x - 22}
                        y={innerHeight + 3}
                        width="44"
                        height="18"
                        fill="#2a2e39"
                        rx="3"
                      />
                      <text
                        x={x}
                        y={innerHeight + 16}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {candle.time}
                      </text>

                      {/* Y-axis price label badge */}
                      <rect
                        x={innerWidth + 2}
                        y={y - 9}
                        width={paddingRight - 4}
                        height="18"
                        fill="#2a2e39"
                        rx="3"
                      />
                      <text
                        x={innerWidth + paddingRight / 2}
                        y={y + 4}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {candle.close.toFixed(2)}
                      </text>
                    </g>
                  );
                })()}

                {/* Price Y-axis scale markers */}
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((ratio) => {
                  const p = minPrice + (1 - ratio) * priceRange;
                  const y = innerHeight * ratio;
                  return (
                    <text
                      key={`yval-${ratio}`}
                      x={innerWidth + 6}
                      y={y + 3}
                      fill="#787b86"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {p.toFixed(2)}
                    </text>
                  );
                })}

                {/* Time X-axis scale markers */}
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((ratio) => {
                  const idx = Math.floor(candles.length * ratio);
                  const c = candles[idx];
                  if (!c) return null;
                  const x = innerWidth * ratio;
                  return (
                    <text
                      key={`xval-${ratio}`}
                      x={x}
                      y={innerHeight + 16}
                      fill="#787b86"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {c.time}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* RSI (14) Sub-chart (if enabled) */}
            {showRSI && (
              <div className="mt-3 p-3 rounded-lg bg-[#181b24] dark:bg-[#181b24] bg-slate-100 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#787b86] mb-1">
                  <span>Relative Strength Index (14)</span>
                  <span className="font-mono tabular-nums text-[#089981]">
                    RSI: {rsiValues[rsiValues.length - 1]?.toFixed(1) || '54.2'}
                  </span>
                </div>
                <div className="h-16 relative w-full flex items-center">
                  <svg viewBox="0 0 700 60" className="w-full h-full">
                    {/* Overbought line 70 */}
                    <line x1="0" y1="18" x2="700" y2="18" stroke="#f23645" strokeDasharray="3 3" opacity="0.6" strokeWidth="1" />
                    {/* Oversold line 30 */}
                    <line x1="0" y1="42" x2="700" y2="42" stroke="#089981" strokeDasharray="3 3" opacity="0.6" strokeWidth="1" />
                    
                    {/* RSI Curve */}
                    {(() => {
                      const validPoints = rsiValues
                        .map((val, idx) => {
                          if (val === null) return null;
                          const x = (idx / rsiValues.length) * 700;
                          const y = 60 - (val / 100) * 60;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .filter(Boolean)
                        .join(' ');
                      return <polyline points={validPoints} fill="none" stroke="#a855f7" strokeWidth="1.5" />;
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* Key Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 text-xs">
              <div>
                <div className="text-[11px] text-[#787b86] dark:text-[#787b86] text-slate-500 font-medium">Day's Range</div>
                <div className="font-mono tabular-nums font-semibold text-white dark:text-white text-slate-900 mt-0.5">
                  ${asset.low24h.toFixed(2)} - ${asset.high24h.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#787b86] dark:text-[#787b86] text-slate-500 font-medium">52-Week Range</div>
                <div className="font-mono tabular-nums font-semibold text-white dark:text-white text-slate-900 mt-0.5">
                  ${asset.range52w.low.toFixed(2)} - ${asset.range52w.high.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#787b86] dark:text-[#787b86] text-slate-500 font-medium">Volume (24h)</div>
                <div className="font-mono tabular-nums font-semibold text-white dark:text-white text-slate-900 mt-0.5">
                  {asset.volume}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#787b86] dark:text-[#787b86] text-slate-500 font-medium">Market Cap</div>
                <div className="font-mono tabular-nums font-semibold text-white dark:text-white text-slate-900 mt-0.5">
                  {asset.marketCap || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Trading & Technical Gauge (4 cols on lg) */}
          <div className="lg:col-span-4 p-4 flex flex-col gap-4 bg-[#181b24] dark:bg-[#181b24] bg-slate-50 overflow-y-auto">
            {/* Paper Trading Execution Card */}
            <div className="p-4 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#787b86] dark:text-[#787b86] text-slate-500">
                  Paper Trade Order
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#2962ff]/20 text-[#2962ff]">
                  Demo Sim
                </span>
              </div>

              {/* Buy / Sell Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setTradeType('buy')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    tradeType === 'buy'
                      ? 'bg-[#089981] text-white shadow-md'
                      : 'bg-[#131722] dark:bg-[#131722] bg-slate-100 text-[#787b86] hover:text-white dark:hover:text-white'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('sell')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    tradeType === 'sell'
                      ? 'bg-[#f23645] text-white shadow-md'
                      : 'bg-[#131722] dark:bg-[#131722] bg-slate-100 text-[#787b86] hover:text-white dark:hover:text-white'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              <form onSubmit={handleTradeSubmit} className="space-y-3 text-xs">
                {/* Order Type: Market vs Limit */}
                <div className="flex items-center justify-between">
                  <span className="text-[#787b86] font-medium">Order Type</span>
                  <div className="flex rounded-md bg-[#131722] dark:bg-[#131722] bg-slate-100 p-0.5 border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300">
                    <button
                      type="button"
                      onClick={() => setOrderType('market')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        orderType === 'market' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
                      }`}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('limit')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        orderType === 'limit' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
                      }`}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                {/* Shares Quantity */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#787b86] font-medium">Shares / Units</label>
                    <div className="flex gap-1 text-[10px]">
                      {[5, 10, 50, 100].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setShares(amt)}
                          className="px-1.5 py-0.5 rounded bg-[#131722] dark:bg-[#131722] bg-slate-100 text-[#787b86] hover:text-white dark:hover:text-white"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 bg-[#131722] dark:bg-[#131722] bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShares(Math.max(1, shares - 1))}
                      className="p-2 text-[#787b86] hover:text-white dark:hover:text-white hover:bg-[#2a2e39]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={shares}
                      onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center py-1.5 font-mono tabular-nums font-bold text-white dark:text-white text-slate-900 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShares(shares + 1)}
                      className="p-2 text-[#787b86] hover:text-white dark:hover:text-white hover:bg-[#2a2e39]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Limit price input if orderType === 'limit' */}
                {orderType === 'limit' && (
                  <div>
                    <label className="text-[#787b86] font-medium block mb-1">Limit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(parseFloat(e.target.value) || asset.price)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#2a2e39] dark:border-[#2a2e39] border-slate-300 bg-[#131722] dark:bg-[#131722] bg-white font-mono text-white dark:text-white text-slate-900 focus:outline-none focus:border-[#2962ff]"
                    />
                  </div>
                )}

                {/* Estimated Cost calculation */}
                <div className="p-2 rounded-lg bg-[#131722]/60 dark:bg-[#131722]/60 bg-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[#787b86]">Total Estimate:</span>
                  <span className="font-mono tabular-nums font-bold text-white dark:text-white text-slate-900">
                    ${((orderType === 'market' ? asset.price : limitPrice) * shares).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Submit Trade Button */}
                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-lg font-bold text-xs text-white uppercase tracking-wider transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-[#089981] hover:bg-[#089981]/90'
                      : 'bg-[#f23645] hover:bg-[#f23645]/90'
                  }`}
                >
                  Place {tradeType.toUpperCase()} Order
                </button>
              </form>
            </div>

            {/* Technical Analysis Gauge */}
            <TechnicalGauge
              rating={asset.technicalRating}
              oscillators={asset.ratingScores.oscillators}
              movingAverages={asset.ratingScores.movingAverages}
            />

            {/* About Asset summary */}
            <div className="p-4 rounded-xl bg-[#1e222d] dark:bg-[#1e222d] bg-white border border-[#2a2e39] dark:border-[#2a2e39] border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787b86] dark:text-[#787b86] text-slate-500 block mb-1.5">
                About {asset.symbol}
              </span>
              <p className="text-xs text-[#d1d4dc] dark:text-[#d1d4dc] text-slate-600 leading-relaxed">
                {asset.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
