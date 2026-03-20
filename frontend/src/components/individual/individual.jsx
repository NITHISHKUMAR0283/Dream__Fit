import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById, fetchProducts } from '../../api';
import { useCart } from '../../context/CartContext';
import './individual.css';

const isHexColor = (value) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test((value || "").trim());
const normalizeColorKey = (value) => (value || "").trim().toLowerCase();

const SocialLink = ({ icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="social-link"
    title={label}
    aria-label={label}
  >
    {icon}
  </a>
);

const Footer = () => (
  <footer className="individual-footer">
    <div className="footer-content">
      <div className="footer-section">
        <h3>About Riyanshbaba</h3>
        <p>
          Riyanshbaba is your trusted ecommerce destination for quality products. We bring you a curated selection of items with exceptional service, fast delivery, and customer-first approach. Our mission is to make online shopping convenient, affordable, and enjoyable.
        </p>
      </div>

      <div className="footer-section">
        <h3>Follow Us</h3>
        <div className="social-links">
          <SocialLink
            icon="📱"
            label="WhatsApp"
            href="https://wa.me/919999999999"
          />
          <SocialLink
            icon="📸"
            label="Instagram"
            href="https://instagram.com/riyanshbaba"
          />
          <SocialLink
            icon="👍"
            label="Facebook"
            href="https://facebook.com/riyanshbaba"
          />
        </div>
      </div>

      <div className="footer-section">
        <h3>Why Choose Us?</h3>
        <ul>
          <li>✓ Premium Quality Products</li>
          <li>✓ Fast & Free Shipping</li>
          <li>✓ Easy Returns & Exchanges</li>
          <li>✓ 24/7 Customer Support</li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <p>&copy; 2026 Riyanshbaba. All rights reserved.</p>
    </div>
  </footer>
);

const ProductRecommendationCard = ({ product }) => (
  <Link to={`/product/${product._id}`} className="rec-product-card">
    <div className="rec-product-image">
      <img src={product.image} alt={product.title} />
    </div>
    <div className="rec-product-info">
      <h4>{product.title}</h4>
      <div className="rec-product-price">
        <span className="rec-price">₹{product.displayPrice || product.minPrice}</span>
        {product.discountPercent > 0 && (
          <span className="rec-discount">{product.discountPercent}% OFF</span>
        )}
      </div>
    </div>
  </Link>
);

function Individual() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [selectedColor, setSelectedColor] = React.useState("");
    const [selectedSize, setSelectedSize] = React.useState("");
    const [selectedImage, setSelectedImage] = React.useState("");
    const [addedMessage, setAddedMessage] = React.useState("");
    const [recommendations, setRecommendations] = React.useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = React.useState(false);

    React.useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetchProductById(id);
                setProduct(response);

                const firstVariant = response?.variants?.[0];
                if (firstVariant) {
                    setSelectedColor(normalizeColorKey(firstVariant.color));
                    setSelectedSize(firstVariant.size || "");
                    setSelectedImage(firstVariant?.images?.[0]?.url || response.image || "");
                }

                // Fetch recommendations
                loadRecommendations();
            } catch (err) {
                setError(err.message || "Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const loadRecommendations = async () => {
        try {
            setRecommendationsLoading(true);
            // Fetch 12 products and filter out the current one
            const products = await fetchProducts({ limit: 12 });
            const filtered = products.filter((p) => p._id !== id).slice(0, 8);
            setRecommendations(filtered);
        } catch (err) {
            console.error("Failed to load recommendations:", err);
        } finally {
            setRecommendationsLoading(false);
        }
    };

    const variants = product?.variants || [];
    const hasRange = product?.minPrice !== null && product?.maxPrice !== null && product?.minPrice !== product?.maxPrice;

    const colorOptions = Array.from(
        new Map(
            variants
                .filter((variant) => variant?.color)
                .map((variant) => [
                    normalizeColorKey(variant.color),
                    {
                        colorName: (variant.color || "").trim(),
                        colorCode: (variant.colorCode || (isHexColor(variant.color) ? variant.color : "#d1d5db"))
                    }
                ])
        ).entries()
    ).map(([colorKey, colorData]) => ({ colorKey, ...colorData }));

    const sizeOptions = Array.from(
        new Set(
            variants
                .filter((variant) => !selectedColor || normalizeColorKey(variant?.color) === selectedColor)
                .map((variant) => variant?.size)
                .filter(Boolean)
        )
    );

    const selectedVariant =
        variants.find(
            (variant) => normalizeColorKey(variant?.color) === selectedColor && variant?.size === selectedSize
        ) || variants[0];

    const selectedVariantStock = Number(selectedVariant?.stock) || 0;

    const variantImages = (selectedVariant?.images || [])
        .map((imageEntry) => imageEntry?.url)
        .filter(Boolean);

    const displayImages = variantImages.length ? variantImages : [product?.image].filter(Boolean);

    const currentImage = displayImages.includes(selectedImage)
        ? selectedImage
        : displayImages[0] || product?.image;

    const selectedPrice = Number(selectedVariant?.price);
    const selectedReferencePrice =
        Number(selectedVariant?.mrp) > 0
            ? Number(selectedVariant?.mrp)
            : null;
    const selectedDiscount =
        Number.isFinite(selectedReferencePrice) && Number.isFinite(selectedPrice) && selectedPrice > 0 && selectedReferencePrice > selectedPrice
            ? Math.round(((selectedReferencePrice - selectedPrice) / selectedReferencePrice) * 100)
            : 0;

    React.useEffect(() => {
        if (displayImages.length && !displayImages.includes(selectedImage)) {
            setSelectedImage(displayImages[0]);
        }
    }, [displayImages, selectedImage]);

    if (loading) {
        return <section className="individual-container not-found">Loading product...</section>;
    }

    if (error) {
        return <section className="individual-container not-found">{error}</section>;
    }

    if (!product) {
        return (
            <section className="individual-container not-found">
                <h2>Product not found</h2>
                <p>We couldn&apos;t find this product.</p>
                <Link to="/">Go back to products</Link>
            </section>
        );
    }

    const handleAddToCart = () => {
        addToCart(product, {
            color: selectedVariant?.color || selectedColor,
            size: selectedSize
        });

        setAddedMessage("Added to cart");
        setTimeout(() => setAddedMessage(""), 1500);
    };

    return (
        <>
        <section className="individual-container">
            <div className="individual-media-col">
                <div className="individual-image-wrap">
                    <img src={currentImage} alt={product.title} className="individual-image" />
                </div>

                {!!displayImages.length && (
                    <div className="individual-thumbnails">
                        {displayImages.map((imageUrl, index) => (
                            <button
                                type="button"
                                key={`${imageUrl}-${index}`}
                                className={`thumb-btn ${currentImage === imageUrl ? "active" : ""}`}
                                onClick={() => setSelectedImage(imageUrl)}
                            >
                                <img src={imageUrl} alt={`${product.title} ${index + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="individual-details-card">
                <div className="individual-details">
                    <p className="breadcrumb">
                        <Link to="/">Home</Link> / {product.title}
                    </p>

                    <h1>{product.title}</h1>

                    <div className="individual-price-row">
                        {Number.isFinite(selectedPrice) ? (
                            <span className="price">₹{selectedPrice}</span>
                        ) : (
                            product.minPrice !== null && (
                                <span className="price">
                                    ₹{product.minPrice}
                                    {hasRange ? ` - ₹${product.maxPrice}` : ""}
                                </span>
                            )
                        )}

                        {selectedDiscount > 0 && <span className="off">{selectedDiscount}% OFF</span>}
                    </div>

                    <div className="meta-row">
                        <p>
                            <strong>Brand:</strong> {product.brand || "N/A"}
                        </p>
                        <p>
                            <strong>Category:</strong> {product.category || "N/A"}
                        </p>
                        <p>
                            <strong>Sizes:</strong> {product.sizes.join(", ") || "N/A"}
                        </p>
                        <p>
                            <strong>Stock:</strong> {selectedVariantStock}
                        </p>
                    </div>

                    {!!colorOptions.length && (
                        <div className="variant-row">
                            <label>Color</label>
                            <div className="color-swatch-row">
                                {colorOptions.map(({ colorKey, colorName, colorCode }) => {
                                    const safeColor = isHexColor(colorCode) ? colorCode : "#d1d5db";

                                    return (
                                        <button
                                            key={colorKey}
                                            type="button"
                                            className={`color-swatch ${selectedColor === colorKey ? "active" : ""}`}
                                            style={{ backgroundColor: safeColor }}
                                            title={colorName}
                                            aria-label={`Select color ${colorName}`}
                                            onClick={() => {
                                                const nextColor = colorKey;
                                                setSelectedColor(nextColor);

                                                const nextSize = (product.variants || []).find(
                                                    (variant) => normalizeColorKey(variant?.color) === nextColor
                                                )?.size;

                                                if (nextSize) {
                                                    setSelectedSize(nextSize);
                                                }

                                                const nextVariant = (product.variants || []).find(
                                                    (variant) => normalizeColorKey(variant?.color) === nextColor && variant?.size === nextSize
                                                ) || (product.variants || []).find((variant) => normalizeColorKey(variant?.color) === nextColor);

                                                const nextImage = nextVariant?.images?.[0]?.url || product.image;
                                                if (nextImage) {
                                                    setSelectedImage(nextImage);
                                                }
                                            }}
                                        ></button>
                                    );
                                })}
                            </div>
                            <span className="selected-color-code">{(selectedVariant?.color || "").toUpperCase()}</span>
                        </div>
                    )}

                    {!!sizeOptions.length && (
                        <div className="variant-row">
                            <label>Size</label>
                            <div className="size-chip-row">
                                {sizeOptions.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        className={`size-chip ${selectedSize === size ? "active" : ""}`}
                                        onClick={() => {
                                            const nextSize = size;
                                            setSelectedSize(nextSize);

                                            const nextVariant = (product.variants || []).find(
                                                (variant) => normalizeColorKey(variant?.color) === selectedColor && variant?.size === nextSize
                                            );

                                            const nextImage = nextVariant?.images?.[0]?.url || product.image;
                                            if (nextImage) {
                                                setSelectedImage(nextImage);
                                            }
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="about">{product.description || product.about || "No description available."}</p>

                    <div className="action-row">
                        <button type="button" onClick={handleAddToCart}>Add to Cart</button>
                        <button type="button" className="buy-now">
                            Buy Now
                        </button>
                    </div>
                    {!!addedMessage && <p className="added-message">{addedMessage}</p>}
                </div>
            </div>
        </section>

        {recommendations.length > 0 && (
            <section className="recommendations-section">
                <div className="recommendations-container">
                    <h2>You Might Also Like</h2>
                    <div className="recommendations-grid">
                        {recommendations.map((rec) => (
                            <ProductRecommendationCard key={rec._id} product={rec} />
                        ))}
                    </div>
                </div>
            </section>
        )}
        </>
    );
}

export default Individual;