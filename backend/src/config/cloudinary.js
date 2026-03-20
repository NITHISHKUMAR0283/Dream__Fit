const { v2: cloudinary } = require("cloudinary");

const cloudinaryUrl = (process.env.CLOUDINARY_URL || "").trim();
const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim().toLowerCase();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

if (cloudinaryUrl) {
  cloudinary.config({
    cloudinary_url: cloudinaryUrl
  });
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

const assertCloudinaryConfig = () => {
  if (cloudinaryUrl) {
    if (cloudinaryUrl.includes("<") || cloudinaryUrl.includes(">")) {
      const error = new Error("CLOUDINARY_URL contains placeholders. Replace <your_api_key> and <your_api_secret> with real values.");
      error.status = 500;
      throw error;
    }
    return;
  }

  if (!cloudName || !apiKey || !apiSecret) {
    const error = new Error("Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend .env");
    error.status = 500;
    throw error;
  }
};

cloudinary.assertCloudinaryConfig = assertCloudinaryConfig;

module.exports = cloudinary;
