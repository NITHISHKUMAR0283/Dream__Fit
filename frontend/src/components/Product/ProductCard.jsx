import React from 'react';
import Description from '../description/description';
function ProductCard({product,onClick}){
    const image = product?.image || "https://via.placeholder.com/250x250?text=Product";
    const title = product?.description || product?.name || "Product";
    

    return (
        <div className="card" onClick={onClick}>
            <img src={image} alt={title}></img>
            <div id="Product"><Description id="product" product={product}/></div>
            
           
        </div>
    )
}
export default ProductCard;