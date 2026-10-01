export function numericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function validPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function normalizedTradePnL(trade = {}) {
  const amount = Number(trade.simulated_pnl);
  if (!Number.isFinite(amount)) return null;
  const outcome = String(trade.outcome || "").toLowerCase();
  if (outcome === "loss") return -Math.abs(amount);
  if (outcome === "win") return Math.abs(amount);
  return amount;
}

export function calculateMonetaryRisk(trade = {}) {
  const entry = Number(trade.entry_price ?? trade.entry);
  const stop = Number(trade.stop_price ?? trade.stopLoss ?? trade.stop_loss);
  const size = Number(trade.position_size ?? trade.positionSize);
  if (![entry, stop, size].every(Number.isFinite) || size === 0 || entry === stop) return null;
  const risk = Math.abs(entry - stop) * Math.abs(size);
  return Number.isFinite(risk) && risk > 0 ? risk : null;
}

export function calculateTradeMetrics(trade = {}, balanceBefore = null) {
  const monetaryRisk = calculateMonetaryRisk(trade);
  const balance = validPositiveNumber(balanceBefore);
  const pnl = normalizedTradePnL(trade);
  const riskPercent = monetaryRisk !== null && balance !== null ? (monetaryRisk / balance) * 100 : null;
  const rMultiple = monetaryRisk !== null && pnl !== null ? pnl / monetaryRisk : null;
  return {
    balanceBefore: balance,
    monetaryRisk,
    simulatedRiskPercent: Number.isFinite(riskPercent) ? riskPercent : null,
    rMultiple: Number.isFinite(rMultiple) ? rMultiple : null,
    pnl,
  };
}

export function calculateBalanceBeforeTrade(trades = [], trade = {}, startingBalance = 0) {
  const initial = Number(startingBalance);
  if (!Number.isFinite(initial) || initial <= 0) return null;
  const targetDate = new Date(trade.trade_date).getTime();
  if (!Number.isFinite(targetDate)) return null;
  const candidates = trades.filter((item) => item.id !== trade.id);
  const sequence = sortTradesChronologically([...candidates, trade]);
  const targetIndex = sequence.indexOf(trade);
  return sequence.slice(0, targetIndex < 0 ? sequence.length : targetIndex)
    .reduce((balance, item) => {
      const pnl = normalizedTradePnL(item);
      return pnl === null ? balance : balance + pnl;
    }, initial);
}

export function calculateJournalTradeSequence(trades = [], startingBalance = 0) {
  const initial = Number(startingBalance);
  if (!Number.isFinite(initial) || initial <= 0) return [];
  let balance = initial;
  return sortTradesChronologically(trades).map((trade) => {
    const balanceBefore = balance;
    const metrics = calculateTradeMetrics(trade, balanceBefore);
    const pnl = metrics.pnl ?? 0;
    balance += pnl;
    return { trade, ...metrics, balanceAfter: balance };
  });
}

export function filterTradesByAccount(trades = [], accountId = null) {
  if (!accountId) return [];
  return trades.filter((trade) => trade.account_id === accountId);
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
 * Returns the account equity after every trade, including the starting
 * balance. The chart therefore shows the account balance and cumulative
 * result instead of plotting isolated trade P/L values.
 */
export function buildEquityCurve(trades = [], startingBalance = 0) {
  const initial = Number(startingBalance);
  let balance = Number.isFinite(initial) && initial > 0 ? initial : 0;
  const points = [{ trade: null, equity: balance, balance }];
  sortTradesChronologically(trades).forEach((trade) => {
    const pnl = normalizedTradePnL(trade);
    balance += pnl ?? 0;
    points.push({ trade, equity: balance, balance });
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

export const TRADE_SORT_OPTIONS = [
  "newest",
  "oldest",
  "highestPnl",
  "lowestPnl",
  "highestR",
  "lowestR",
];

function normalizedText(value) {
  return String(value || "").trim().toLowerCase();
}

export function filterAndSortTrades(trades = [], filters = {}, sortBy = "newest", now = new Date()) {
  if (filters.date === "custom" && (!filters.customStart || !filters.customEnd)) return [];

  const dateRange = getStatisticsDateRange(
    filters.date || "all",
    now,
    filters.customStart || "",
    filters.customEnd || ""
  );

  let result = filterTradesByDateRange(trades, dateRange.start, dateRange.end);
  const matches = (field) => !filters[field] || filters[field] === "all";

  result = result.filter((trade) =>
    (matches("instrument") || normalizedText(trade.instrument) === normalizedText(filters.instrument)) &&
    (matches("direction") || normalizedText(trade.direction) === normalizedText(filters.direction)) &&
    (matches("timeframe") || normalizedText(trade.timeframe) === normalizedText(filters.timeframe)) &&
    (matches("outcome") || normalizedText(trade.outcome) === normalizedText(filters.outcome)) &&
    (matches("strategy") || normalizedText(trade.strategy) === normalizedText(filters.strategy))
  );

  return result.sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.trade_date) - new Date(b.trade_date);
    if (sortBy === "highestPnl") return normalizedProfitLoss(b) - normalizedProfitLoss(a);
    if (sortBy === "lowestPnl") return normalizedProfitLoss(a) - normalizedProfitLoss(b);
    if (sortBy === "highestR") return numericValue(b.r_multiple) - numericValue(a.r_multiple);
    if (sortBy === "lowestR") return numericValue(a.r_multiple) - numericValue(b.r_multiple);
    return new Date(b.trade_date) - new Date(a.trade_date);
  });
}

function psychologyGroup(trades, field) {
  const groups = new Map();
  trades.forEach((trade) => {
    const label = String(trade[field] || "").trim();
    if (!label) return;
    const key = label.toLowerCase();
    if (!groups.has(key)) groups.set(key, { label, trades: [] });
    groups.get(key).trades.push(trade);
  });

  return [...groups.values()].map(({ label, trades: groupTrades }) => {
    const wins = groupTrades.filter((trade) => normalizedText(trade.outcome) === "win").length;
    const losses = groupTrades.filter((trade) => normalizedText(trade.outcome) === "loss").length;
    const pnl = groupTrades.reduce((sum, trade) => sum + normalizedProfitLoss(trade), 0);
    return {
      label,
      trades: groupTrades.length,
      wins,
      losses,
      winRate: wins + losses ? (wins / (wins + losses)) * 100 : 0,
      totalPnL: pnl,
      averageR: groupTrades.reduce((sum, trade) => sum + numericValue(trade.r_multiple), 0) / groupTrades.length,
      losingTrades: losses,
    };
  }).sort((a, b) => b.trades - a.trades || a.label.localeCompare(b.label));
}

export function calculatePsychologyAnalysis(trades = []) {
  const emotions = psychologyGroup(trades, "emotion");
  const mistakes = psychologyGroup(trades, "mistake");
  const strategies = psychologyGroup(trades, "strategy");
  const lessons = trades
    .filter((trade) => String(trade.lesson || "").trim())
    .sort((a, b) => new Date(b.trade_date) - new Date(a.trade_date))
    .map((trade) => ({
      text: String(trade.lesson).trim(),
      outcome: trade.outcome || "Not recorded",
      tradeDate: trade.trade_date,
      instrument: trade.instrument || "Not recorded",
    }));
  const losingEmotions = psychologyGroup(trades.filter((trade) => normalizedText(trade.outcome) === "loss"), "emotion");
  const losingMistakes = psychologyGroup(trades.filter((trade) => normalizedText(trade.outcome) === "loss"), "mistake");
  const mostCommon = (groups) => groups[0] || null;

  return {
    emotions,
    mistakes,
    strategies: strategies.map((strategy) => {
      const strategyTrades = trades.filter((trade) => normalizedText(trade.strategy) === normalizedText(strategy.label));
      const emotionGroups = psychologyGroup(strategyTrades, "emotion");
      const mistakeGroups = psychologyGroup(strategyTrades, "mistake");
      return { ...strategy, commonEmotion: mostCommon(emotionGroups)?.label || null, commonMistake: mostCommon(mistakeGroups)?.label || null };
    }),
    lessons,
    summary: {
      tradesWithEmotions: trades.filter((trade) => String(trade.emotion || "").trim()).length,
      tradesWithMistakes: trades.filter((trade) => String(trade.mistake || "").trim()).length,
      tradesWithLessons: lessons.length,
      mostRecordedEmotion: mostCommon(emotions),
      mostFrequentMistake: mostCommon(mistakes),
      mostCommonLosingEmotion: mostCommon(losingEmotions),
      mostCommonLosingMistake: mostCommon(losingMistakes),
    },
    patterns: [
      ...mistakes.filter((item) => item.trades > 1).map((item) => `${item.label} was recorded on ${item.trades} trades.`),
      ...emotions.filter((item) => item.trades > 1).map((item) => `Trades recorded with ${item.label} had a ${item.winRate.toFixed(1)}% win rate (n=${item.trades}).`),
    ],
  };
}

function analyticsGroup(trades, label, key) {
  const grouped = new Map();
  trades.forEach((trade) => {
    const value = key(trade);
    if (!value) return;
    if (!grouped.has(value)) grouped.set(value, []);
    grouped.get(value).push(trade);
  });
  return [...grouped.entries()].map(([value, groupTrades]) => {
    const stats = calculateTradingStatistics(groupTrades);
    return {
      label: value,
      trades: stats.totalTrades,
      wins: stats.winningTrades,
      losses: stats.losingTrades,
      breakevens: stats.breakevenTrades,
      winRate: stats.winRate,
      totalPnL: stats.totalPnL,
      averagePnL: stats.totalTrades ? stats.totalPnL / stats.totalTrades : 0,
      averageR: stats.averageRMultiple,
      profitFactor: stats.profitFactor,
      largestWin: stats.largestWin,
      largestLoss: stats.largestLoss,
      maxDrawdown: stats.maxDrawdown,
    };
  }).sort((a, b) => a.label.localeCompare(b.label));
}

export function calculateAdvancedAnalytics(trades = []) {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const byInstrument = analyticsGroup(trades, "instrument", (trade) => String(trade.instrument || "").trim());
  const byStrategy = analyticsGroup(trades, "strategy", (trade) => String(trade.strategy || "").trim());
  const byTimeframe = analyticsGroup(trades, "timeframe", (trade) => String(trade.timeframe || "").trim());
  const byDirection = analyticsGroup(trades, "direction", (trade) => String(trade.direction || "").trim());
  const byDay = analyticsGroup(trades, "day", (trade) => {
    const date = new Date(trade.trade_date);
    return Number.isFinite(date.getTime()) ? dayNames[date.getDay()] : "";
  }).sort((a, b) => dayNames.indexOf(a.label) - dayNames.indexOf(b.label));
  return { byInstrument, byStrategy, byTimeframe, byDirection, byDay, summary: calculateTradingStatistics(trades) };
}

export function calculateBacktestResults(trades = [], startingBalance = 0) {
  const statistics = calculateTradingStatistics(trades);
  const ordered = sortTradesChronologically(trades);
  let balance = numericValue(startingBalance);
  let peak = balance;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  const equityCurve = [{ trade: null, balance }];
  const drawdownCurve = [{ trade: null, drawdown: 0, drawdownPercent: 0 }];
  ordered.forEach((trade) => {
    balance += normalizedProfitLoss(trade);
    peak = Math.max(peak, balance);
    maxDrawdown = Math.max(maxDrawdown, peak - balance);
    const drawdown = peak - balance;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;
    maxDrawdownPercent = Math.max(maxDrawdownPercent, drawdownPercent);
    equityCurve.push({ trade, balance });
    drawdownCurve.push({ trade, drawdown, drawdownPercent });
  });
  return {
    startingBalance: numericValue(startingBalance),
    endingBalance: balance,
    netPnL: statistics.totalPnL,
    returnPercent: numericValue(startingBalance) ? (statistics.totalPnL / numericValue(startingBalance)) * 100 : 0,
    totalTrades: statistics.totalTrades,
    wins: statistics.winningTrades,
    losses: statistics.losingTrades,
    breakevens: statistics.breakevenTrades,
    winRate: statistics.winRate,
    averageWin: statistics.averageWinningTrade,
    averageLoss: statistics.averageLosingTrade,
    averageR: statistics.averageRMultiple,
    profitFactor: statistics.profitFactor,
    maxDrawdown,
    maxDrawdownPercent,
    largestWin: statistics.largestWin,
    largestLoss: statistics.largestLoss,
    equityCurve,
    drawdownCurve,
  };
}
