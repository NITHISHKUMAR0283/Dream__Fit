import React from 'react';
import Description from '../description/description';
const FALLBACK_IMAGE = "https://via.placeholder.com/500x700?text=Product";

function ProductCard({product,onClick}){
    const image = product?.image || FALLBACK_IMAGE;
    const title = product?.title || "Product";
    const [imgSrc, setImgSrc] = React.useState(image);

    React.useEffect(() => {
        setImgSrc(image);
    }, [image]);
    

    return (
        <div className="card" onClick={onClick}>
            <div className="card-image-wrap">
                <img
                    src={imgSrc}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    onError={() => setImgSrc(FALLBACK_IMAGE)}
                ></img>
            </div>
            <div id="Product"><Description id="product" product={product}/></div>
            
           
        </div>
    )
}
export default ProductCard;