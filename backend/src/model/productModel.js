const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    //price, description , size(and its unit ) , color , about this item , picture
    description:{
        type:String,
        required:true
    },
    sizes:{
        type:String,
        required:true        
    },
    colors:{
        type:String,
    },
    image:{
        type:String,
        required:true
    },
    About:{
        type:String,
        required:true
    },
    Price:{
        type: Number,
        required:true
    }

});
module.exports = mongoose.model("Product",productSchema);

