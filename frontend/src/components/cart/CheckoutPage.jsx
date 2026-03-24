import React, { useState } from "react";

function ShippingAddress({ address, onChange }) {
  return (
    <div className="shipping-address-fields">
      <div className="checkout-row">
        <label htmlFor="street">Street</label>
        <input name="street" id="street" value={address.street} onChange={onChange} required autoComplete="address-line1" />
      </div>
      <div className="checkout-row">
        <label htmlFor="city">City</label>
        <input name="city" id="city" value={address.city} onChange={onChange} required autoComplete="address-level2" />
      </div>
      <div className="checkout-row">
        <label htmlFor="state">State</label>
        <input name="state" id="state" value={address.state} onChange={onChange} required autoComplete="address-level1" />
      </div>
      <div className="checkout-row">
        <label htmlFor="postalCode">Postal Code</label>
        <input name="postalCode" id="postalCode" value={address.postalCode} onChange={onChange} required autoComplete="postal-code" />
      </div>
      <div className="checkout-row">
        <label htmlFor="country">Country</label>
        <input name="country" id="country" value={address.country} onChange={onChange} required autoComplete="country" />
      </div>
    </div>
  );
}
import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";

export default function CheckoutPage({ product }) {
  // If product is passed, it's a buy-now from product page; otherwise, it's cart checkout
  const location = useLocation();
  const navigate = useNavigate();
  const cartState = location.state || {};
  const items = product ? null : cartState.items || [];
  const totalAmount = product ? product.price : cartState.totalAmount || 0;
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ street: "", city: "", state: "", postalCode: "", country: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const orderItems = product
        ? [{
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
            variant: product.variant || {},
          }]
        : items.map((item) => ({
            productId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant || {},
          }));
      // Combine address fields into a single string
      const fullAddress = `${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`;
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          user: { ...form, address: fullAddress },
          totalAmount: product ? product.price : totalAmount,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Order failed");
      setForm({ name: "", email: "", phone: "" });
      setAddress({ street: "", city: "", state: "", postalCode: "", country: "" });
      navigate("/order-confirmed");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Order Summary Section ---
  const renderOrderSummary = () => {
    if (product) {
      return (
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-summary-item">
            <span>{product.title}</span>
            <span>₹{product.price}</span>
          </div>
          <div className="order-summary-total">
            <span>Total</span>
            <span>₹{product.price}</span>
          </div>
        </div>
      );
    }
    if (items && items.length > 0) {
      return (
        <div className="order-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div className="order-summary-item" key={item.id}>
              <span>{item.title} x{item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="order-summary-total">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
      );
    }
    return <div className="order-summary-empty">No items in cart.</div>;
  };

  return (
    <div className="checkout-page-bg">
      <div className="checkout-main-grid">
        <div className="checkout-form-section">
          <h2 className="checkout-title">Checkout</h2>
          <form className="checkout-form-ui" onSubmit={handleSubmit} autoComplete="on">
            <div className="checkout-row">
              <label htmlFor="name">Full Name</label>
              <input name="name" id="name" value={form.name} onChange={handleChange} required autoComplete="name" />
            </div>
            <div className="checkout-row">
              <label htmlFor="email">Email</label>
              <input name="email" id="email" value={form.email} onChange={handleChange} type="email" required autoComplete="email" />
            </div>
            <ShippingAddress address={address} onChange={handleAddressChange} />
            <div className="checkout-row">
              <label htmlFor="phone">Phone</label>
              <input name="phone" id="phone" value={form.phone} onChange={handleChange} required autoComplete="tel" />
            </div>
            <button className="checkout-btn-ui" type="submit" disabled={loading}>
              {loading ? "Placing Order..." : `Place Order (₹${product ? product.price : totalAmount})`}
            </button>
            {error && <div className="error-msg">{error}</div>}
          </form>
        </div>
        <div className="checkout-summary-section">
          {renderOrderSummary()}
        </div>
      </div>
    </div>
  );
}
