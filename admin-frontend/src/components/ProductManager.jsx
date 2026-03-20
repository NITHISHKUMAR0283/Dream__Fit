import React, { useMemo, useState } from "react";
import { createProduct, deleteProduct, updateProduct, uploadImages } from "../api";

const NO_IMAGE_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='12'>No Image</text></svg>";

const STANDARD_COLORS = [
  { name: "Black", code: "#000000" },
  { name: "White", code: "#ffffff" },
  { name: "Red", code: "#ef4444" },
  { name: "Orange", code: "#f97316" },
  { name: "Amber", code: "#f59e0b" },
  { name: "Green", code: "#22c55e" },
  { name: "Emerald", code: "#10b981" },
  { name: "Cyan", code: "#06b6d4" },
  { name: "Blue", code: "#3b82f6" },
  { name: "Indigo", code: "#6366f1" },
  { name: "Purple", code: "#a855f7" },
  { name: "Pink", code: "#ec4899" }
];
const OTHER_COLOR_VALUE = "__OTHER_COLOR__";
const DEFAULT_COLOR = STANDARD_COLORS[0].code;
const DEFAULT_COLOR_NAME = STANDARD_COLORS[0].name;

const normalizeColorCode = (value) => {
  const normalized = (value || "").trim();
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(normalized) ? normalized.toLowerCase() : DEFAULT_COLOR;
};
const toNumberOrZero = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function ProductManager({ products, credentials, onChanged, mode, onManageVariants }) {
  const [newAbout, setNewAbout] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrimaryImageUrl, setNewPrimaryImageUrl] = useState("");
  const [newPrimaryUploading, setNewPrimaryUploading] = useState(false);
  const [newVariant, setNewVariant] = useState({
    selectedColorName: DEFAULT_COLOR_NAME,
    customColorName: "",
    customColorCode: DEFAULT_COLOR,
    size: "",
    mrp: "",
    price: "",
    stock: "",
    images: []
  });
  const [newVariantUploading, setNewVariantUploading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editingAbout, setEditingAbout] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingBrand, setEditingBrand] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const getCreateVariantColorPayload = () => {
    if (newVariant.selectedColorName === OTHER_COLOR_VALUE) {
      return {
        color: (newVariant.customColorName || "").trim(),
        colorCode: normalizeColorCode(newVariant.customColorCode)
      };
    }

    const selected = STANDARD_COLORS.find((color) => color.name === newVariant.selectedColorName) || STANDARD_COLORS[0];
    return {
      color: selected.name,
      colorCode: selected.code
    };
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditingAbout(product.About || "");
    setEditingDescription(product.description || "");
    setEditingBrand(product.brand || "");
    setEditingCategory(product.category || "");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingAbout("");
    setEditingDescription("");
    setEditingBrand("");
    setEditingCategory("");
  };

  const handlePrimaryImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
      setNewPrimaryUploading(true);
      const uploaded = await uploadImages(credentials, [files[0]], "products/primary");
      const imageUrl = uploaded?.[0]?.imageUrl || "";
      if (!imageUrl) {
        throw new Error("Failed to upload primary image");
      }
      setNewPrimaryImageUrl(imageUrl);
    } catch (error) {
      alert(error.message || "Failed to upload primary image");
    } finally {
      setNewPrimaryUploading(false);
      event.target.value = "";
    }
  };

  const handleCreate = async () => {
    const about = newAbout.trim();
    if (!about) {
      alert("Product About is required");
      return;
    }

    if (!newPrimaryImageUrl) {
      alert("Primary image is required");
      return;
    }

    if (!newVariant.size.trim()) {
      alert("At least one variant size is required");
      return;
    }

    if (newVariant.selectedColorName === OTHER_COLOR_VALUE && !(newVariant.customColorName || "").trim()) {
      alert("Custom color name is required");
      return;
    }

    if (!newVariant.mrp || !newVariant.price) {
      alert("MRP and Offer Price are required for the first variant");
      return;
    }

    if (!(newVariant.images || []).length) {
      alert("Upload at least one image for the first variant");
      return;
    }

    const colorPayload = getCreateVariantColorPayload();

    await createProduct(credentials, {
      About: about,
      description: newDescription.trim(),
      brand: newBrand.trim(),
      category: newCategory.trim(),
      primaryImage: {
        url: newPrimaryImageUrl
      },
      variants: [
        {
          color: colorPayload.color,
          colorCode: colorPayload.colorCode,
          size: newVariant.size.trim(),
          mrp: toNumberOrZero(newVariant.mrp),
          price: toNumberOrZero(newVariant.price),
          stock: toNumberOrZero(newVariant.stock),
          images: (newVariant.images || []).map((url) => ({ url }))
        }
      ]
    });
    setNewAbout("");
    setNewDescription("");
    setNewBrand("");
    setNewCategory("");
    setNewPrimaryImageUrl("");
    setNewVariant({
      selectedColorName: DEFAULT_COLOR_NAME,
      customColorName: "",
      customColorCode: DEFAULT_COLOR,
      size: "",
      mrp: "",
      price: "",
      stock: "",
      images: []
    });
    await onChanged();
  };

  const handleUploadNewVariantImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
      setNewVariantUploading(true);
      const uploaded = await uploadImages(credentials, files, "products/variants");
      const urls = uploaded.map((entry) => entry.imageUrl);
      setNewVariant((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (error) {
      alert(error.message || "Failed to upload variant images");
    } finally {
      setNewVariantUploading(false);
      event.target.value = "";
    }
  };

  const removeNewVariantImage = (index) => {
    setNewVariant((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index)
    }));
  };

  const handleUpdate = async (productId) => {
    const about = editingAbout.trim();
    if (!about) {
      alert("Product About is required");
      return;
    }

    const existingProduct = products.find((product) => product._id === productId);
    const payload = {
      ...(existingProduct || {}),
      About: about,
      description: editingDescription.trim(),
      brand: editingBrand.trim(),
      category: editingCategory.trim()
    };

    await updateProduct(credentials, productId, payload);
    cancelEdit();
    await onChanged();
  };

  const handleDelete = async (productId) => {
    const ok = window.confirm("Delete this product and all its variants?");
    if (!ok) {
      return;
    }

    await deleteProduct(credentials, productId);
    if (selectedProductId === productId) {
      setSelectedProductId("");
    }
    await onChanged();
  };

  const getVariantImage = (product) =>
    product?.primaryImage?.url || product?.variants?.[0]?.images?.[0]?.url || NO_IMAGE_DATA_URI;

  return (
    <div className="space-y-6">
      {mode === "create" ? (
      <div className="card">
        <h2>Create Product</h2>
        <p className="muted">Step 1: Enter product details and primary image. Step 2: Add first variant details.</p>
        <div className="create-form-grid">
          <div className="grid">
            <textarea
              className="fixed-textbox"
              placeholder="Product About"
              value={newAbout}
              onChange={(event) => setNewAbout(event.target.value)}
            />
            <textarea
              className="fixed-textbox"
              placeholder="Detailed Description"
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
            />
            <input
              placeholder="Brand"
              value={newBrand}
              onChange={(event) => setNewBrand(event.target.value)}
            />
            <input
              placeholder="Category"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            />
          </div>
          <div className="primary-image-box">
            <label className="field-label">Primary Image</label>
            <input type="file" accept="image/*" onChange={handlePrimaryImageUpload} />
            <div className="muted">{newPrimaryUploading ? "Uploading..." : "Upload one image"}</div>
            {newPrimaryImageUrl ? (
              <img className="primary-preview" src={newPrimaryImageUrl} alt="Primary" />
            ) : null}
          </div>
        </div>

        <div className="variant-card new-variant">
          <h4>First Variant (Required)</h4>
          <div className="variant-grid">
            <div>
              <label className="field-label">Color</label>
              <div className="color-picker-row">
                <select
                  value={newVariant.selectedColorName}
                  onChange={(event) => setNewVariant((prev) => ({ ...prev, selectedColorName: event.target.value }))}
                >
                  {STANDARD_COLORS.map((color) => (
                    <option key={color.name} value={color.name}>{color.name}</option>
                  ))}
                  <option value={OTHER_COLOR_VALUE}>Other Color</option>
                </select>
                <span className="color-preview" style={{ backgroundColor: normalizeColorCode(getCreateVariantColorPayload().colorCode) }}></span>
              </div>
              {newVariant.selectedColorName === OTHER_COLOR_VALUE ? (
                <div className="grid" style={{ marginTop: "8px" }}>
                  <input
                    placeholder="Custom color name"
                    value={newVariant.customColorName}
                    onChange={(event) => setNewVariant((prev) => ({ ...prev, customColorName: event.target.value }))}
                  />
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={normalizeColorCode(newVariant.customColorCode)}
                      onChange={(event) => setNewVariant((prev) => ({ ...prev, customColorCode: event.target.value }))}
                    />
                    <input
                      value={newVariant.customColorCode}
                      onChange={(event) => setNewVariant((prev) => ({ ...prev, customColorCode: event.target.value }))}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <div>
              <label className="field-label">Size</label>
              <input value={newVariant.size} onChange={(event) => setNewVariant((prev) => ({ ...prev, size: event.target.value }))} placeholder="M / 42 / 1L" />
            </div>
            <div>
              <label className="field-label">MRP</label>
              <input type="number" value={newVariant.mrp} onChange={(event) => setNewVariant((prev) => ({ ...prev, mrp: event.target.value }))} placeholder="Enter MRP" />
            </div>
            <div>
              <label className="field-label">Offer Price</label>
              <input type="number" value={newVariant.price} onChange={(event) => setNewVariant((prev) => ({ ...prev, price: event.target.value }))} placeholder="Enter offer price" />
            </div>
            <div>
              <label className="field-label">Stock</label>
              <input type="number" value={newVariant.stock} onChange={(event) => setNewVariant((prev) => ({ ...prev, stock: event.target.value }))} placeholder="Enter stock" />
            </div>
          </div>

          <div className="variant-upload-row">
            <input type="file" multiple accept="image/*" onChange={handleUploadNewVariantImages} />
            <span className="muted">{newVariantUploading ? "Uploading..." : "Upload images for first variant"}</span>
          </div>

          <div className="image-grid">
            {newVariant.images.map((url, index) => (
              <div key={`${url}-${index}`} className="image-card">
                <img src={url} alt={`First Variant ${index + 1}`} />
                <button className="danger small" onClick={() => removeNewVariantImage(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="create-row">
          <button onClick={handleCreate}>Create</button>
        </div>
      </div>
      ) : null}

      {mode !== "create" ? (
      <div className="table-card">
        <table className="admin-table fixed">
          <thead>
            <tr>
              <th style={{ width: "58%" }}>Product</th>
              <th style={{ width: "12%" }}>Variants</th>
              <th style={{ width: "30%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  {mode === "update" && editingId === product._id ? (
                    <div className="edit-inline">
                      <textarea
                        className="fixed-textbox"
                        value={editingAbout}
                        onChange={(event) => setEditingAbout(event.target.value)}
                      />
                      <textarea
                        className="fixed-textbox"
                        placeholder="Detailed Description"
                        value={editingDescription}
                        onChange={(event) => setEditingDescription(event.target.value)}
                      />
                      <input
                        placeholder="Brand"
                        value={editingBrand}
                        onChange={(event) => setEditingBrand(event.target.value)}
                      />
                      <input
                        placeholder="Category"
                        value={editingCategory}
                        onChange={(event) => setEditingCategory(event.target.value)}
                      />
                      <div className="row-actions">
                        <button onClick={() => handleUpdate(product._id)}>Save</button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="product-cell">
                      <img src={getVariantImage(product)} alt="Product" />
                      <div className="text-wrap">
                        <div className="sub">Brand: {product.brand || "-"}</div>
                        <div className="sub">Category: {product.category || "-"}</div>
                        <div className="content-label">About</div>
                        <div className="content-box">{product.About || "-"}</div>
                        <div className="content-label">Description</div>
                        <div className="content-box">{product.description || "-"}</div>
                        <div className="sub">ID: {product._id}</div>
                      </div>
                    </div>
                  )}
                </td>
                <td>{(product.variants || []).length}</td>
                <td>
                  <div className="row-actions wrap">
                    {mode === "variants" ? <button onClick={() => onManageVariants(product._id)}>Manage Variants</button> : null}
                    {mode === "update" ? <button onClick={() => startEdit(product)}>Edit</button> : null}
                    {mode === "delete" ? <button className="danger" onClick={() => handleDelete(product._id)}>Delete</button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : null}

    </div>
  );
}

export default ProductManager;
