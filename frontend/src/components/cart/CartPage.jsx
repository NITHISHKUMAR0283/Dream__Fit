import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./cart.css";

// import CheckoutPage from "./CheckoutPage";

function CartPage() {
  const navigate = useNavigate();
  const { items, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart();

    // WhatsApp order sending disabled
    // const sendToWhatsApp = () => {
    //   ...
    // };

  if (!items.length) {
    return (
      <section className="cart-container cart-empty-state">
        <h2>Your cart is empty</h2>
        <p>Add something from our latest products.</p>
        <button type="button" className="continue-btn" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </section>
    );
  }

  return (
    <section className="cart-container">
      <div className="cart-header-row">
        <h2>Your cart</h2>
        <button type="button" onClick={clearCart} className="clear-btn">
          Clear Cart
        </button>
      </div>

      <div className="cart-items-list">
        {items.map((item) => (
          <article key={item.id} className="cart-item">
            <img src={item.image} alt={item.title} className="cart-item-image" />
            <div className="cart-item-info">
              <h3>{item.title}</h3>
              <p>Brand: {item.brand || "-"}</p>
              <p>Material: {item.material || "-"}</p>
              <p>
                Color: {item.color} • Size: {item.size}
              </p>
              <p>Price: ₹{item.price}</p>

              <div className="qty-row">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.stock > 0 && item.quantity >= item.stock}
                >
                  +
                </button>
                <p className="line-total">Line Total: ₹{item.quantity * item.price}</p>
              </div>

              <button type="button" onClick={() => removeFromCart(item.id)} className="remove-btn">
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Total: ₹{totalAmount}</h3>
        <button className="checkout-btn-ui" style={{background:'#111',color:'#fff'}} onClick={() => navigate('/checkout', { state: { items, totalAmount } })}>
          Proceed to Checkout
        </button>
      </div>
    </section>
  );
}

export default CartPage;
