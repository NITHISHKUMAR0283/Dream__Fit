import React, { useState } from "react";

export default function CheckoutForm({ items, totalAmount, onOrderPlaced }) {
  const [form, setForm] = useState({ name: "", email: "", address: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant || {},
          })),
          user: form,
          totalAmount,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Order failed");
      setSuccess("Order placed! You will pay on delivery.");
      setForm({ name: "", email: "", address: "", phone: "" });
      if (onOrderPlaced) onOrderPlaced();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h3>Cash on Delivery</h3>
      <div>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} type="email" required />
      </div>
      <div>
        <label>Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} required />
      </div>
      <div>
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />
      </div>
      <button className="checkout-btn-ui" type="submit" disabled={loading}>{loading ? "Placing Order..." : `Place Order (₹${totalAmount})`}</button>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
    </form>
  );
}
