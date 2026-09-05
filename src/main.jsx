import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { supabase } from "./supabase";

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

function PerformanceChart({ trades }) {
  if (trades.length === 0) {
    return (
      <div className="empty-chart">
        <div className="chart-line"></div>
        <p>Start logging simulated trades to see your performance.</p>
      </div>
    );
  }

  const orderedTrades = [...trades].sort(
    (a, b) => new Date(a.trade_date) - new Date(b.trade_date)
  );

  let runningTotal = 0;

  const points = orderedTrades.map((trade) => {
    runningTotal += Number(trade.simulated_pnl || 0);

    return {
      id: trade.id,
      value: runningTotal,
    };
  });

  const values = points.map((point) => point.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = maxValue - minValue || 1;

  const width = 700;
  const height = 260;
  const padding = 25;

  const chartPoints = points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : padding +
          (index / (points.length - 1)) * (width - padding * 2);

    const y =
      height -
      padding -
      ((point.value - minValue) / range) *
        (height - padding * 2);

    return `${x},${y}`;
  });

  return (
    <div className="real-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <line
          x1="25"
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          className="chart-zero-line"
        />

        <polyline
          points={chartPoints.join(" ")}
          className="performance-line"
        />

        {points.map((point, index) => {
          const [x, y] = chartPoints[index].split(",");

          return (
            <circle
              key={point.id}
              cx={x}
              cy={y}
              r="4"
              className="chart-point"
            />
          );
        })}
      </svg>

      <div className="chart-labels">
        <span>0</span>
        <span>
          {runningTotal >= 0 ? "+" : ""}
          {runningTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
                          }

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

function AddTradeModal({ onClose, onSaved }) {
  const [trade, setTrade] = useState(emptyTrade);
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

    const { error: insertError } = await supabase
      .from("trades")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
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
            <h2>Add Simulated Trade</h2>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
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
              {saving ? "Saving..." : "Save Simulated Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function calculatePerformanceMetrics(trades) {
  if (trades.length === 0) {
    return {
      bestTrade: 0,
      worstTrade: 0,
      maxDrawdown: 0,
    };
  }

  const profits = trades.map((trade) =>
    Number(trade.simulated_pnl || 0)
  );

  const bestTrade = Math.max(...profits);
  const worstTrade = Math.min(...profits);

  const orderedTrades = [...trades].sort(
    (a, b) =>
      new Date(a.trade_date) - new Date(b.trade_date)
  );

  let runningTotal = 0;
  let peak = 0;
  let maxDrawdown = 0;

  orderedTrades.forEach((trade) => {
    runningTotal += Number(trade.simulated_pnl || 0);

    if (runningTotal > peak) {
      peak = runningTotal;
    }

    const drawdown = peak - runningTotal;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return {
    bestTrade,
    worstTrade,
    maxDrawdown,
  };
}

function Dashboard({ user }) {
  const [trades, setTrades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingTrades, setLoadingTrades] = useState(true);

  async function loadTrades() {
    setLoadingTrades(true);

    const { data, error } = await supabase
      .from("trades")
      .select("*")
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

  const totalTrades = trades.length;

  const wins = trades.filter(
    (trade) => trade.outcome?.toLowerCase() === "win"
  ).length;

  const winRate =
    totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  const simulatedPL = trades.reduce(
    (total, trade) => total + Number(trade.simulated_pnl || 0),
    0
  );

  const averageR =
    totalTrades > 0
      ? trades.reduce(
          (total, trade) => total + Number(trade.r_multiple || 0),
          0
        ) / totalTrades
      : 0;
  const performanceMetrics =
    calculatePerformanceMetrics(trades);
                                

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
                  Your performance data will appear here.
                </p>
              </div>

              <span className="badge">
                {totalTrades === 0 ? "No data" : `${totalTrades} trades`}
              </span>
            </div>

            <PerformanceChart trades={trades} />
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2>Recent Trades</h2>
                <p className="muted">Your latest journal entries.</p>
              </div>
            </div>

            {loadingTrades ? (
              <div className="empty-state">
                <p>Loading trades...</p>
              </div>
            ) : trades.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">＋</div>
                <p>No trades recorded yet.</p>
                <span>Add your first simulated trade to begin.</span>
              </div>
            ) : (
              <div className="trade-list">
                {trades.slice(0, 5).map((trade) => (
                  <div className="trade-row" key={trade.id}>
                    <div>
                      <strong>{trade.instrument}</strong>
                      <span>
                        {trade.direction} · {trade.timeframe}
                      </span>
                    </div>

                    <div className="trade-result">
                      <strong>{trade.outcome}</strong>
                      <span>
                        {Number(trade.simulated_pnl || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {showModal && (
        <AddTradeModal
          onClose={() => setShowModal(false)}
          onSaved={loadTrades}
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
