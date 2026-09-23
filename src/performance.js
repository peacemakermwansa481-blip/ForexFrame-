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

export const EQUITY_PERIODS = [1, 7, 30, 90, 180, 365];
export const STAT_PERIODS = ["all", "today", "week", "month", "30", "custom"];

export function filterTradesByPeriod(trades = [], periodDays = 30) {
  const orderedTrades = sortTradesChronologically(trades);
  if (orderedTrades.length === 0) return [];

  const latestDate = new Date(orderedTrades[orderedTrades.length - 1].trade_date);
  if (!Number.isFinite(latestDate.getTime())) return orderedTrades;

  const latestDay = new Date(latestDate);
  latestDay.setHours(0, 0, 0, 0);
  const cutoff = new Date(latestDay);
  cutoff.setDate(cutoff.getDate() - Math.max(0, Number(periodDays) - 1));

  return orderedTrades.filter((trade) => {
    const tradeDate = new Date(trade.trade_date);
    return (
      Number.isFinite(tradeDate.getTime()) &&
      tradeDate >= cutoff &&
      tradeDate <= latestDate
    );
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

export function filterTradesByDateRange(trades = [], startDate = null, endDate = null) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  return sortTradesChronologically(trades).filter((trade) => {
    const date = new Date(trade.trade_date);
    if (!Number.isFinite(date.getTime())) return false;
    return (!start || date >= start) && (!end || date <= end);
  });
}

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getStatisticsDateRange(period, now = new Date(), customStart = "", customEnd = "") {
  const current = new Date(now);
  const today = startOfDay(current);

  if (period === "all") return { start: null, end: null };
  if (period === "custom") {
    return {
      start: customStart ? startOfDay(new Date(`${customStart}T00:00:00`)) : null,
      end: customEnd ? endOfDay(new Date(`${customEnd}T00:00:00`)) : null,
    };
  }
  if (period === "today") return { start: today, end: endOfDay(current) };
  if (period === "month") {
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: endOfDay(current) };
  }
  if (period === "week") {
    const mondayOffset = (today.getDay() + 6) % 7;
    const start = new Date(today);
    start.setDate(today.getDate() - mondayOffset);
    return { start, end: endOfDay(current) };
  }

  const days = Number(period) || 30;
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  return { start, end: endOfDay(current) };
}

function normalizedProfitLoss(trade) {
  const amount = Math.abs(numericValue(trade.simulated_pnl));
  const outcome = String(trade.outcome || "").toLowerCase();
  if (outcome === "loss") return -amount;
  if (outcome === "win") return amount;
  return numericValue(trade.simulated_pnl);
}

export function calculateTradingStatistics(trades = []) {
  const orderedTrades = sortTradesChronologically(trades);
  const wins = orderedTrades.filter((trade) => String(trade.outcome || "").toLowerCase() === "win");
  const losses = orderedTrades.filter((trade) => String(trade.outcome || "").toLowerCase() === "loss");
  const breakevens = orderedTrades.filter((trade) => String(trade.outcome || "").toLowerCase() === "breakeven");
  const profits = orderedTrades.map(normalizedProfitLoss);
  const winningProfits = wins.map(normalizedProfitLoss);
  const losingProfits = losses.map(normalizedProfitLoss);
  const grossProfit = profits.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
  const grossLoss = profits.filter((value) => value < 0).reduce((sum, value) => sum + value, 0);

  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  let winningStreak = 0;
  let losingStreak = 0;
  let currentWins = 0;
  let currentLosses = 0;

  orderedTrades.forEach((trade, index) => {
    equity += profits[index];
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
    const outcome = String(trade.outcome || "").toLowerCase();
    currentWins = outcome === "win" ? currentWins + 1 : 0;
    currentLosses = outcome === "loss" ? currentLosses + 1 : 0;
    winningStreak = Math.max(winningStreak, currentWins);
    losingStreak = Math.max(losingStreak, currentLosses);
  });

  const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const denominator = wins.length + losses.length;

  return {
    totalTrades: orderedTrades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    breakevenTrades: breakevens.length,
    winRate: denominator ? (wins.length / denominator) * 100 : 0,
    totalPnL: profits.reduce((sum, value) => sum + value, 0),
    averageWinningTrade: average(winningProfits),
    averageLosingTrade: average(losingProfits),
    averageRMultiple: average(orderedTrades.map((trade) => numericValue(trade.r_multiple))),
    profitFactor: grossLoss < 0 ? grossProfit / Math.abs(grossLoss) : null,
    largestWin: profits.length ? Math.max(0, ...profits) : 0,
    largestLoss: profits.length ? Math.min(0, ...profits) : 0,
    maxDrawdown,
    winningStreak,
    losingStreak,
  };
}
