import { describe, expect, it } from "vitest";
import {
  buildEquityCurve,
  calculatePerformanceMetrics,
  calculatePsychologyAnalysis,
  calculateAdvancedAnalytics,
  calculateBacktestResults,
  calculateTradingStatistics,
  filterAndSortTrades,
  filterTradesByDateRange,
  filterTradesByPeriod,
  getStatisticsDateRange,
  getChartGeometry,
} from "./performance";
import { MockHistoricalDataProvider, normalizeCandle, runBacktest } from "./backtesting";

describe("equity curve", () => {
  const trades = [
    { id: "b", trade_date: "2026-01-02T00:00:00Z", simulated_pnl: -20 },
    { id: "a", trade_date: "2026-01-01T00:00:00Z", simulated_pnl: 100 },
    { id: "c", trade_date: "2026-01-03T00:00:00Z", simulated_pnl: 30 },
  ];

  it("sorts trades and includes the starting equity point", () => {
    expect(buildEquityCurve(trades).map(({ equity }) => equity)).toEqual([
      0, 100, 80, 110,
    ]);
  });

  it("filters the curve to the selected number of calendar days", () => {
    expect(
      filterTradesByPeriod(
        [
          { id: "old", trade_date: "2026-01-01T12:00:00Z", simulated_pnl: 5 },
          { id: "recent", trade_date: "2026-01-06T12:00:00Z", simulated_pnl: 10 },
          { id: "latest", trade_date: "2026-01-07T12:00:00Z", simulated_pnl: 15 },
        ],
        2
      ).map(({ id }) => id)
    ).toEqual(["recent", "latest"]);
  });

  it("calculates outcome statistics from recorded trade values", () => {
    expect(calculateTradingStatistics([
      { trade_date: "2026-01-01", outcome: "Win", simulated_pnl: 100, r_multiple: 2 },
      { trade_date: "2026-01-02", outcome: "Loss", simulated_pnl: 40, r_multiple: -1 },
      { trade_date: "2026-01-03", outcome: "Loss", simulated_pnl: -20, r_multiple: -0.5 },
      { trade_date: "2026-01-04", outcome: "Breakeven", simulated_pnl: 0, r_multiple: 0 },
      { trade_date: "2026-01-05", outcome: "Win", simulated_pnl: 50, r_multiple: 1 },
    ])).toMatchObject({
      totalTrades: 5,
      winningTrades: 2,
      losingTrades: 2,
      breakevenTrades: 1,
      winRate: 50,
      totalPnL: 90,
      averageWinningTrade: 75,
      averageLosingTrade: -30,
      averageRMultiple: 0.3,
      profitFactor: 2.5,
      largestWin: 100,
      largestLoss: -40,
      maxDrawdown: 60,
      winningStreak: 1,
      losingStreak: 2,
    });
  });

  it("changes the statistics dataset when the selected period changes", () => {
    const range = getStatisticsDateRange("30", new Date("2026-02-15T12:00:00"));
    const selectedTrades = filterTradesByDateRange([
      { id: "outside", trade_date: "2026-01-15T12:00:00", simulated_pnl: 10 },
      { id: "inside", trade_date: "2026-02-01T12:00:00", simulated_pnl: 20 },
      { id: "today", trade_date: "2026-02-15T12:00:00", simulated_pnl: 30 },
    ], range.start, range.end);

    expect(selectedTrades.map(({ id }) => id)).toEqual(["inside", "today"]);
  });

  it("applies multiple filters together and sorts without mutating the source", () => {
    const source = [
      { id: "one", trade_date: "2026-02-01", instrument: "XAU/USD", direction: "Buy", timeframe: "H1", outcome: "Win", strategy: "Breakout", simulated_pnl: 50, r_multiple: 2 },
      { id: "two", trade_date: "2026-02-02", instrument: "XAU/USD", direction: "Sell", timeframe: "H1", outcome: "Win", strategy: "Breakout", simulated_pnl: 100, r_multiple: 1 },
      { id: "three", trade_date: "2026-02-03", instrument: "EUR/USD", direction: "Buy", timeframe: "H1", outcome: "Win", strategy: "Breakout", simulated_pnl: 200, r_multiple: 3 },
    ];
    const result = filterAndSortTrades(source, {
      date: "all", instrument: "XAU/USD", direction: "all", timeframe: "H1", outcome: "Win", strategy: "Breakout",
    }, "highestPnl");

    expect(result.map(({ id }) => id)).toEqual(["two", "one"]);
    expect(filterAndSortTrades(source, {
      date: "all", instrument: "XAU/USD", direction: "Buy", timeframe: "H1", outcome: "Win", strategy: "Breakout",
    }).map(({ id }) => id)).toEqual(["one"]);
    expect(source.map(({ id }) => id)).toEqual(["one", "two", "three"]);
    expect(filterAndSortTrades(source, { date: "all", instrument: "GBP/USD" })).toEqual([]);
  });

  it("handles empty statistics without division errors", () => {
    expect(calculateTradingStatistics()).toMatchObject({
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      profitFactor: null,
      maxDrawdown: 0,
    });
  });

  it("calculates drawdown from cumulative equity peaks", () => {
    expect(calculatePerformanceMetrics(trades)).toEqual({
      bestTrade: 100,
      worstTrade: -20,
      maxDrawdown: 20,
    });
  });

  it("keeps the zero line inside the chart when equity crosses zero", () => {
    const geometry = getChartGeometry(buildEquityCurve([
      { trade_date: "2026-01-01", simulated_pnl: -20 },
      { trade_date: "2026-01-02", simulated_pnl: 30 },
    ]));

    expect(geometry.points).toHaveLength(3);
    expect(geometry.yTicks).toHaveLength(5);
    expect(geometry.yTicks[0].value).toBe(10);
    expect(geometry.yTicks.at(-1).value).toBe(-20);
    expect(geometry.zeroY).toBeCloseTo(geometry.points[0].y);
    expect(geometry.zeroY).toBeLessThan(geometry.points[1].y);
    expect(geometry.zeroY).toBeGreaterThan(geometry.points[2].y);
  });
});


describe("trading psychology", () => {
  it("summarizes recorded psychology fields without inventing missing values", () => {
    const analysis = calculatePsychologyAnalysis([
      { trade_date: "2026-01-01", emotion: "Fear", mistake: "Late Entry", lesson: "Wait for confirmation", outcome: "Loss", simulated_pnl: 30, r_multiple: -1 },
      { trade_date: "2026-01-02", emotion: "Fear", mistake: "Late Entry", lesson: "Wait for confirmation", outcome: "Win", simulated_pnl: 60, r_multiple: 2 },
      { trade_date: "2026-01-03", emotion: "Calm", strategy: "Breakout", outcome: "Win", simulated_pnl: 40, r_multiple: 1 },
    ]);

    expect(analysis.emotions[0]).toMatchObject({ label: "Fear", trades: 2, wins: 1, losses: 1, winRate: 50 });
    expect(analysis.mistakes[0]).toMatchObject({ label: "Late Entry", trades: 2 });
    expect(analysis.summary.tradesWithLessons).toBe(2);
    expect(analysis.summary.mostCommonLosingEmotion.label).toBe("Fear");
    expect(analysis.lessons).toHaveLength(2);
    expect(analysis.strategies[0]).toMatchObject({ label: "Breakout", commonEmotion: "Calm" });
  });
});

describe("advanced analytics", () => {
  it("groups performance by dimensions and only includes recorded categories", () => {
    const result = calculateAdvancedAnalytics([
      { trade_date: "2026-01-05T10:00:00", instrument: "XAU/USD", strategy: "Breakout", timeframe: "H1", direction: "Buy", outcome: "Win", simulated_pnl: 100, r_multiple: 2 },
      { trade_date: "2026-01-06T10:00:00", instrument: "XAU/USD", strategy: "Breakout", timeframe: "H1", direction: "Sell", outcome: "Loss", simulated_pnl: 40, r_multiple: -1 },
      { trade_date: "2026-01-07T10:00:00", instrument: "EUR/USD", strategy: "Reversal", timeframe: "M15", direction: "Buy", outcome: "Breakeven", simulated_pnl: 0, r_multiple: 0 },
    ]);

    expect(result.byInstrument.map(({ label }) => label)).toEqual(["EUR/USD", "XAU/USD"]);
    expect(result.byInstrument[1]).toMatchObject({ trades: 2, wins: 1, losses: 1, totalPnL: 60, averagePnL: 30 });
    expect(result.byTimeframe.map(({ label }) => label)).toEqual(["H1", "M15"]);
    expect(result.byDirection).toHaveLength(2);
    expect(result.byDay.map(({ label }) => label)).toEqual(["Monday", "Tuesday", "Wednesday"]);
  });
});

describe("backtesting results", () => {
  it("calculates results from backtest trades without changing the starting balance", () => {
    const result = calculateBacktestResults([
      { trade_date: "2026-01-01", outcome: "Win", simulated_pnl: 100, r_multiple: 2 },
      { trade_date: "2026-01-02", outcome: "Loss", simulated_pnl: 40, r_multiple: -1 },
    ], 10000);

    expect(result).toMatchObject({ startingBalance: 10000, endingBalance: 10060, netPnL: 60, totalTrades: 2, wins: 1, losses: 1, maxDrawdown: 40 });
    expect(result.equityCurve.map(({ balance }) => balance)).toEqual([10000, 10100, 10060]);
  });
});

describe("backtesting engine", () => {
  it("returns deterministic chronological DEMO candles and filters dates", async () => {
    const provider = new MockHistoricalDataProvider();
    const candles = await provider.getHistoricalCandles({ instrument: "XAU/USD", timeframe: "H1", startDate: "2026-01-01", endDate: "2026-01-01" });
    expect(candles.length).toBeGreaterThan(0);
    expect(candles[0].timestamp).toBe("2026-01-01T00:00:00.000Z");
    expect(candles.every((candle, index) => index === 0 || candle.timestamp > candles[index - 1].timestamp)).toBe(true);
    await expect(provider.getHistoricalCandles({ instrument: "EUR/USD", timeframe: "H1", startDate: "2026-01-01", endDate: "2026-01-01" })).rejects.toThrow("XAU/USD");
  });

  it("rejects invalid candles and uses the conservative stop-first rule", () => {
    expect(() => normalizeCandle({ timestamp: "2026-01-01", open: 10, high: 8, low: 9, close: 10 })).toThrow("Invalid candle");
    const candles = [
      { timestamp: "2026-01-01T00:00:00Z", open: 100, high: 100, low: 100, close: 100 },
      { timestamp: "2026-01-01T01:00:00Z", open: 100, high: 104, low: 96, close: 100 },
      { timestamp: "2026-01-01T02:00:00Z", open: 100, high: 100, low: 100, close: 100 },
    ];
    const strategy = { evaluate: ({ history }) => history.length === 1 ? { direction: "Buy", stopLossDistance: 2, takeProfitDistance: 2 } : null };
    const result = runBacktest({ candles, strategy, startingBalance: 1000, riskPercent: 1 });
    expect(result.trades[0]).toMatchObject({ outcome: "Loss", simulated_pnl: -10, r_multiple: -1 });
    expect(result.results.endingBalance).toBe(990);
  });
});
