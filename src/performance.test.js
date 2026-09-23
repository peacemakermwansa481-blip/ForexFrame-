import { describe, expect, it } from "vitest";
import {
  buildEquityCurve,
  calculatePerformanceMetrics,
  filterTradesByPeriod,
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
