const cloudinary = require("../config/cloudinary");

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });

const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const folder = req.body.folder || "products";
    const result = await uploadBuffer(req.file.buffer, folder);

    return res.status(200).json({
      message: "Image uploaded successfully",
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    return next(error);
  }
};

const uploadMultipleImagesController = async (req, res, next) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const folder = req.body.folder || "products";
    const results = await Promise.all(files.map((file) => uploadBuffer(file.buffer, folder)));

    return res.status(200).json({
      message: "Images uploaded successfully",
      data: {
        images: results.map((result) => ({
          imageUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        })),
        count: results.length
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImagesController
};
