const express = require("express");
const router = express.Router();
const adminAuth = require("../middlewares/adminAuth");
const { uploadSingle, uploadMultiple } = require("../middlewares/upload");
const {
  uploadSingleImage,
  uploadMultipleImagesController
} = require("../controller/uploadController");

router.use(adminAuth);
router.post("/image", uploadSingle, uploadSingleImage);
router.post("/images", uploadMultiple, uploadMultipleImagesController);

module.exports = router;
