import React, { useState } from "react";


function LoginForm({ onLogin }) {
  // Hardcoded admin credentials
  const email = "nk0283@srmist.edu.in";
  const password = "ASNRnithishjee@gmail.com";

  const handleSubmit = (event) => {
    event.preventDefault();
    // Always succeed with hardcoded credentials
    onLogin({ email, password });
  };

  return (
    <div className="card auth-card">
      <h2>Admin Login</h2>
      <p className="muted">Enter your admin email and password.</p>
      <form onSubmit={handleSubmit} className="grid">
        <input
          placeholder="Admin email"
          value={email}
          disabled
        />
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          disabled
        />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}

export default LoginForm;
