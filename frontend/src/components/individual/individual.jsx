import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById, fetchProducts, fetchPropertyCounts } from '../../api';
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
                        href="#"
          />
          <SocialLink
            icon="👍"
            label="Facebook"
                        href="#"
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
    <div className="rec-product-image-wrap">
      <img src={product.image} alt={product.title} />
    </div>
    <div className="rec-product-info">
      <p className="rec-brand">{product.brand || "-"}</p>
            <p className="rec-brand">{product.material || "-"}</p>
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
    const thumbnailsRef = React.useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

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


    // Build color options from variants
    const colorOptions = React.useMemo(() => {
        const colorMap = {};
        variants.forEach((variant) => {
            const colorKey = normalizeColorKey(variant.color);
            if (!colorKey) return;
            if (!colorMap[colorKey]) {
                colorMap[colorKey] = {
                    colorKey,
                    colorName: variant.color,
                    colorCode: variant.colorCode || variant.color || '#d1d5db',
                };
            }
        });
        return Object.values(colorMap);
    }, [variants]);

    // Build size options for selected color
    const sizeOptions = React.useMemo(() => {
        return Array.from(
            new Set(
                variants
                    .filter((variant) => normalizeColorKey(variant?.color) === selectedColor)
                    .map((variant) => variant?.size)
                    .filter(Boolean)
            )
        );
    }, [variants, selectedColor]);

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
            setCurrentImageIndex(0);
        }
    }, [displayImages, selectedImage]);

    // Handle thumbnail scroll to change main image
    React.useEffect(() => {
        const thumbnailsContainer = thumbnailsRef.current;
        if (!thumbnailsContainer || !displayImages.length) return;

        const handleScroll = (e) => {
            const container = e.target;
            const scrollPosition = container.scrollLeft;
            const itemWidth = thumbnailsContainer.querySelector('.thumb-btn')?.offsetWidth || 50;
            const gap = 8;
            const itemWithGap = itemWidth + gap;

            // Calculate which thumbnail is most visible
            const newIndex = Math.round(scrollPosition / itemWithGap);
            const clampedIndex = Math.min(newIndex, displayImages.length - 1);

            if (clampedIndex !== currentImageIndex) {
                setCurrentImageIndex(clampedIndex);
                setSelectedImage(displayImages[clampedIndex]);
            }
        };

        thumbnailsContainer.addEventListener('scroll', handleScroll);
        return () => thumbnailsContainer.removeEventListener('scroll', handleScroll);
    }, [displayImages, currentImageIndex]);

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

    const handleBuyNow = () => {
        if (!selectedSize) {
            alert("Please select a size");
            return;
        }

        let message = "🛒 *Order Details*\n\n";
        message += `ProductID: ${product._id}\n`;
        message += `Title: ${product.title}\n`;
        message += `Brand: ${product.brand || "-"}\n`;
        message += `Material: ${product.material || "-"}\n`;
        message += `Category: ${product.category || "-"}\n`;
        message += `Color: ${selectedVariant?.color || "-"}\n`;
        message += `Size: ${selectedSize}\n`;
        message += `Qty: 1\n`;
        message += `Price: ₹${selectedPrice}\n`;
        message += `LineTotal: ₹${selectedPrice}\n`;
        message += `💰 Total: ₹${selectedPrice}`;

        const phone = "918807043986";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <>
        <section className="individual-container">
            <div className="individual-media-col">
                <div className="individual-image-wrap">
                    <img src={currentImage} alt={product.title} className="individual-image" />
                </div>

                {!!displayImages.length && (
                    <div className="individual-thumbnails" ref={thumbnailsRef}>
                        {displayImages.map((imageUrl, index) => (
                            <button
                                type="button"
                                key={`${imageUrl}-${index}`}
                                className={`thumb-btn ${currentImage === imageUrl ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedImage(imageUrl);
                                    setCurrentImageIndex(index);
                                }}
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
                        <Link to="/">Home</Link>
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
                            <strong>Material:</strong> {product.material || "N/A"}
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
                                                    setCurrentImageIndex(0);
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
                                                setCurrentImageIndex(0);
                                            }
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="action-row">
                        <button type="button" onClick={handleAddToCart}>Add to Cart</button>
                        <button type="button" className="buy-now" onClick={handleBuyNow}>
                            Buy Now
                        </button>
                    </div>
                    {!!addedMessage && <p className="added-message">{addedMessage}</p>}
                </div>
            </div>
        </section>

        <section className="description-section">
            <div className="description-container">
                <h3>Product Details</h3>
                <p className="description-text">{product.description || product.about || "No description available."}</p>
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