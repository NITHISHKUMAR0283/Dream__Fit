const Product = require("../model/productModel");
const asyncHandler = require("../middlewares/asyncHandler")
const {
  getPublicIdsFromImageEntries,
  deleteCloudinaryAssets
} = require("../services/cloudinaryCleanup");
const {
  incrementPropertyCount,
  decrementPropertyCount,
  updatePriceRangeOnCreateOrUpdate,
  updatePriceRangeOnDelete
} = require("../services/propertyCleanup");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


const createProduct = asyncHandler(async (req,res)=>{
    const payload = { ...req.body };
    if (payload.variants && Array.isArray(payload.variants)) {
      payload.variants = payload.variants.map((variant) => {
        const cloned = { ...variant };
        delete cloned.sku;
        // Convert sizes array to single size string if needed
        if (Array.isArray(cloned.sizes) && cloned.sizes.length > 0) {
          cloned.size = cloned.sizes[0];
        }
        delete cloned.sizes;
        return cloned;
      });
    }

    // Track property counts
    if (payload.brand) await incrementPropertyCount("brand", payload.brand);
    if (payload.material) await incrementPropertyCount("material", payload.material);
    if (payload.category) await incrementPropertyCount("category", payload.category);
    if (payload.variants && Array.isArray(payload.variants)) {
      payload.variants.forEach(v => {
        if (v.color) incrementPropertyCount("color", v.color);
      });
    }

    const product = await Product.create(payload);
    await updatePriceRangeOnCreateOrUpdate(product);
    res.status(201).json({
        message:"product created successfully",
        data : product
    })    
});

const updateProduct = asyncHandler(async (req,res)=>{
    const payload = { ...req.body };
    if (payload.variants && Array.isArray(payload.variants)) {
      payload.variants = payload.variants.map((variant) => {
        const cloned = { ...variant };
        delete cloned.sku;
        // Convert sizes array to single size string if needed
        if (Array.isArray(cloned.sizes) && cloned.sizes.length > 0) {
          cloned.size = cloned.sizes[0];
        }
        delete cloned.sizes;
        return cloned;
      });
    }

    // Track property counts
    if (payload.brand) await incrementPropertyCount("brand", payload.brand);
    if (payload.material) await incrementPropertyCount("material", payload.material);
    if (payload.category) await incrementPropertyCount("category", payload.category);
    if (payload.variants && Array.isArray(payload.variants)) {
      payload.variants.forEach(v => {
        if (v.color) incrementPropertyCount("color", v.color);
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id,payload,{new:true,runValidators:true});
    await updatePriceRangeOnCreateOrUpdate(product);
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Decrement property counts
    if (product.brand) await decrementPropertyCount("brand", product.brand);
    if (product.material) await decrementPropertyCount("material", product.material);
    if (product.category) await decrementPropertyCount("category", product.category);
    (product.variants || []).forEach(v => {
      if (v.color) decrementPropertyCount("color", v.color);
    });

    const publicIds = (product.variants || [])
      .flatMap((variant) => getPublicIdsFromImageEntries(variant.images || []));

    await Product.findByIdAndDelete(req.params.id);
    await deleteCloudinaryAssets(publicIds);
    await updatePriceRangeOnDelete();
    res.status(200).json({
        message:"product deleted successfully",
        data:product
    }
    )
});
const getProduct = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
  const sort = req.query.sort;
  const search = String(req.query.search || "").trim();
  const categoriesParam = String(req.query.categories || req.query.category || "").trim();
  const skip = (page - 1) * limit;

  const query = {};
  if (categoriesParam) {
    const categories = categoriesParam
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (categories.length) {
      query.category = {
        $in: categories.map((category) => new RegExp(`^${escapeRegex(category)}$`, "i"))
      };
    }
  }

  if (search) {
    // Fuzzy regex: allow partial, out-of-order, and character match
    // Example: "milton" matches "Milton", "Milt0n", "MILT ON", etc.
    const fuzzy = search.split("").map(c => escapeRegex(c)).join(".*");
    const fuzzyRegex = new RegExp(fuzzy, "i");
    query.$or = [
      { About: fuzzyRegex },
      { description: fuzzyRegex },
      { brand: fuzzyRegex },
      { category: fuzzyRegex },
      { material: fuzzyRegex },
      { "variants.color": fuzzyRegex },
      { "variants.size": fuzzyRegex }
    ];
  }

  let sortOption = {};
  if (sort === "latest") {
    sortOption = { _id: -1 };
  } else if (sort === "oldest") {
    sortOption = { _id: 1 };
  }

  const [products, totalProducts] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limit),
    Product.countDocuments(query)
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

  const variantPayload = { ...req.body };
  delete variantPayload.sku;
  product.variants.push(variantPayload);

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
  variant.sku = undefined;

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

  const publicIds = getPublicIdsFromImageEntries(variant.images || []);
  variant.deleteOne();

  await product.save();
  await deleteCloudinaryAssets(publicIds);

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
  getVariant,
  cleanupUnusedProperties: require("../services/propertyCleanup").cleanupUnusedProperties
};