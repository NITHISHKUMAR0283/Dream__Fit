import React from 'react';
function ProductCard({product}){
    const image = product?.image || "https://via.placeholder.com/250x250?text=Product";
    const title = product?.description || product?.name || "Product";
    const About = product.About;
    const price = product?.Price;

    return (
        <div className="card">
            <img src={image} alt={title}></img>
            <p>{About}</p>
           <div className="rating">
      <div className="stars-outer">
        <div
          className="stars-inner"
          style={{ width: `${(product.rating / 5) * 100}%` }}
        ></div>
            
        
      </div>
      <div id="rating"> {product.rating}/5</div>
    </div >
        {price !== undefined &&<p id="price">₹{price} </p>}
        </div>
    )
}
export default ProductCard;