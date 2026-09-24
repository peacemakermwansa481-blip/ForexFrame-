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
    if (typeof instrument !== "string" || !instrument.trim()) throw new Error("A non-empty instrument is required for DEMO historical data.");
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

export class ReplayController {
  constructor({ provider, config }) {
    this.provider = provider;
    this.config = config;
    this.candles = [];
    this.index = -1;
    this.balance = numericValue(config.startingBalance);
    this.peak = this.balance;
    this.maxDrawdown = 0;
    this.position = null;
    this.status = "idle";
  }

  async load() {
    this.candles = await this.provider.getHistoricalCandles({
      instrument: this.config.instrument,
      timeframe: this.config.timeframe,
      startDate: this.config.startDate,
      endDate: this.config.endDate,
    });
    return this.snapshot();
  }

  restore({ index = -1, balance, position, status = "idle" } = {}) {
    this.index = Math.max(-1, Math.min(Number(index), this.candles.length - 1));
    this.balance = Number.isFinite(Number(balance)) ? Number(balance) : numericValue(this.config.startingBalance);
    this.position = position || null;
    this.status = status;
    this.peak = Math.max(numericValue(this.config.startingBalance), this.balance);
    this.maxDrawdown = Math.max(0, this.peak - this.balance);
    return this.snapshot();
  }

  start() {
    this.status = "running";
    return this.snapshot();
  }

  pause() {
    this.status = "paused";
    return this.snapshot();
  }

  finish() {
    this.status = "completed";
    return this.snapshot();
  }

  reset() {
    this.index = -1;
    this.balance = numericValue(this.config.startingBalance);
    this.peak = this.balance;
    this.maxDrawdown = 0;
    this.position = null;
    this.status = "idle";
    return this.snapshot();
  }

  next() {
    if (this.index >= this.candles.length - 1) {
      this.status = "completed";
      return { snapshot: this.snapshot(), trade: null };
    }
    this.index += 1;
    const candle = this.candles[this.index];
    const trade = this.processPosition(candle);
    if (this.index === this.candles.length - 1) this.status = "completed";
    return { snapshot: this.snapshot(), trade };
  }

  previous() {
    if (this.position || this.index <= 0) return this.snapshot();
    this.index -= 1;
    return this.snapshot();
  }

  openPosition({ direction, entry, stopLoss, takeProfit, riskPercent }) {
    if (this.index < 0 || this.position) throw new Error("Reveal a candle and ensure no position is open before opening a trade.");
    if (!["Buy", "Sell"].includes(direction)) throw new Error("Direction must be Buy or Sell.");
    const price = Number(entry);
    const stop = Number(stopLoss);
    const target = Number(takeProfit);
    const risk = Number(riskPercent);
    if (![price, stop, target, risk].every(Number.isFinite) || price <= 0 || risk <= 0 || risk > 100) throw new Error("Enter valid entry, stop, target, and risk values.");
    if ((direction === "Buy" && !(stop < price && target > price)) || (direction === "Sell" && !(stop > price && target < price))) throw new Error("Stop loss and take profit must be on the correct side of entry.");
    const stopDistance = Math.abs(price - stop);
    const riskAmount = this.balance * (risk / 100);
    this.position = { direction, entry: price, stopLoss: stop, takeProfit: target, riskPercent: risk, riskAmount, positionSize: riskAmount / stopDistance, openedAt: this.currentCandle().timestamp };
    return this.snapshot();
  }

  closePosition(reason = "Manual close") {
    if (!this.position) throw new Error("There is no open position to close.");
    return this.closeAt(this.currentCandle().close, reason, this.currentCandle());
  }

  currentCandle() {
    return this.candles[this.index] || null;
  }

  visibleCandles() {
    return this.candles.slice(0, this.index + 1);
  }

  snapshot() {
    const candle = this.currentCandle();
    const currentPrice = candle?.close ?? this.balance;
    const unrealizedPnL = this.position ? this.position.direction === "Buy" ? (currentPrice - this.position.entry) * this.position.positionSize : (this.position.entry - currentPrice) * this.position.positionSize : 0;
    const equity = this.balance + unrealizedPnL;
    this.peak = Math.max(this.peak, equity);
    this.maxDrawdown = Math.max(this.maxDrawdown, this.peak - equity);
    return { status: this.status, index: this.index, totalCandles: this.candles.length, visibleCandles: this.visibleCandles(), currentCandle: candle, currentPrice, balance: this.balance, equity, unrealizedPnL, position: this.position, maxDrawdown: this.maxDrawdown, progress: this.candles.length ? ((this.index + 1) / this.candles.length) * 100 : 0 };
  }

  processPosition(candle) {
    if (!this.position) return null;
    const hitStop = this.position.direction === "Buy" ? candle.low <= this.position.stopLoss : candle.high >= this.position.stopLoss;
    const hitTarget = this.position.direction === "Buy" ? candle.high >= this.position.takeProfit : candle.low <= this.position.takeProfit;
    if (!hitStop && !hitTarget) return null;
    const useStop = hitStop;
    return this.closeAt(useStop ? this.position.stopLoss : this.position.takeProfit, useStop ? "Stop Loss" : "Take Profit", candle);
  }

  closeAt(exitPrice, reason, candle) {
    const position = this.position;
    const pnl = position.direction === "Buy" ? (exitPrice - position.entry) * position.positionSize : (position.entry - exitPrice) * position.positionSize;
    const trade = { trade_date: candle.timestamp, entry_time: position.openedAt, instrument: this.config.instrument, direction: position.direction, entry: position.entry, exit_price: exitPrice, stop_loss: position.stopLoss, take_profit: position.takeProfit, position_size: position.positionSize, risk_percent: position.riskPercent, simulated_pnl: Number(pnl.toFixed(2)), r_multiple: position.riskAmount ? Number((pnl / position.riskAmount).toFixed(4)) : 0, outcome: pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "Breakeven", strategy: this.config.strategyName, exit_reason: reason };
    this.balance += trade.simulated_pnl;
    this.position = null;
    this.peak = Math.max(this.peak, this.balance);
    this.maxDrawdown = Math.max(this.maxDrawdown, this.peak - this.balance);
    return trade;
  }
}
