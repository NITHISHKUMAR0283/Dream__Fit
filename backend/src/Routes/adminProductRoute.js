const express = require("express");
const Router = express.Router();
const adminAuth = require("../middlewares/adminAuth");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  cleanupUnusedProperties
} = require("../controller/productController");
const { getPriceRange } = require("../services/propertyCleanup");

Router.use(adminAuth);

Router.post("/", createProduct);
Router.put("/:id", updateProduct);
Router.delete("/:id", deleteProduct);

Router.post("/:id/variants", addVariant);
Router.put("/:productId/variants/:variantId", updateVariant);
Router.delete("/:productId/variants/:variantId", deleteVariant);

Router.post("/cleanup-properties", async (req, res) => {
  try {
    await cleanupUnusedProperties();
    res.status(200).json({ message: "Unused properties cleaned up." });
  } catch (err) {
    res.status(500).json({ message: "Cleanup failed.", error: err.message });
  }
});

Router.get("/price-range", async (req, res) => {
  try {
    const range = await getPriceRange();
    res.status(200).json(range);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch price range", error: err.message });
  }
});

module.exports = Router;