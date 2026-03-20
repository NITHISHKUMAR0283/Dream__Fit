import React, { useState } from "react";

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }
    // Hardcoded login check
    if (
      email.trim() === "riyanshbaba@gmial.com" &&
      password.trim() === "riyanshbaba2026"
    ) {
      onLogin({ email: email.trim(), password: password.trim() });
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div className="card auth-card">
      <h2>Admin Login</h2>
      <p className="muted">Enter your admin email and password.</p>
      <form onSubmit={handleSubmit} className="grid">
        <input
          placeholder="Admin email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}

export default LoginForm;
