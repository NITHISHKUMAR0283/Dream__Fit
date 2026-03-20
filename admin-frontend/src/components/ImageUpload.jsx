import React, { useRef, useState } from "react";
import { uploadImages } from "../api";

function ImageUpload({ credentials, images, onImagesChange, maxImages = 5 }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = async (event) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) {
      return;
    }

    if (images.length + selected.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const invalid = selected.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      setError("Only image files are allowed");
      return;
    }

    const tooLarge = selected.find((file) => file.size > 5 * 1024 * 1024);
    if (tooLarge) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setError("");
      const uploaded = await uploadImages(credentials, selected, "products");
      const newUrls = uploaded.map((entry) => entry.imageUrl);
      onImagesChange([...images, ...newUrls]);
    } catch (uploadError) {
      setError(uploadError.message || "Failed to upload image(s)");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index) => {
    onImagesChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="upload-wrap">
      <label className="field-label">Product Images ({images.length}/{maxImages})</label>

      {images.length < maxImages && (
        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload from device"}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />

      {error ? <div className="error-text">{error}</div> : null}

      <div className="image-grid">
        {images.map((imageUrl, index) => (
          <div key={`${imageUrl}-${index}`} className="image-card">
            <img src={imageUrl} alt={`Product ${index + 1}`} />
            <button
              type="button"
              className="danger small"
              onClick={() => removeImage(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageUpload;
