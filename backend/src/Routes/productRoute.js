const express = require("express");
const Router = express.Router();

const {
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  getVariant
} = require("../controller/productController");

Router.post("/", createProduct);
Router.get("/", getProduct);
Router.get("/:id", getSingleProduct);
Router.put("/:id", updateProduct);
Router.delete("/:id", deleteProduct);

Router.post("/:id/variants", addVariant);
Router.put("/:productId/variants/:variantId", updateVariant);
Router.delete("/:productId/variants/:variantId", deleteVariant);
Router.get("/:id/variant", getVariant);

module.exports = Router;