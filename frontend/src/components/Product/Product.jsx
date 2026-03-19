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
    About: "Stylish denim jacket with a relaxed fit.",
    Price: 1499,
    MRP: 1999,
    rating: 4.3
  },
  {
    description: "Casual Running Shoes",
    sizes: "7, 8, 9, 10, 11",
    colors: "Grey, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Comfortable lightweight shoes perfect for running and walks.",
    Price: 3299,
    MRP: 3999,
    rating: 4.6
  },
  {
    description: "Elegant Wrist Watch",
    sizes: "One Size",
    colors: "Silver, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Premium analog watch with leather strap.",
    Price: 5499,
    MRP: 6499,
    rating: 4.8
  },
  {
    description: "Wireless Headphones",
    sizes: "One Size",
    colors: "Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Over‑ear Bluetooth headphones with deep bass and 20h battery life.",
    Price: 2499,
    MRP: 2999,
    rating: 4.5
  },
  {
    description: "Sport Style Sneakers",
    sizes: "6, 7, 8, 9, 10",
    colors: "White, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Sporty sneakers ideal for casual outfits.",
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