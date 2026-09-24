import { calculateBacktestResults, numericValue, sortTradesChronologically } from "./performance";

export const SUPPORTED_TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];

function timeframeMinutes(timeframe) {
  return { M1: 1, M5: 5, M15: 15, M30: 30, H1: 60, H4: 240, D1: 1440 }[timeframe];
}

export function normalizeCandle(candle) {
  const timestamp = new Date(candle.timestamp);
  const values = [candle.open, candle.high, candle.low, candle.close].map(Number);
  if (!Number.isFinite(timestamp.getTime()) || values.some((value) => !Number.isFinite(value)) || values[0] <= 0 || values[1] < values[2]) {
    throw new Error("Invalid candle data: timestamp and OHLC values are required.");
  }
  const [open, high, low, close] = values;
  if (high < Math.max(open, close) || low > Math.min(open, close)) throw new Error("Invalid candle data: high/low do not contain open/close.");
  return { timestamp: timestamp.toISOString(), open, high, low, close, volume: Number.isFinite(Number(candle.volume)) ? Number(candle.volume) : null };
}

export class MockHistoricalDataProvider {
  constructor() { this.label = "DEMO DATA — NOT REAL MARKET DATA"; }

  async getHistoricalCandles({ instrument, timeframe, startDate, endDate }) {
    if (instrument !== "XAU/USD") throw new Error("DEMO provider currently supports XAU/USD only.");
    if (!SUPPORTED_TIMEFRAMES.includes(timeframe)) throw new Error(`Unsupported timeframe: ${timeframe}.`);
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T23:59:59Z`);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) throw new Error("Invalid historical-data date range.");
    const step = timeframeMinutes(timeframe) * 60 * 1000;
    const candles = [];
    let price = 2000;
    for (let index = 0, timestamp = start.getTime(); timestamp <= end.getTime() && index < 1000; index += 1, timestamp += step) {
      const movement = (((index * 17) % 11) - 5) * 0.35 + (index % 9 === 0 ? 1.2 : 0);
      const open = price;
      const close = Math.max(0.01, open + movement);
      const high = Math.max(open, close) + 0.45 + (index % 3) * 0.1;
      const low = Math.min(open, close) - 0.45 - (index % 2) * 0.1;
      candles.push(normalizeCandle({ timestamp, open, high, low, close, volume: 100 + (index % 20) }));
      price = close;
    }
    if (!candles.length) throw new Error("The DEMO provider returned no candle data for this range.");
    return candles;
  }
}

export class TestMomentumStrategy {
  constructor() { this.name = "DEMO Test Momentum Strategy"; }

  evaluate({ currentCandle, history }) {
    if (history.length < 3 || history.length % 8 !== 0) return null;
    const previous = history[history.length - 2];
    const direction = currentCandle.close >= previous.close ? "Buy" : "Sell";
    return { direction, stopLossDistance: 1.5, takeProfitDistance: 3 };
  }
}

function validSignal(signal) {
  return signal && (signal.direction === "Buy" || signal.direction === "Sell") && Number(signal.stopLossDistance) > 0 && Number(signal.takeProfitDistance) > 0;
}

export function runBacktest({ candles, strategy, startingBalance, riskPercent = 1, instrument = "XAU/USD", strategyName = "Test strategy" }) {
  if (!Array.isArray(candles) || candles.length === 0) throw new Error("Cannot run a backtest without candle data.");
  const orderedCandles = candles.map(normalizeCandle).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const trades = [];
  let openPosition = null;
  let sequence = 0;
  const closePosition = (position, candle, exitPrice, outcome) => {
    const pnl = position.direction === "Buy" ? (exitPrice - position.entry) * position.positionSize : (position.entry - exitPrice) * position.positionSize;
    const signedRisk = position.riskAmount || 0;
    trades.push({ id: `demo-${sequence += 1}`, trade_date: candle.timestamp, instrument, direction: position.direction, entry: position.entry, stop_loss: position.stopLoss, take_profit: position.takeProfit, position_size: position.positionSize, risk_percent: riskPercent, simulated_pnl: Number(pnl.toFixed(2)), r_multiple: signedRisk ? Number((pnl / signedRisk).toFixed(4)) : 0, outcome, strategy: strategyName, exit_price: exitPrice, entry_reason: "DEMO test strategy signal", exit_reason: `DEMO ${outcome} exit` });
  };

  orderedCandles.forEach((candle, index) => {
    if (openPosition) {
      const hitStop = openPosition.direction === "Buy" ? candle.low <= openPosition.stopLoss : candle.high >= openPosition.stopLoss;
      const hitTarget = openPosition.direction === "Buy" ? candle.high >= openPosition.takeProfit : candle.low <= openPosition.takeProfit;
      if (hitStop || hitTarget) {
        // Conservative deterministic rule: if both are touched in one candle, assume SL first.
        const useStop = hitStop;
        closePosition(openPosition, candle, useStop ? openPosition.stopLoss : openPosition.takeProfit, useStop ? "Loss" : "Win");
        openPosition = null;
      }
    }
    if (!openPosition) {
      const visibleHistory = orderedCandles.slice(0, index + 1);
      const signal = strategy.evaluate({ currentCandle: candle, history: visibleHistory });
      if (validSignal(signal)) {
        const entry = candle.close;
        const stopLoss = signal.direction === "Buy" ? entry - signal.stopLossDistance : entry + signal.stopLossDistance;
        const takeProfit = signal.direction === "Buy" ? entry + signal.takeProfitDistance : entry - signal.takeProfitDistance;
        const riskAmount = numericValue(startingBalance) * (numericValue(riskPercent) / 100);
        openPosition = { direction: signal.direction, entry, stopLoss, takeProfit, positionSize: riskAmount / signal.stopLossDistance, riskAmount };
      }
    }
  });
  if (openPosition) {
    const lastCandle = orderedCandles[orderedCandles.length - 1];
    const exit = lastCandle.close;
    const pnl = openPosition.direction === "Buy" ? exit - openPosition.entry : openPosition.entry - exit;
    closePosition(openPosition, lastCandle, exit, pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "Breakeven");
  }
  const results = calculateBacktestResults(sortTradesChronologically(trades), startingBalance);
  return { trades, results, processedCandles: orderedCandles.length, lastTimestamp: orderedCandles.at(-1).timestamp };
}
