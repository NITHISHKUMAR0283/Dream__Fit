import React from 'react'
import {useParams} from 'react-router-dom'
function individual(){
    const product_id = useParams();
    return(
        <div>
            
            <p>hi this is indiviualproduct page {product_id.id}</p>
        </div>
    )
}
export default individual;