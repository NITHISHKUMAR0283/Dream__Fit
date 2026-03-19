import React from 'react';
import "../description/description.css"
function description({product}){
    
    return(
        <div>
        <p id ="About">{product.About}</p>
        <div className="rating">
      <div className="stars-outer">
        <div
          className="stars-inner"
          style={{ width: `${(product.rating / 5) * 100}%` }}
        ></div>
            
        
      </div>
      <div id="rating"> {product.rating}/5</div>
    </div >
        {<p id="price">₹{product.Price} </p>}</div>
    )
}
export default description;