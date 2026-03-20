import React, { useState } from 'react';
import '../Product/product.css';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../api';

function ProductSearch({ limit, sort }) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchProducts({ limit, sort, search: searchInput });
      setProducts(result);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="product-search-layout">
      <div className="product-search-toolbar">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
        />
        <button onClick={handleSearch} aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 2a8 8 0 015.29 13.71l4.3 4.3-1.42 1.42-4.3-4.3A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z" />
          </svg>
        </button>
      </div>
      {loading && <p className="product-feedback">Loading products...</p>}
      {error && <p className="product-feedback">{error}</p>}
      <div className="products-container">
        {products.map((p) => (
          <ProductCard onClick={() => navigate(`/product/${p._id}`)} key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default ProductSearch;
