import React, { useState } from "react";


function LoginForm({ onLogin }) {
  // Hardcoded admin credentials
  const ADMIN_EMAIL = "dreamfit@gmail.com";
  const ADMIN_PASSWORD = "rajarishi2026";
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputEmail === ADMIN_EMAIL && inputPassword === ADMIN_PASSWORD) {
      setError("");
      onLogin({ email: inputEmail, password: inputPassword });
    } else {
      setError("Invalid admin email or password.");
    }
  };

  return (
    <div className="card auth-card">
      <h2>Admin Login</h2>
      <p className="muted">Enter your admin email and password.</p>
      <form onSubmit={handleSubmit} className="grid">
        <input
          placeholder="Admin email"
          value={inputEmail}
          onChange={e => setInputEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Admin password"
          value={inputPassword}
          onChange={e => setInputPassword(e.target.value)}
        />
        <button type="submit">Continue</button>
        {error && <div className="error-text">{error}</div>}
      </form>
    </div>
  );
}

export default LoginForm;
