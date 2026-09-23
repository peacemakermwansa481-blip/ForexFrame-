export function numericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function sortTradesChronologically(trades = []) {
  return [...trades].sort((a, b) => {
    const dateDifference = new Date(a.trade_date) - new Date(b.trade_date);
    if (Number.isFinite(dateDifference) && dateDifference !== 0) {
      return dateDifference;
    }

    return String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });
}

/**
 * Returns the account equity after every trade, including the zero starting
 * point. The chart can therefore show both the starting balance and the
 * cumulative result instead of plotting isolated trade P/L values.
 */
export function buildEquityCurve(trades = []) {
  let equity = 0;
  const points = [{ trade: null, equity: 0 }];

  sortTradesChronologically(trades).forEach((trade) => {
    equity += numericValue(trade.simulated_pnl);
    points.push({ trade, equity });
  });

  return points;
}

export function calculatePerformanceMetrics(trades = []) {
  const profits = trades.map((trade) => numericValue(trade.simulated_pnl));

  if (profits.length === 0) {
    return { bestTrade: 0, worstTrade: 0, maxDrawdown: 0 };
  }

  let peak = 0;
  let maxDrawdown = 0;

  buildEquityCurve(trades).forEach(({ equity }) => {
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
  });

  return {
    bestTrade: Math.max(...profits),
    worstTrade: Math.min(...profits),
    maxDrawdown,
  };
}

export function getChartGeometry(equityCurve, width = 700, height = 260) {
  const padding = { top: 20, right: 20, bottom: 38, left: 78 };
  const values = equityCurve.map((point) => point.equity);
  const minEquity = Math.min(0, ...values);
  const maxEquity = Math.max(0, ...values);
  const range = maxEquity - minEquity || 1;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, index) => {
    const value = maxEquity - (index / (tickCount - 1)) * range;
    return {
      value,
      y: padding.top + (index / (tickCount - 1)) * innerHeight,
    };
  });

  const points = equityCurve.map((point, index) => ({
    ...point,
    x:
      equityCurve.length === 1
        ? padding.left + innerWidth / 2
        : padding.left + (index / (equityCurve.length - 1)) * innerWidth,
    y: padding.top + ((maxEquity - point.equity) / range) * innerHeight,
  }));

  return {
    points,
    zeroY: padding.top + (maxEquity / range) * innerHeight,
    minEquity,
    maxEquity,
    yTicks,
    padding,
  };
}
