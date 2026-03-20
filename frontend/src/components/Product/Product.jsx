import '../Product/product.css'
import ProductCard from "./ProductCard";
import React, { useEffect, useMemo, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { fetchProducts } from '../../api';
import Filter from '../Filter/Filter';

const NAV_SUMMARY_KEY = "catalogNavSummary";

const buildNavSummary = (products = []) => {
  const brandSet = new Set();
  const categorySet = new Set();

  products.forEach((product) => {
    if (product.brand) {
      brandSet.add(product.brand);
    }
    if (product.category) {
      categorySet.add(product.category);
    }
  });

  return {
    totalProducts: products.length,
    totalBrands: brandSet.size,
    totalCategories: categorySet.size,
    updatedAt: Date.now()
  };
};

function Product({ limit, sort, searchQuery = "" }){
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProducts = async () => {
      try {
        if (isActive) {
          setLoading(true);
          setError("");
        }

        const response = await fetchProducts({
          limit,
          sort,
          search: String(searchQuery || "").trim()
        });

        if (!isActive) {
          return;
        }

        setAllProducts(response);
        setFilteredProducts(response);

        const summary = buildNavSummary(response);
        localStorage.setItem(NAV_SUMMARY_KEY, JSON.stringify(summary));
        window.dispatchEvent(new CustomEvent("catalog-summary-updated", { detail: summary }));
      } catch (err) {
        if (isActive) {
          setError(err.message || "Failed to load products");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isActive = false;
    };
  }, [limit, sort, searchQuery]);

  const handleFilterChange = (filtered) => {
    setFilteredProducts(filtered);
  };

  const normalizedSearchQuery = String(searchQuery || "").trim().toLowerCase();

  const visibleProducts = useMemo(() => {
    if (!normalizedSearchQuery) {
      return filteredProducts;
    }

    return filteredProducts.filter((product) => {
      const searchableParts = [
        product?.title,
        product?.about,
        product?.description,
        product?.brand,
        product?.category,
        product?.material,
        ...(product?.colors || []),
        ...(product?.sizes || [])
      ]
        .map((value) => String(value || "").toLowerCase())
        .filter(Boolean);

      return searchableParts.some((part) => part.includes(normalizedSearchQuery));
    });
  }, [filteredProducts, normalizedSearchQuery]);

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
          <p className="product-count">{visibleProducts.length} products</p>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="product-feedback">No products match your filters.</p>
        ) : (
          <div className="products-container">
            {visibleProducts.map((p) => (
              <ProductCard onClick={()=>navigate(`/product/${p._id}`)} key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Product;