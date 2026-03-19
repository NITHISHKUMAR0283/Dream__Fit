const Product = require("../model/productModel");
const asyncHandler = require("../middlewares/asyncHandler")


const createProduct = asyncHandler(async (req,res)=>{
    const product = await Product.create(req.body);
    res.status(201).json({
        message:"product created successfully",
        data : product
    })    
});

const updateProduct = asyncHandler(async (req,res)=>{
    const product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
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
const getSingleProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Returning Product", data: product });
});
const deleteProduct = asyncHandler(async(req,res)=>{
    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
        message:"product deleted successfully",
        data:product
    }
    )
});
const getProduct = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
        Product.find({}).skip(skip).limit(limit),
        Product.countDocuments({})
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
        message: "Returning Products",
        data: products,
        pagination: {
            currentPage: page,
            limit,
            totalProducts,
            totalPages
        }
    });
});

const addVariant = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  product.variants.push(req.body);

  await product.save();

  res.status(200).json({
    message: "Variant added",
    data: product
  });
});
const updateVariant = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const variant = product.variants.id(variantId);

  if (!variant) {
    return res.status(404).json({ message: "Variant not found" });
  }

  Object.assign(variant, req.body);

  await product.save();

  res.status(200).json({
    message: "Variant updated",
    data: variant
  });
});
const deleteVariant = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  const variant = product.variants.id(variantId);

  if (!variant) {
    return res.status(404).json({
      message: "Variant not found"
    });
  }

  variant.deleteOne();

  await product.save();

  res.status(200).json({
    message: "Variant deleted successfully",
    data: product
  });
});

const getVariant = asyncHandler(async (req, res) => {
  const { color, size } = req.query;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const variant = product.variants.find(
    v => v.color === color && v.size === size
  );

  if (!variant) {
    return res.status(404).json({ message: "Variant not found" });
  }

  res.status(200).json({
    message: "Variant fetched",
    data: variant
  });
});

module.exports = {
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  getVariant
};