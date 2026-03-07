const Product = require("../model/projectModel");
const asyncHandler = require("../middlewares/asyncHandler")
// create, update , delete , read 

const createProduct = asyncHandler(async (req,res)=>{
    const product = await Product.create(req.body);
    res.status(201).json({
        message:"product created successfully",
        data : product
    })    
});

const updateProduct = asyncHandler(async (req,res)=>{
    const product = Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    if(!product){
        return res.status(404).json({
            message:"cant find the product"
        })
    }
    res.status(200).json({
        message:"product update successfully",
        data:product
    })
});

const deleteProduct = asyncHandler(async(req,res)=>{
    const product = Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
        message:"product deleted successfully",
        data:product
    }
    )
});

const getProduct = asyncHandler(async (req,res)=>{
    const product = Product.find();
    res.status(200).json({
        message:"Returning Product",
        data:product
    })
});

module.exports = {createProduct,updateProduct,deleteProduct,getProduct}