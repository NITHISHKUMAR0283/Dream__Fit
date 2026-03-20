const express = require("express");
const Router = express.Router();
const adminAuth = require("../middlewares/adminAuth");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant
} = require("../controller/productController");

Router.use(adminAuth);

Router.post("/", createProduct);
Router.put("/:id", updateProduct);
Router.delete("/:id", deleteProduct);

Router.post("/:id/variants", addVariant);
Router.put("/:productId/variants/:variantId", updateVariant);
Router.delete("/:productId/variants/:variantId", deleteVariant);

module.exports = Router;