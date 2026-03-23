// import dreamfitLogo from "./dreamfit-logo.svg";
import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import ProductManager from "./components/ProductManager";
import { getProducts } from "./api";

const STORAGE_KEY = "adminCredentials";

function App() {
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleLogout = () => {
    setCredentials(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const totalVariants = products.reduce((count, product) => count + (product.variants || []).length, 0);

  return (
    <main className="admin-layout">
      {credentials ? (
        <aside className="admin-sidebar">
          <div className="sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
            <span style={{
              fontFamily: 'Inter, Segoe UI, Arial, Helvetica, sans-serif',
              fontWeight: 800,
              fontSize: 28,
              color: '#222',
              letterSpacing: 1,
              textShadow: '0 2px 8px #f1f1f1',
              lineHeight: 1
            }}>Dream<span style={{ color: '#ec4899' }}>Fit</span></span>
            <span className="tag" style={{ borderColor: '#ec4899', color: '#ec4899', marginTop: 4 }}>Admin Panel</span>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Overview</div>
            <div className="sidebar-metric">
              <span>Total Products</span>
              <strong>{products.length}</strong>
            </div>
            <div className="sidebar-metric">
              <span>Total Variants</span>
              <strong>{totalVariants}</strong>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Workspace</div>
            <button type="button" className="sidebar-action" onClick={loadProducts}>Refresh Catalog</button>
          </div>
        </aside>
      ) : null}

      <div className="app-shell">
        <header className="admin-nav">
          <div className="admin-left">
            <h1 className="page-title">Catalog Management</h1>
            <p className="page-subtitle">Manage products, variants, pricing and inventory</p>
          </div>
          {credentials ? (
            <div className="admin-top-actions">
              <span className="admin-user">{credentials.email}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : null}
        </header>

        {error ? <div className="card error">{error}</div> : null}

        {!credentials ? (
          <div className="auth-shell">
            <LoginForm onLogin={handleLogin} />
          </div>
        ) : isLoading ? (
          <div className="card">Loading dashboard data...</div>
        ) : (
          <ProductManager
            products={products}
            credentials={credentials}
            onChanged={loadProducts}
          />
        )}
      </div>
    </main>
  );
}

export default App;
