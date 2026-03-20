const express = require("express");
const Router = express.Router();

const {
  getSingleProduct,
  getProduct,
  getVariant
} = require("../controller/productController");

Router.get("/", getProduct);
Router.get("/:id", getSingleProduct);
Router.get("/:id/variant", getVariant);

module.exports = Router;