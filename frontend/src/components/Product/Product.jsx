import '../Product/product.css'
import ProductCard from "./ProductCard";
import React from 'react';
import {useNavigate} from 'react-router-dom';
function Product(){
  const navigate = useNavigate();
const sampleProducts = [
  {
    _id: "p1",
    description: "Blue Denim Jacket",
    sizes: "S, M, L",
    colors: "Blue",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Crafted from premium quality denim for long-lasting durability...",
    Price: 1499,
    MRP: 1999,
    rating: 4.3
  },
  {
    _id: "p2",
    description: "Casual Running Shoes",
    sizes: "7, 8, 9, 10, 11",
    colors: "Grey, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Engineered with lightweight materials for enhanced performance...",
    Price: 3299,
    MRP: 3999,
    rating: 4.6
  },
  {
    _id: "p3",
    description: "Elegant Wrist Watch",
    sizes: "One Size",
    colors: "Silver, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Designed with a sleek and elegant finish for a premium look...",
    Price: 5499,
    MRP: 6499,
    rating: 4.8
  },
  {
    _id: "p4",
    description: "Wireless Headphones",
    sizes: "One Size",
    colors: "Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Equipped with advanced Bluetooth technology for seamless connectivity...",
    Price: 2499,
    MRP: 2999,
    rating: 4.5
  },
  {
    _id: "p5",
    description: "Sport Style Sneakers",
    sizes: "6, 7, 8, 9, 10",
    colors: "White, Black",
    image: "https://cdn.shopify.com/s/files/1/0632/2526/6422/files/1_eafefc8d-f77c-4ecb-8797-5e845f347047.jpg?v=1753024633",
    About: "Modern sporty design that complements casual outfits...",
    Price: 2799,
    MRP: 3499,
    rating: 4.4
  }
];


    return(
    <div className="products-container">
      {sampleProducts.map((p) => (
        <ProductCard onClick={()=>navigate(`/product/${p._id}`)} key={p._id} product={p} />
      ))}
    </div>
    )
}
export default Product;