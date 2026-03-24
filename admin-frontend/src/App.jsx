// import dreamfitLogo from "./dreamfit-logo.svg";
import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import ProductManager from "./components/ProductManager";
import OrderManager from "./components/OrderManager";
import { getProducts } from "./api";

const STORAGE_KEY = "adminCredentials";

function App() {
    const handleLogout = () => {
      setCredentials(null);
      localStorage.removeItem(STORAGE_KEY);
    };
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const totalVariants = products.reduce((count, product) => count + (product.variants || []).length, 0);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleLogin = (nextCredentials) => {
    setCredentials(nextCredentials);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCredentials));
  };

  return (
    <main className="admin-layout" style={{ display: 'block', minHeight: '100vh', background: '#f1f5f9' }}>
      <header className="admin-nav" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', borderBottom: '1.5px solid #ec4899',
        padding: '10px 24px', minHeight: 60, boxShadow: '0 2px 8px rgba(236,72,153,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{
            fontFamily: 'Inter, Segoe UI, Arial, Helvetica, sans-serif',
            fontWeight: 800, fontSize: 22, color: '#222', letterSpacing: 1,
            textShadow: '0 2px 8px #f1f1f1', lineHeight: 1
          }}>Dream<span style={{ color: '#ec4899' }}>Fit</span></span>
          <span className="tag" style={{ borderColor: '#ec4899', color: '#ec4899', marginLeft: 6, fontSize: 12 }}>Admin Panel</span>
        </div>
        {credentials && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span className="admin-user" style={{ background: '#fff', color: '#ec4899', border: '1px solid #ec4899', fontWeight: 600, marginLeft: 10 }}>{credentials.email}</span>
            <button onClick={handleLogout} style={{ background: '#ec4899', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Logout</button>
          </div>
        )}
      </header>
      <div className="app-shell" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <div className="admin-left" style={{ height: 'auto', alignItems: 'flex-start', justifyContent: 'flex-end', gap: 2, marginBottom: 12 }}>
          <h1 className="page-title" style={{ fontSize: 20, marginBottom: 2, marginTop: 0 }}>Catalog Management</h1>
          <p className="page-subtitle" style={{ fontSize: 14, margin: 0 }}>Manage products, variants, pricing and inventory</p>
        </div>
        {error ? <div className="card error">{error}</div> : null}
        {!credentials ? (
          <div className="auth-shell">
            <LoginForm onLogin={handleLogin} />
          </div>
        ) : isLoading ? (
          <div className="card">Loading dashboard data...</div>
        ) : (
          <>
            <ProductManager
              products={products}
              credentials={credentials}
              onChanged={loadProducts}
            />
            <div className="admin-section">
              <OrderManager />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default App;
