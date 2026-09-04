import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="logo">ForexFrame</div>
          <div className="subtitle">Trading Journal</div>
        </div>

        <button className="profile">H</button>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR JOURNAL</p>
            <h1>Good to see you.</h1>
            <p className="muted">
              Review your simulated trading performance and improve your process.
            </p>
          </div>

          <button className="primary-button">
            + Add Trade
          </button>
        </section>

        <section className="stats-grid">
          <div className="card">
            <span>Total Trades</span>
            <strong>0</strong>
          </div>

          <div className="card">
            <span>Win Rate</span>
            <strong>0%</strong>
          </div>

          <div className="card">
            <span>Simulated P/L</span>
            <strong>0.00</strong>
          </div>

          <div className="card">
            <span>Average R</span>
            <strong>0.00R</strong>
          </div>
        </section>

        <section className="content-grid">
          <div className="card large-card">
            <div className="card-header">
              <div>
                <h2>Performance</h2>
                <p className="muted">Your equity curve will appear here.</p>
              </div>

              <span className="badge">No data</span>
            </div>

            <div className="empty-chart">
              <div className="chart-line"></div>
              <p>Start logging simulated trades to see your performance.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2>Recent Trades</h2>
                <p className="muted">Your latest journal entries.</p>
              </div>
            </div>

            <div className="empty-state">
              <div className="empty-icon">＋</div>
              <p>No trades recorded yet.</p>
              <span>Add your first simulated trade to begin.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
