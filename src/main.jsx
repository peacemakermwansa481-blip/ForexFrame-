import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div>
      <h1>ForexFrame</h1>
      <p>Your trading journal is coming together.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
