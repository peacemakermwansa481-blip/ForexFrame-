import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { supabase } from "./supabase";
import {
  buildEquityCurve,
  calculatePerformanceMetrics,
  calculateTradingStatistics,
  EQUITY_PERIODS,
  filterAndSortTrades,
  filterTradesByPeriod,
  filterTradesByDateRange,
  getStatisticsDateRange,
  getChartGeometry,
  numericValue,
  sortTradesChronologically,
} from "./performance";

const emptyTrade = {
  trade_date: new Date().toISOString().slice(0, 16),
  instrument: "",
  direction: "Buy",
  timeframe: "H1",
  entry_price: "",
  stop_price: "",
  target_price: "",
  position_size: "",
  simulated_risk_percent: "",
  simulated_pnl: "",
  r_multiple: "",
  outcome: "Win",
  strategy: "",
  entry_reason: "",
  exit_reason: "",
  emotion: "",
  mistake: "",
  lesson: "",
};




function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) setMessage(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Account created. Check your email to confirm your account.");
        setMode("login");
      }
    }

    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">ForexFrame</div>
        <p className="subtitle">Trading Journal</p>

        <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>

        <p className="muted">
          {mode === "login"
            ? "Log in to review your simulated trading journal."
            : "Create your journal and start tracking your learning."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {message && <div className="message">{message}</div>}

          <button className="primary-button full-width" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Log In"
              : "Create Account"}
          </button>
        </form>

        <button
          className="switch-button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMessage("");
          }}
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}

function AddTradeModal({ onClose, onSaved, initialTrade = null }) {
  const [trade, setTrade] = useState(initialTrade || emptyTrade);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setTrade((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please log in again.");
      setSaving(false);
      return;
    }

    const numericFields = [
      "entry_price",
      "stop_price",
      "target_price",
      "position_size",
      "simulated_risk_percent",
      "simulated_pnl",
      "r_multiple",
    ];

    const payload = {
      ...trade,
      user_id: user.id,
      trade_date: new Date(trade.trade_date).toISOString(),
    };

     numericFields.forEach((field) => {
  payload[field] =
    trade[field] === "" ? null : Number(trade[field]);
});

if (payload.outcome?.toLowerCase() === "loss") {
  payload.simulated_pnl = -Math.abs(payload.simulated_pnl || 0);
}

if (payload.outcome?.toLowerCase() === "win") {
  payload.simulated_pnl = Math.abs(payload.simulated_pnl || 0);
}

    const { user_id, id, created_at, ...tradeData } = payload;

const result = id
  ? await supabase
      .from("trades")
      .update(tradeData)
      .eq("id", id)
      .eq("user_id", user.id)
  : await supabase
      .from("trades")
      .insert({
        ...tradeData,
        user_id: user.id,
      });

if (result.error) {
  setError(result.error.message);
  setSaving(false);
  return;
}

setSaving(false);
onSaved();
onClose();
    }
  return (
    <div className="modal-backdrop">
      <div className="trade-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">JOURNAL ENTRY</p>
            <h2>{initialTrade ? "Edit Simulated Trade" : "Add Simulated Trade"}</h2>
          </div>

          <button className="close-button" onClick={onClose}>
            Back
          </button>
        </div>

        <form onSubmit={handleSave} className="trade-form">
          <div className="form-grid">
            <label>
              Date & Time
              <input
                type="datetime-local"
                value={trade.trade_date}
                onChange={(e) =>
                  updateField("trade_date", e.target.value)
                }
                required
              />
            </label>

            <label>
              Instrument
              <input
                type="text"
                placeholder="e.g. XAU/USD"
                value={trade.instrument}
                onChange={(e) =>
                  updateField("instrument", e.target.value)
                }
                required
              />
            </label>

            <label>
              Direction
              <select
                value={trade.direction}
                onChange={(e) =>
                  updateField("direction", e.target.value)
                }
              >
                <option>Buy</option>
                <option>Sell</option>
              </select>
            </label>

            <label>
              Timeframe
              <select
                value={trade.timeframe}
                onChange={(e) =>
                  updateField("timeframe", e.target.value)
                }
              >
                <option>M1</option>
                <option>M5</option>
                <option>M15</option>
                <option>M30</option>
                <option>H1</option>
                <option>H4</option>
                <option>D1</option>
              </select>
            </label>

            <label>
              Entry Price
              <input
                type="number"
                step="any"
                value={trade.entry_price}
                onChange={(e) =>
                  updateField("entry_price", e.target.value)
                }
              />
            </label>

            <label>
              Stop Price
              <input
                type="number"
                step="any"
                value={trade.stop_price}
                onChange={(e) =>
                  updateField("stop_price", e.target.value)
                }
              />
            </label>

            <label>
              Target Price
              <input
                type="number"
                step="any"
                value={trade.target_price}
                onChange={(e) =>
                  updateField("target_price", e.target.value)
                }
              />
            </label>

            <label>
              Position Size
              <input
                type="number"
                step="any"
                value={trade.position_size}
                onChange={(e) =>
                  updateField("position_size", e.target.value)
                }
              />
            </label>

            <label>
              Simulated Risk %
              <input
                type="number"
                step="any"
                value={trade.simulated_risk_percent}
                onChange={(e) =>
                  updateField("simulated_risk_percent", e.target.value)
                }
              />
            </label>

            <label>
              Simulated P/L
              <input
                type="number"
                step="any"
                value={trade.simulated_pnl}
                onChange={(e) =>
                  updateField("simulated_pnl", e.target.value)
                }
              />
            </label>

            <label>
              R-Multiple
              <input
                type="number"
                step="any"
                value={trade.r_multiple}
                onChange={(e) =>
                  updateField("r_multiple", e.target.value)
                }
              />
            </label>

            <label>
              Outcome
              <select
                value={trade.outcome}
                onChange={(e) =>
                  updateField("outcome", e.target.value)
                }
              >
                <option>Win</option>
                <option>Loss</option>
                <option>Breakeven</option>
              </select>
            </label>

            <label className="full-span">
              Strategy / Setup
              <input
                type="text"
                placeholder="e.g. Market Structure"
                value={trade.strategy}
                onChange={(e) =>
                  updateField("strategy", e.target.value)
                }
              />
            </label>

            <label className="full-span">
              Entry Reason
              <textarea
                placeholder="Why did you take this simulated trade?"
                value={trade.entry_reason}
                onChange={(e) =>
                  updateField("entry_reason", e.target.value)
                }
              />
            </label>

            <label className="full-span">
              Exit Reason
              <textarea
                placeholder="Why did you exit?"
                value={trade.exit_reason}
                onChange={(e) =>
                  updateField("exit_reason", e.target.value)
                }
              />
            </label>

            <label>
              Emotion
              <input
                type="text"
                placeholder="Calm, nervous, confident..."
                value={trade.emotion}
                onChange={(e) =>
                  updateField("emotion", e.target.value)
                }
              />
            </label>

            <label>
              Mistake
              <input
                type="text"
                placeholder="Optional"
                value={trade.mistake}
                onChange={(e) =>
                  updateField("mistake", e.target.value)
                }
              />
            </label>

            <label className="full-span">
              Lesson
              <textarea
                placeholder="What did you learn?"
                value={trade.lesson}
                onChange={(e) =>
                  updateField("lesson", e.target.value)
                }
              />
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {initialTrade ? "Update Simulated Trade" : "Save Simulated Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Icon({ name, size = 20 }) {
  const paths = {
    arrowLeft: "M19 12H5m7 7-7-7 7-7",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5m0-16v16M4 5.5V3h2.5",
    chart: "M4 19V5m0 14h16M8 16v-4m4 4V8m4 8V5m4 11V3",
    pencil: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z",
    trash: "M3 6h18m-2 0v14H5V6m3 0V3h8v3m-7 4v8m4-8v8",
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}

function TradeDetail({ trade, onEdit, onDelete }) {
  const displayValue = (value) => value || "—";

  return (
    <article className="trade-detail card">
      <div className="trade-detail-header">
        <div>
          <p className="eyebrow">TRADE DETAILS</p>
          <h2>{trade.instrument || "Unnamed trade"}</h2>
          <p className="muted">
            {trade.direction} · {trade.timeframe} · {new Date(trade.trade_date).toLocaleString()}
          </p>
        </div>
        <div className="trade-detail-actions">
          <button className="icon-button" type="button" onClick={() => onEdit(trade)} aria-label="Edit trade" title="Edit trade">
            <Icon name="pencil" />
          </button>
          <button className="icon-button danger" type="button" onClick={() => onDelete(trade)} aria-label="Delete trade" title="Delete trade">
            <Icon name="trash" />
          </button>
        </div>
      </div>

      <div className="trade-detail-grid">
        <div><span>Outcome</span><strong>{displayValue(trade.outcome)}</strong></div>
        <div><span>Simulated P/L</span><strong>{numericValue(trade.simulated_pnl).toFixed(2)}</strong></div>
        <div><span>R-Multiple</span><strong>{numericValue(trade.r_multiple).toFixed(2)}R</strong></div>
        <div><span>Risk</span><strong>{trade.simulated_risk_percent == null ? "—" : `${trade.simulated_risk_percent}%`}</strong></div>
        <div><span>Entry Price</span><strong>{displayValue(trade.entry_price)}</strong></div>
        <div><span>Stop Price</span><strong>{displayValue(trade.stop_price)}</strong></div>
        <div><span>Target Price</span><strong>{displayValue(trade.target_price)}</strong></div>
        <div><span>Position Size</span><strong>{displayValue(trade.position_size)}</strong></div>
        <div className="full-span"><span>Strategy / Setup</span><strong>{displayValue(trade.strategy)}</strong></div>
        <div className="full-span"><span>Entry Reason</span><p>{displayValue(trade.entry_reason)}</p></div>
        <div className="full-span"><span>Exit Reason</span><p>{displayValue(trade.exit_reason)}</p></div>
        <div><span>Emotion</span><strong>{displayValue(trade.emotion)}</strong></div>
        <div><span>Mistake</span><strong>{displayValue(trade.mistake)}</strong></div>
        <div className="full-span"><span>Lesson</span><p>{displayValue(trade.lesson)}</p></div>
      </div>
    </article>
  );
}

function TradesPage({ trades, loadingTrades, selectedTrade, onSelectTrade, onBack, onEdit, onDelete }) {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    date: "all",
    instrument: "all",
    direction: "all",
    timeframe: "all",
    outcome: "all",
    strategy: "all",
    customStart: "",
    customEnd: "",
  });
  const instruments = [...new Set(trades.map((trade) => trade.instrument).filter(Boolean))].sort();
  const strategies = [...new Set(trades.map((trade) => trade.strategy).filter(Boolean))].sort();
  const displayedTrades = filterAndSortTrades(trades, filters, sortBy);
  const filteredStatistics = calculateTradingStatistics(displayedTrades);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) =>
    !["customStart", "customEnd"].includes(key) && value !== "all"
  ).length;
  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));
  const clearFilters = () => setFilters({ date: "all", instrument: "all", direction: "all", timeframe: "all", outcome: "all", strategy: "all", customStart: "", customEnd: "" });
  const formatFilteredMoney = (value) => Number(value).toFixed(2);

  return (
    <main className="trades-page">
      <div className="page-heading">
        <button className="back-button" type="button" onClick={onBack}>
          <Icon name="arrowLeft" size={18} />
          Dashboard
        </button>
        <div>
          <p className="eyebrow">TRADING JOURNAL</p>
          <h1>All trades</h1>
          <p className="muted">Select a trade to review, edit, or delete it.</p>
        </div>
        <span className="badge">{displayedTrades.length} of {trades.length} trades</span>
      </div>

      {loadingTrades ? (
        <div className="card empty-state"><p>Loading trades...</p></div>
      ) : trades.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><Icon name="book" /></div>
          <p>No trades recorded yet.</p>
          <span>Add a simulated trade from the dashboard to begin.</span>
        </div>
      ) : (
        <div className="trades-page-grid">
          <section className="card all-trades-card">
            <div className="card-header">
              <div>
                <h2>Trade history</h2>
                <p className="muted">Click any trade to see its full journal entry.</p>
              </div>
              <button type="button" className={`filter-toggle ${showFilters || activeFilterCount ? "active" : ""}`} onClick={() => setShowFilters((current) => !current)}>
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
              </button>
            </div>
            {showFilters && (
              <div className="trade-filters">
                <div className="filter-grid">
                  <label>Date
                    <select value={filters.date} onChange={(event) => updateFilter("date", event.target.value)}>
                      <option value="all">All dates</option>
                      <option value="today">Today</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                      <option value="30">Last 30 days</option>
                      <option value="custom">Custom range</option>
                    </select>
                  </label>
                  <label>Instrument
                    <select value={filters.instrument} onChange={(event) => updateFilter("instrument", event.target.value)}>
                      <option value="all">All instruments</option>
                      {instruments.map((instrument) => <option key={instrument} value={instrument}>{instrument}</option>)}
                    </select>
                  </label>
                  <label>Direction
                    <select value={filters.direction} onChange={(event) => updateFilter("direction", event.target.value)}>
                      <option value="all">All directions</option><option>Buy</option><option>Sell</option>
                    </select>
                  </label>
                  <label>Timeframe
                    <select value={filters.timeframe} onChange={(event) => updateFilter("timeframe", event.target.value)}>
                      <option value="all">All timeframes</option>
                      {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'].map((timeframe) => <option key={timeframe}>{timeframe}</option>)}
                    </select>
                  </label>
                  <label>Outcome
                    <select value={filters.outcome} onChange={(event) => updateFilter("outcome", event.target.value)}>
                      <option value="all">All outcomes</option><option>Win</option><option>Loss</option><option>Breakeven</option>
                    </select>
                  </label>
                  <label>Strategy
                    <select value={filters.strategy} onChange={(event) => updateFilter("strategy", event.target.value)}>
                      <option value="all">All strategies</option>
                      {strategies.map((strategy) => <option key={strategy} value={strategy}>{strategy}</option>)}
                    </select>
                  </label>
                </div>
                {filters.date === "custom" && (
                  <div className="filter-date-range">
                    <label>From<input type="date" value={filters.customStart} onChange={(event) => updateFilter("customStart", event.target.value)} /></label>
                    <label>To<input type="date" value={filters.customEnd} onChange={(event) => updateFilter("customEnd", event.target.value)} /></label>
                  </div>
                )}
                <div className="filter-actions">
                  <span className="muted">{displayedTrades.length} matching trades</span>
                  <button type="button" className="secondary-button" onClick={clearFilters}>Clear filters</button>
                </div>
              </div>
            )}
            <div className="filtered-statistics">
              <div><span>Total Trades</span><strong>{filteredStatistics.totalTrades}</strong></div>
              <div><span>Win Rate</span><strong>{filteredStatistics.winRate.toFixed(1)}%</strong></div>
              <div><span>Total P&amp;L</span><strong className={filteredStatistics.totalPnL >= 0 ? "positive-text" : "negative-text"}>{formatFilteredMoney(filteredStatistics.totalPnL)}</strong></div>
              <div><span>Average R</span><strong>{filteredStatistics.averageRMultiple.toFixed(2)}R</strong></div>
              <div><span>Profit Factor</span><strong>{filteredStatistics.profitFactor == null ? "—" : filteredStatistics.profitFactor.toFixed(2)}</strong></div>
              <div><span>Largest Win</span><strong className="positive-text">{formatFilteredMoney(filteredStatistics.largestWin)}</strong></div>
              <div><span>Largest Loss</span><strong className="negative-text">{formatFilteredMoney(filteredStatistics.largestLoss)}</strong></div>
              <div><span>Max Drawdown</span><strong className="negative-text">{formatFilteredMoney(filteredStatistics.maxDrawdown)}</strong></div>
            </div>
            <div className="trade-sort-row">
              <span className="muted">Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort trades">
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
                <option value="highestPnl">Highest P&amp;L</option><option value="lowestPnl">Lowest P&amp;L</option>
                <option value="highestR">Highest R-multiple</option><option value="lowestR">Lowest R-multiple</option>
              </select>
            </div>
            {displayedTrades.length === 0 ? (
              <div className="empty-state filtered-empty-state">
                <p>No matching trades.</p>
                <span>Try changing or clearing your filters.</span>
              </div>
            ) : (
            <div className="trade-list">
              {displayedTrades.map((trade) => (
                <button
                  className={`trade-row trade-row-button ${selectedTrade?.id === trade.id ? "selected" : ""}`}
                  key={trade.id}
                  type="button"
                  onClick={() => onSelectTrade(trade)}
                >
                  <div>
                    <strong>{trade.instrument}</strong>
                    <span>{new Date(trade.trade_date).toLocaleDateString()} · {trade.direction} · {trade.timeframe}</span>
                  </div>
                  <div className={`trade-result ${trade.outcome?.toLowerCase() === "loss" ? "loss" : trade.outcome?.toLowerCase() === "win" ? "win" : "breakeven"}`}>
                    <strong>{trade.outcome}</strong>
                    <span>{numericValue(trade.simulated_pnl).toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
            )}
          </section>

          {selectedTrade ? (
            <TradeDetail trade={selectedTrade} onEdit={onEdit} onDelete={onDelete} />
          ) : (
            <div className="card empty-state trade-detail-placeholder">
              <div className="empty-icon"><Icon name="book" /></div>
              <p>Select a trade</p>
              <span>Its details and edit/delete icons will appear here.</span>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function Dashboard({ user }) {
  const [trades, setTrades] = useState([]);
const [showModal, setShowModal] = useState(false);
const [loadingTrades, setLoadingTrades] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [equityPeriod, setEquityPeriod] = useState(30);
  const [showTradesPage, setShowTradesPage] = useState(false);
  const [showStatisticsPage, setShowStatisticsPage] = useState(false);

  async function loadTrades() {
    setLoadingTrades(true);

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("trade_date", { ascending: false });

    if (!error) {
      setTrades(data || []);
    }

    setLoadingTrades(false);
  }

  useEffect(() => {
    loadTrades();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleDeleteTrade(trade) {
    const confirmed = window.confirm(`Delete the ${trade.instrument || "selected"} trade? This cannot be undone.`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("id", trade.id)
      .eq("user_id", user.id);

    if (error) {
      window.alert(`Unable to delete trade: ${error.message}`);
      return;
    }

    setTrades((currentTrades) => currentTrades.filter((item) => item.id !== trade.id));
    setSelectedTrade(null);
  }

  const totalTrades = trades.length;

  const wins = trades.filter(
    (trade) => trade.outcome?.toLowerCase() === "win"
  ).length;

  const winRate =
    totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  const simulatedPL = trades.reduce(
    (total, trade) => total + numericValue(trade.simulated_pnl),
    0
  );

  const averageR =
    totalTrades > 0
      ? trades.reduce(
          (total, trade) => total + numericValue(trade.r_multiple),
          0
        ) / totalTrades
      : 0;
  const performanceMetrics = calculatePerformanceMetrics(trades);
  const equityTrades = filterTradesByPeriod(trades, equityPeriod);
  const equityCurve = buildEquityCurve(equityTrades);
  const chartGeometry = getChartGeometry(equityCurve);
  const orderedTrades = sortTradesChronologically(equityTrades);
  const formatMoney = (value) =>
    Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formatDate = (value) =>
    new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  if (showStatisticsPage) {
    return (
      <div className="app">
        <header className="topbar">
          <div>
            <div className="logo">ForexFrame</div>
            <div className="subtitle">Trading Journal</div>
          </div>
          <div className="profile-area">
            <span className="user-email">{user.email}</span>
            <button className="profile" onClick={handleLogout}>
              {user.email?.charAt(0).toUpperCase() || "U"}
            </button>
          </div>
        </header>
        <StatisticsPage
          trades={trades}
          onBack={() => setShowStatisticsPage(false)}
        />
      </div>
    );
  }

  if (showTradesPage) {
    return (
      <div className="app">
        <header className="topbar">
          <div>
            <div className="logo">ForexFrame</div>
            <div className="subtitle">Trading Journal</div>
          </div>
          <div className="profile-area">
            <span className="user-email">{user.email}</span>
            <button className="profile" onClick={handleLogout}>
              {user.email?.charAt(0).toUpperCase() || "U"}
            </button>
          </div>
        </header>
        <TradesPage
          trades={sortTradesChronologically(trades).reverse()}
          loadingTrades={loadingTrades}
          selectedTrade={selectedTrade}
          onSelectTrade={setSelectedTrade}
          onBack={() => {
            setShowTradesPage(false);
            setSelectedTrade(null);
          }}
          onEdit={(trade) => {
            setSelectedTrade(trade);
            setShowModal(true);
          }}
          onDelete={handleDeleteTrade}
        />
        {showModal && (
          <AddTradeModal
            onClose={() => setShowModal(false)}
            onSaved={loadTrades}
            initialTrade={selectedTrade}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="logo">ForexFrame</div>
          <div className="subtitle">Trading Journal</div>
        </div>

        <div className="profile-area">
          <span className="user-email">{user.email}</span>

          <button className="profile" onClick={handleLogout}>
            {user.email?.charAt(0).toUpperCase() || "U"}
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR JOURNAL</p>
            <h1>Good to see you.</h1>
            <p className="muted">
              Review your simulated trading performance and improve your
              process.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowModal(true)}
          >
            + Add Trade
          </button>
        </section>

        <section className="stats-grid">
          <div className="card">
            <span>Total Trades</span>
            <strong>{totalTrades}</strong>
          </div>

          <div className="card">
            <span>Win Rate</span>
            <strong>{winRate}%</strong>
          </div>

          <div className="card">
            <span>Simulated P/L</span>
            <strong>{simulatedPL.toFixed(2)}</strong>
          </div>

          <div className="card">
            <span>Average R</span>
            <strong>{averageR.toFixed(2)}R</strong>
          </div>
        
          <div className="card">
  <span>Best Trade</span>
  <strong>{performanceMetrics.bestTrade.toFixed(2)}</strong>
</div>

        <div className="card">
  <span>Worst Trade</span>
  <strong>{performanceMetrics.worstTrade.toFixed(2)}</strong>
</div>

        <div className="card">
  <span>Max Drawdown</span>
  <strong>{performanceMetrics.maxDrawdown.toFixed(2)}</strong>
</div>
       </section>

        <section className="content-grid">
          <div className="card large-card">
            <div className="card-header">
              <div>
                <h2>Performance</h2>
                <p className="muted">
                  Track your simulated equity curve over time.
                </p>
              </div>

              <div className="equity-period-controls" aria-label="Equity curve period">
                {EQUITY_PERIODS.map((period) => (
                  <button
                    key={period}
                    type="button"
                    className={`period-button ${equityPeriod === period ? "active" : ""}`}
                    aria-pressed={equityPeriod === period}
                    onClick={() => setEquityPeriod(period)}
                  >
                    {period} {period === 1 ? "day" : "days"}
                  </button>
                ))}
              </div>
            </div>

            <div className="real-chart">
              {equityTrades.length > 0 ? (
                <svg
                  viewBox="0 0 700 260"
                  role="img"
                  aria-label="Cumulative simulated equity curve with money on the Y-axis and time on the X-axis"
                >
                  {chartGeometry.yTicks.map(({ value, y }) => (
                    <g key={value} className="chart-y-tick">
                      <line
                        x1={chartGeometry.padding.left}
                        x2="680"
                        y1={y}
                        y2={y}
                        className="chart-grid-line"
                      />
                      <text x="68" y={y + 4} textAnchor="end">
                        {formatMoney(value)}
                      </text>
                    </g>
                  ))}
                  <line
                    x1={chartGeometry.padding.left}
                    x2="680"
                    y1={chartGeometry.zeroY}
                    y2={chartGeometry.zeroY}
                    className="chart-zero-line"
                  />
                  <polyline
                    points={chartGeometry.points.map(({ x, y }) => `${x},${y}`).join(" ")}
                    className="performance-line"
                  />
                  {chartGeometry.points.slice(1).map(({ x, y, trade, equity }) => (
                    <circle
                      key={trade.id ?? `${x}-${y}`}
                      cx={x}
                      cy={y}
                      r="4"
                      className="chart-point"
                    >
                      <title>
                        {new Date(trade.trade_date).toLocaleDateString()} — {equity.toFixed(2)}
                      </title>
                    </circle>
                  ))}
                  <text
                    x="14"
                    y="150"
                    textAnchor="middle"
                    transform="rotate(-90 14 150)"
                    className="chart-axis-title"
                  >
                    Amount
                  </text>
                  <text x="350" y="258" textAnchor="middle" className="chart-axis-title">
                    Time
                  </text>
                  <text x={chartGeometry.padding.left} y="247" className="chart-axis-label">
                    {formatDate(orderedTrades[0].trade_date)}
                  </text>
                  <text x="680" y="247" textAnchor="end" className="chart-axis-label">
                    {formatDate(orderedTrades[orderedTrades.length - 1].trade_date)}
                  </text>
                </svg>
              ) : (
                <div className="empty-state">
                  <p>{totalTrades === 0 ? "No equity data yet." : "No trades in this period."}</p>
                  <span>
                    {totalTrades === 0
                      ? "Add a trade to plot cumulative simulated P/L."
                      : "Choose a longer period to see more of your equity curve."}
                  </span>
                </div>
              )}

            </div>
          </div>

          <button className="card recent-trades-launcher" type="button" onClick={() => setShowTradesPage(true)}>
            <span className="launcher-icon"><Icon name="book" size={28} /></span>
            <span className="launcher-copy">
              <strong>Recent trades</strong>
              <span>Open your journal and manage every trade</span>
            </span>
            <span className="launcher-count">{totalTrades}</span>
          </button>
        </section>

        <section className="dashboard-launchers">
          <button className="card statistics-launcher" type="button" onClick={() => setShowStatisticsPage(true)}>
            <span className="launcher-icon"><Icon name="chart" size={28} /></span>
            <span className="launcher-copy">
              <strong>Trading statistics</strong>
              <span>Review win rate, P&amp;L, drawdown, streaks, and more</span>
            </span>
            <span className="launcher-arrow">→</span>
          </button>
        </section>
      </main>

      {showModal && (
  <AddTradeModal
  onClose={() => {
    setShowModal(false);
    setSelectedTrade(null);
  }}
  onSaved={loadTrades}
  initialTrade={selectedTrade}
/>
)}
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">ForexFrame</div>
        <p>Loading...</p>
      </div>
    );
  }

  return session ? <Dashboard user={session.user} /> : <AuthScreen />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function StatisticsPage({ trades, onBack }) {
  const [period, setPeriod] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const range = getStatisticsDateRange(period, new Date(), customStart, customEnd);
  const isCustomRangeReady = period !== "custom" || (customStart && customEnd);
  const periodTrades = isCustomRangeReady ? filterTradesByDateRange(trades, range.start, range.end) : [];
  const statistics = calculateTradingStatistics(periodTrades);
  const formatMoney = (value) => Number(value).toFixed(2);
  const formatProfitFactor = (value) => value == null ? "—" : Number(value).toFixed(2);

  const primaryStats = [
    ["Total Trades", statistics.totalTrades, "number"],
    ["Win Rate", `${statistics.winRate.toFixed(1)}%`, "number"],
    ["Total P&L", formatMoney(statistics.totalPnL), statistics.totalPnL >= 0 ? "positive" : "negative"],
    ["Profit Factor", formatProfitFactor(statistics.profitFactor), "number"],
    ["Average R", `${statistics.averageRMultiple.toFixed(2)}R`, "number"],
    ["Max Drawdown", formatMoney(statistics.maxDrawdown), "negative"],
    ["Largest Win", formatMoney(statistics.largestWin), "positive"],
    ["Largest Loss", formatMoney(statistics.largestLoss), "negative"],
  ];

  const secondaryStats = [
    ["Winning Trades", statistics.winningTrades],
    ["Losing Trades", statistics.losingTrades],
    ["Breakeven Trades", statistics.breakevenTrades],
    ["Average Winning Trade", formatMoney(statistics.averageWinningTrade)],
    ["Average Losing Trade", formatMoney(statistics.averageLosingTrade)],
    ["Winning Streak", statistics.winningStreak],
    ["Losing Streak", statistics.losingStreak],
  ];

  return (
    <main className="statistics-page">
      <div className="page-heading">
        <button className="back-button" type="button" onClick={onBack}>
          <Icon name="arrowLeft" size={18} />
          Dashboard
        </button>
        <div>
          <p className="eyebrow">PERFORMANCE ANALYSIS</p>
          <h1>Trading statistics</h1>
          <p className="muted">Measure your results using the trades in your journal.</p>
        </div>
      </div>

      <section className="card statistics-filter-card">
        <div className="statistics-filter-header">
          <div>
            <h2>Statistics period</h2>
            <p className="muted">Calculations update from your stored Supabase trades.</p>
          </div>
          <span className="badge">{periodTrades.length} trades</span>
        </div>
        <div className="statistics-period-controls" role="group" aria-label="Statistics period">
          <button type="button" className={`period-button ${period === "all" ? "active" : ""}`} onClick={() => setPeriod("all")}>All Time</button>
          <button type="button" className={`period-button ${period === "today" ? "active" : ""}`} onClick={() => setPeriod("today")}>Today</button>
          <button type="button" className={`period-button ${period === "week" ? "active" : ""}`} onClick={() => setPeriod("week")}>This Week</button>
          <button type="button" className={`period-button ${period === "month" ? "active" : ""}`} onClick={() => setPeriod("month")}>This Month</button>
          <button type="button" className={`period-button ${period === "30" ? "active" : ""}`} onClick={() => setPeriod("30")}>Last 30 Days</button>
          <button type="button" className={`period-button ${period === "custom" ? "active" : ""}`} onClick={() => setPeriod("custom")}>Custom Range</button>
        </div>
        {period === "custom" && (
          <div className="custom-date-range">
            <label>From<input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} /></label>
            <label>To<input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} /></label>
            {!isCustomRangeReady && <span className="muted">Select both dates to calculate this range.</span>}
          </div>
        )}
      </section>

      <section className="statistics-grid" aria-label="Trading statistics">
        {primaryStats.map(([label, value, tone]) => (
          <div className={`card statistic-card ${tone}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="card additional-statistics">
        <div className="card-header">
          <div>
            <h2>Additional statistics</h2>
            <p className="muted">Outcome counts, averages, and streaks for the selected period.</p>
          </div>
        </div>
        <div className="additional-statistics-grid">
          {secondaryStats.map(([label, value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
      </section>
    </main>
  );
}
