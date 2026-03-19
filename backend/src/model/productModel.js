const mongoose = require("mongoose");

const variantSchema = mongoose.Schema({
    
            color: {
                type:String,
                required:true
            },
            size: {
                type:String,
                required:true
            },
            sku: {
                type: String,
                required: true,
                unique: true
            },
            price:{
                type:Number,
                required:true
            },
            stock:{
                type:Number,
                default:0
            },
            images:[{
                url:{
                    type:String,
                    required:true
                
                }
        }]
        
        }
)
const productSchema = mongoose.Schema({
   About:{
        type:String,
        required:true
    },
    variant:[variantSchema]
    
    
    
});
module.exports = mongoose.model("Product",productSchema);

