import '../Product/product.css'
import ProductCard from "./ProductCard";
import React from 'react';
function Product(){
const sampleProducts = [
  {
    description: "Blue Denim Jacket",
    sizes: "S, M, L",
    colors: "Blue",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Crafted from premium quality denim for long-lasting durability. Designed with a relaxed fit for everyday comfort and style. Features button closure with sturdy metal buttons. Includes multiple pockets for convenience and utility. Soft inner lining ensures all-day comfort. Perfect for layering over t-shirts or hoodies. Fade-resistant fabric maintains its color after multiple washes. Suitable for casual outings and semi-formal looks. Breathable material keeps you comfortable in all seasons. A must-have staple for every modern wardrobe.",
    Price: 1499,
    MRP: 1999,
    rating: 4.3
  },
  {
    description: "Casual Running Shoes",
    sizes: "7, 8, 9, 10, 11",
    colors: "Grey, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Engineered with lightweight materials for enhanced performance. Breathable mesh upper keeps feet cool and dry. Cushioned sole provides excellent shock absorption. Designed for long runs and daily wear. Durable rubber outsole ensures strong grip on all surfaces. Flexible structure allows natural foot movement. Stylish design suitable for casual outfits. Easy lace-up system for a secure fit. Sweat-resistant interior enhances comfort. Ideal choice for fitness enthusiasts and everyday users.",
    Price: 3299,
    MRP: 3999,
    rating: 4.6
  },
  {
    description: "Elegant Wrist Watch",
    sizes: "One Size",
    colors: "Silver, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Designed with a sleek and elegant finish for a premium look. Features a durable stainless steel case. High-quality quartz movement ensures accurate timekeeping. Scratch-resistant glass protects the dial. Comfortable leather strap for extended wear. Water-resistant design for everyday usage. Minimalist dial enhances readability. Suitable for both formal and casual occasions. Long-lasting battery life for convenience. A perfect blend of style and functionality.",
    Price: 5499,
    MRP: 6499,
    rating: 4.8
  },
  {
    description: "Wireless Headphones",
    sizes: "One Size",
    colors: "Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Equipped with advanced Bluetooth technology for seamless connectivity. Delivers deep bass and clear sound quality. Comfortable over-ear design reduces noise and fatigue. Long battery life supports extended listening sessions. Built-in microphone for hands-free calls. Foldable design for easy portability. Soft ear cushions enhance comfort. Quick charging feature saves time. Compatible with multiple devices. Ideal for music lovers and professionals alike.",
    Price: 2499,
    MRP: 2999,
    rating: 4.5
  },
  {
    description: "Sport Style Sneakers",
    sizes: "6, 7, 8, 9, 10",
    colors: "White, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Modern sporty design that complements casual outfits. Lightweight construction ensures all-day comfort. Breathable fabric keeps your feet fresh. Durable sole provides excellent traction. Easy slip-on and lace-up combination for convenience. Cushioned interior for added support. Stylish look suitable for multiple occasions. High-quality materials ensure long-lasting use. Flexible design adapts to foot movement. Perfect for both casual wear and light sports activities.",
    Price: 2799,
    MRP: 3499,
    rating: 4.4
  }
];


    return(
    <div className="products-container">
      {sampleProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
    )
}
export default Product;