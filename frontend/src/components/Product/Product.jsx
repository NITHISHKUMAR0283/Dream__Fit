import '../Product/product.css'
import ProductCard from "./ProductCard";
import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { fetchProducts } from '../../api';
import Filter from '../Filter/Filter';

function Product({ limit, sort }){
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetchProducts({ limit, sort });
        setAllProducts(response);
        setFilteredProducts(response);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [limit, sort]);

  const handleFilterChange = (filtered) => {
    setFilteredProducts(filtered);
  };

  if (loading) {
    return <p className="product-feedback">Loading products...</p>;
  }

  if (error) {
    return <p className="product-feedback">{error}</p>;
  }

  if (!allProducts.length) {
    return <p className="product-feedback">No products found.</p>;
  }

  return (
    <div className="product-layout">
      {/* Filter Panel - Desktop */}
      <aside className="filter-sidebar">
        <Filter products={allProducts} onFilterChange={handleFilterChange} />
      </aside>

      {/* Filter Drawer - Mobile */}
      {filterDrawerOpen && <button type="button" className="filter-overlay" onClick={() => setFilterDrawerOpen(false)} aria-label="Close filter" />}
      <aside className={`filter-drawer ${filterDrawerOpen ? "open" : ""}`}>
        <div className="filter-drawer-header">
          <h3>Filters</h3>
          <button className="filter-close-btn" onClick={() => setFilterDrawerOpen(false)}>✕</button>
        </div>
        <Filter products={allProducts} onFilterChange={handleFilterChange} />
      </aside>

      {/* Products Grid */}
      <div className="product-main">
        <div className="product-toolbar">
          <button className="filter-toggle-btn show-on-mobile" onClick={() => setFilterDrawerOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 6h18v2H3V6zm2 5h14v2H5v-2zm3 5h8v2H8v-2z"/>
            </svg>
            Filters
          </button>
          <p className="product-count">{filteredProducts.length} products</p>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="product-feedback">No products match your filters.</p>
        ) : (
          <div className="products-container">
            {filteredProducts.map((p) => (
              <ProductCard onClick={()=>navigate(`/product/${p._id}`)} key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Product;