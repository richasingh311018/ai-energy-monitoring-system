import React, { useState } from 'react';

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'energy123';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (username.trim() === DEMO_USERNAME && password === DEMO_PASSWORD) {
      onLogin({ username: DEMO_USERNAME });
      return;
    }

    setError('Invalid credentials. Use the demo login shown below.');
  };

  return (
    <div className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="brand-mark">E</div>
          <div>
            <strong>EnergyIQ</strong>
            <span>Operations platform</span>
          </div>
        </div>
        <div className="login-copy">
          <p className="eyebrow">HINDALCO ALUMINA REFINERY</p>
          <h1>Welcome back</h1>
          <p>Sign in to monitor refinery energy performance, trends, and forecasts.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="Enter username"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter password"
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit">Sign in to dashboard</button>
        </form>
        <div className="demo-credentials">
          <strong>Demo access</strong>
          <span>Username: <b>admin</b> &nbsp; Password: <b>energy123</b></span>
        </div>
      </section>
      <section className="login-visual">
        <div className="login-visual-content">
          <span className="visual-kicker">ENERGY INTELLIGENCE</span>
          <h2>Make every kilowatt count.</h2>
          <p>One connected view of consumption across the six core alumina refinery process areas.</p>
          <div className="process-preview">
            <span>Bauxite Handling</span>
            <span>Digestion</span>
            <span>Clarification</span>
            <span>Evaporation</span>
            <span>Precipitation</span>
            <span>Calcination</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
