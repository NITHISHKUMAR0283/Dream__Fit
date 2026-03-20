const cloudinary = require("../config/cloudinary");

const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const normalized = decodeURIComponent(url);
    const uploadMarker = "/upload/";
    const uploadIndex = normalized.indexOf(uploadMarker);
    if (uploadIndex === -1) {
      return null;
    }

    let pathPart = normalized.slice(uploadIndex + uploadMarker.length);
    pathPart = pathPart.replace(/^v\d+\//, "");

    const extensionIndex = pathPart.lastIndexOf(".");
    if (extensionIndex === -1) {
      return pathPart;
    }

    return pathPart.slice(0, extensionIndex);
  } catch {
    return null;
  }
};

const getPublicIdsFromImageEntries = (images = []) => {
  return images
    .map((image) => {
      if (!image) {
        return null;
      }

      if (typeof image === "string") {
        return extractPublicIdFromUrl(image);
      }

      if (image.publicId) {
        return image.publicId;
      }

      return extractPublicIdFromUrl(image.url);
    })
    .filter(Boolean);
};

const deleteCloudinaryAssets = async (publicIds = []) => {
  const uniquePublicIds = Array.from(new Set(publicIds.filter(Boolean)));
  if (!uniquePublicIds.length) {
    return;
  }

  try {
    if (typeof cloudinary.assertCloudinaryConfig === "function") {
      cloudinary.assertCloudinaryConfig();
    }

    await cloudinary.api.delete_resources(uniquePublicIds);
  } catch (error) {
    console.log("Cloudinary cleanup warning:", error.message);
  }
};

module.exports = {
  extractPublicIdFromUrl,
  getPublicIdsFromImageEntries,
  deleteCloudinaryAssets
};
