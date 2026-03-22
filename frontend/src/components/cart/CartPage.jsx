import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./cart.css";

function CartPage() {
  const navigate = useNavigate();
  const { items, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart();

  const sendToWhatsApp = () => {
    if (!items.length) {
      alert("Cart is empty");
      return;
    }

    let message = "🛒 *Order Details*\n\n";

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   Brand: ${item.brand || "-"}\n`;
      message += `   Material: ${item.material || "-"}\n`;
      message += `   Color: ${item.color}\n`;
      message += `   Size: ${item.size}\n`;
      message += `   Qty: ${item.quantity}\n`;
      message += `   Price: ₹${item.price}\n`;
      message += `   Line Total: ₹${item.quantity * item.price}\n\n`;
    });

    message += `💰 *Total: ₹${totalAmount}*`;

    const phone = "918807043986";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

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
        <div className="checkout-btn" style={{ opacity: 0.6, pointerEvents: 'none', textAlign: 'center', padding: '12px 0', borderRadius: '8px', background: '#e5e7eb', color: '#64748b', fontWeight: 600 }}>
          Checkout (Coming Soon)
        </div>
      </div>
    </section>
  );
}

export default CartPage;
