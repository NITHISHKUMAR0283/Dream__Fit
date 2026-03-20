import React from 'react';
import "../description/description.css"
function description({product}){
    const price = product?.displayPrice ?? product?.minPrice;
    const discountPercent = Number(product?.discountPercent) || 0;
    
    return(
        <div>
        <p id="meta"><strong>Brand:</strong> <strong>{product.brand || "-"}</strong></p>
        <p id="meta"><strong>Material:</strong> <strong>{product.material || "-"}</strong></p>
        <p id ="About">{product.about}</p>
        <p id="meta">{product.sizes.join(", ")}</p>
        <div className="price-row">
          {price !== null && <p id="price">₹{price}</p>}
          {discountPercent > 0 && <span className="offer-chip">{discountPercent}% OFF</span>}
        </div>
        </div>
    )
}
export default description;