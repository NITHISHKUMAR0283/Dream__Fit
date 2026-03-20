import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import ProductManager from "./components/ProductManager";
import VariantManager from "./components/VariantManager";
import { getProducts } from "./api";

const STORAGE_KEY = "adminCredentials";
const ADMIN_VIEWS = [
  { id: "create", label: "Create Product" },
  { id: "read", label: "View Products" },
  { id: "update", label: "Update Product" },
  { id: "delete", label: "Delete Product" },
  { id: "variants", label: "Manage Variants" }
];

function App() {
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("create");
  const [selectedVariantProductId, setSelectedVariantProductId] = useState("");

  const selectedVariantProduct = products.find((product) => product._id === selectedVariantProductId) || null;

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

  const handleManageVariants = (productId) => {
    setSelectedVariantProductId(productId);
    setActiveView("variant-crud");
  };

  const handleBackFromVariants = () => {
    setActiveView("variants");
  };

  return (
    <main className="app-shell">
      <header className="admin-nav">
        <div className="admin-left">
          <div className="brand">RIYANSHBABA</div>
          <span className="tag">Admin Panel</span>
        </div>
        {credentials ? <button onClick={handleLogout}>Logout</button> : null}
      </header>

      {credentials ? (
        <div className="admin-action-nav card">
          <div className="content-label">Choose Action</div>
          <div className="row-actions wrap">
            {ADMIN_VIEWS.map((view) => (
              <button
                key={view.id}
                type="button"
                className={activeView === view.id ? "active-tab" : "ghost-tab"}
                onClick={() => setActiveView(view.id)}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <div className="card error">{error}</div> : null}

      {!credentials ? (
        <LoginForm onLogin={handleLogin} />
      ) : isLoading ? (
        <div className="card">Loading...</div>
      ) : activeView === "variant-crud" && selectedVariantProduct ? (
        <VariantManager
          key={selectedVariantProduct._id}
          product={selectedVariantProduct}
          credentials={credentials}
          onChanged={loadProducts}
          onBack={handleBackFromVariants}
        />
      ) : (
        <ProductManager
          products={products}
          credentials={credentials}
          onChanged={loadProducts}
          mode={activeView}
          onManageVariants={handleManageVariants}
        />
      )}
    </main>
  );
}

export default App;
