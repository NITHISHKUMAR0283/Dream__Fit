


import React, { useEffect, useState } from "react";
import { getProductById } from "../api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
console.log("API_BASE_URL in OrderManager:", API_BASE_URL);

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState("");
  const [productDetails, setProductDetails] = useState({});
  const [deleting, setDeleting] = useState("");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to delete order");
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting("");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch orders");
      // Only show orders that are not Delivered or Cancelled
      const filtered = data.orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled");
      setOrders(filtered);
      // Fetch product details for all products in orders
      const productIds = Array.from(new Set(filtered.flatMap(order => order.items.map(item => item.productId))));
      const details = {};
      await Promise.all(productIds.map(async (id) => {
        try {
          const prod = await getProductById(id);
          if (prod) details[id] = prod;
        } catch {}
      }));
      setProductDetails(details);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    setStatusUpdating(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to update status");
      fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating("");
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="order-manager-container">
      <h2 style={{marginBottom: 24}}>Orders (COD)</h2>
      <div className="order-list">
        {orders.length === 0 ? (
          <div className="order-empty">No orders found.</div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <span className="order-id">Order ID: <b>{order._id}</b></span>
                <span className="order-status">Status: <b>{order.status}</b></span>
                <button
                  className="order-delete-btn"
                  title="Delete order"
                  onClick={() => handleDelete(order._id)}
                  disabled={deleting === order._id}
                  style={{marginLeft: 12, background: 'none', border: 'none', color: '#e74c3c', fontSize: 22, cursor: 'pointer', fontWeight: 700, lineHeight: 1}}
                >
                  ×
                </button>
              </div>
              <div className="order-details">
                <div className="order-user">
                  <div><b>Name:</b> {order.user?.name}</div>
                  <div><b>Email:</b> {order.user?.email}</div>
                  <div><b>Address:</b> {order.user?.address}</div>
                  <div><b>Phone:</b> {order.user?.phone}</div>
                </div>
                <div className="order-items">
                  <b>Items:</b>
                  <ul>
                    {order.items.map((item, idx) => {
                      const prod = productDetails[item.productId];
                      return (
                        <li key={idx} style={{marginBottom: 8}}>
                          {prod ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                              {prod.primaryImage?.url && (
                                <img src={prod.primaryImage.url} alt={prod.brand} style={{width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee'}} />
                              )}
                              <div>
                                <div style={{fontWeight: 600}}>{prod.brand}</div>
                                <div>{prod.About}</div>
                                <div style={{fontSize: '0.97em', color: '#555'}}>{item.title} x {item.quantity}</div>
                              </div>
                            </div>
                          ) : (
                            <span>{item.title} x {item.quantity}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="order-total">
                  <b>Total:</b> ₹{order.totalAmount}
                </div>
              </div>
              <div className="order-actions">
                <label htmlFor={`status-${order._id}`}>Change Status:</label>
                <select
                  id={`status-${order._id}`}
                  value={order.status}
                  onChange={e => handleStatusChange(order._id, e.target.value)}
                  disabled={statusUpdating === order._id}
                  style={{marginLeft: 8}}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
