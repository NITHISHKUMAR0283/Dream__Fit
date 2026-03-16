const express = require("express");
const Router = express.Router();
const {createProduct,getSingleProduct,updateProduct,deleteProduct,getProduct} = require("../controller/productController")


Router.post("/",createProduct);
Router.get("/",getProduct);
Router.delete("/:id",deleteProduct);
Router.put("/:id",updateProduct);
Router.get("/:id",getSingleProduct);

module.exports= Router;