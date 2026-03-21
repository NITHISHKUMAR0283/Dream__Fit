const mongoose = require("mongoose");

const variantSchema = mongoose.Schema({
    
            color: {
                type:String,
                required:true
            },
            sizes: {
                type: [String],
                required: false,
                default: []
            },
            size: {
                type: String,
                required: false
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
   material: {
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

