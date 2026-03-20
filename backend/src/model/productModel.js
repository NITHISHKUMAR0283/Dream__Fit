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
        
        },
        { strict: false }
    )
    const productSchema = mongoose.Schema({
   About:{
        type:String,
        required:true
    },
   description: {
        type: String,
        default: ""
    },
   brand: {
        type: String,
        default: ""
    },
   category: {
        type: String,
        default: ""
    },
        primaryImage: {
            url: {
                type: String,
                required: false
            }
        },
    variants:[variantSchema]
    
    
    
},{ strict: false });
module.exports = mongoose.model("Product",productSchema);

