import { describe, expect, it } from "vitest";
import {
  buildEquityCurve,
  calculatePerformanceMetrics,
  calculateTradingStatistics,
  filterAndSortTrades,
  filterTradesByDateRange,
  filterTradesByPeriod,
  getStatisticsDateRange,
  getChartGeometry,
} from "./performance";

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
