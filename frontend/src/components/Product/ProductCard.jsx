import React from 'react';
import Description from '../description/description';
function ProductCard({product}){
    const image = product?.image || "https://via.placeholder.com/250x250?text=Product";
    const title = product?.description || product?.name || "Product";
    const About = product.About;
    const price = product?.Price;

    return (
        <div className="card">
            <img src={image} alt={title}></img>
           
            <Description id="product" product={product}/>
           
        </div>
    )
}
export default ProductCard;