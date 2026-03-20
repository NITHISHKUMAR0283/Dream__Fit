import React, { useMemo, useState } from "react";
import { addVariant, deleteVariant, updateProduct, updateVariant, uploadImages } from "../api";

const sizeSuggestions = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "500ml", "750ml", "1L"];
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

const emptyVariant = {
  color: DEFAULT_COLOR,
  size: "",
  mrp: "",
  price: "",
  stock: "",
  images: []
};

const isHexColor = (value) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test((value || "").trim());
const normalizeColorCode = (value) => {
  const normalized = (value || "").trim();
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(normalized) ? normalized.toLowerCase() : DEFAULT_COLOR;
};

const getVariantColorModel = (variant) => {
  const currentName = (variant?.color || "").trim();
  const currentCode = normalizeColorCode(variant?.colorCode || variant?.color || DEFAULT_COLOR);
  const matchedByName = STANDARD_COLORS.find((entry) => entry.name.toLowerCase() === currentName.toLowerCase());
  const matchedByCode = STANDARD_COLORS.find((entry) => entry.code === currentCode);
  const matched = matchedByName || matchedByCode;

  if (matched) {
    return {
      selectedColorName: matched.name,
      customColorName: "",
      customColorCode: matched.code
    };
  }

  return {
    selectedColorName: OTHER_COLOR_VALUE,
    customColorName: currentName || "",
    customColorCode: currentCode
  };
};

const getColorPayload = (variant) => {
  if (variant.selectedColorName === OTHER_COLOR_VALUE) {
    return {
      color: (variant.customColorName || "").trim(),
      colorCode: normalizeColorCode(variant.customColorCode)
    };
  }

  const selected = STANDARD_COLORS.find((entry) => entry.name === variant.selectedColorName) || STANDARD_COLORS[0];
  return {
    color: selected.name,
    colorCode: selected.code
  };
};

const getVariantDisplay = (variant) => ({
  color: (variant?.color || "").trim() || DEFAULT_COLOR_NAME,
  colorCode: normalizeColorCode(variant?.colorCode || variant?.color || DEFAULT_COLOR)
});

const toNumberOrZero = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapToPayload = (variant) => ({
  ...getColorPayload(variant),
  size: variant.size.trim(),
  mrp: toNumberOrZero(variant.mrp),
  price: toNumberOrZero(variant.price),
  stock: toNumberOrZero(variant.stock),
  images: (variant.images || []).map((url) => ({ url }))
});

function VariantManager({ product, credentials, onChanged, onBack }) {
  const variants = useMemo(() => product.variants || [], [product.variants]);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?._id || "");
  const [productMeta, setProductMeta] = useState({
    About: product?.About || "",
    description: product?.description || "",
    brand: product?.brand || "",
    category: product?.category || ""
  });
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
  const [editVariant, setEditVariant] = useState(null);
  const [newUploading, setNewUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);

  React.useEffect(() => {
    setProductMeta({
      About: product?.About || "",
      description: product?.description || "",
      brand: product?.brand || "",
      category: product?.category || ""
    });
  }, [product]);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant._id === selectedVariantId) || null,
    [variants, selectedVariantId]
  );

  React.useEffect(() => {
    if (!selectedVariant) {
      setEditVariant(null);
      return;
    }

    setEditVariant({
      _id: selectedVariant._id,
      ...getVariantColorModel(selectedVariant),
      size: selectedVariant.size || "",
      mrp: selectedVariant.mrp?.toString() || "",
      price: selectedVariant.price?.toString() || "",
      stock: selectedVariant.stock?.toString() || "",
      images: (selectedVariant.images || []).map((entry) => entry.url).filter(Boolean)
    });
  }, [selectedVariant]);

  const setNewField = (field, value) => {
    setNewVariant((prev) => ({ ...prev, [field]: value }));
  };

  const setEditField = (field, value) => {
    setEditVariant((prev) => ({ ...(prev || {}), [field]: value }));
  };

  const uploadImagesForForm = async (files, setUploading, setter) => {
    if (!files.length) {
      return;
    }

    try {
      setUploading(true);
      const uploaded = await uploadImages(credentials, files, "products/variants");
      const urls = uploaded.map((entry) => entry.imageUrl);
      setter((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } finally {
      setUploading(false);
    }
  };

  const validateVariant = (variant) => {
    if (!variant.size?.trim()) {
      alert("Color and Size are required");
      return false;
    }

    if (variant.selectedColorName === OTHER_COLOR_VALUE && !(variant.customColorName || "").trim()) {
      alert("Custom color name is required");
      return false;
    }

    if (!variant.mrp || !variant.price) {
      alert("MRP and Offer Price are required");
      return false;
    }
    return true;
  };

  const handleAddVariant = async () => {
    if (!validateVariant(newVariant)) {
      return;
    }

    await addVariant(credentials, product._id, mapToPayload(newVariant));
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

  const handleUpdateVariant = async () => {
    if (!editVariant || !validateVariant(editVariant)) {
      return;
    }

    await updateVariant(credentials, product._id, editVariant._id, mapToPayload(editVariant));
    await onChanged();
  };

  const handleDeleteVariant = async () => {
    if (!editVariant?._id) {
      return;
    }

    const ok = window.confirm("Delete this variant?");
    if (!ok) {
      return;
    }

    await deleteVariant(credentials, product._id, editVariant._id);
    setSelectedVariantId("");
    await onChanged();
  };

  const removeNewImage = (index) => {
    setNewVariant((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const removeEditImage = (index) => {
    setEditVariant((prev) => ({ ...(prev || {}), images: (prev?.images || []).filter((_, i) => i !== index) }));
  };

  const handleUpdateProductMeta = async () => {
    if (!productMeta.About.trim()) {
      alert("Product About is required");
      return;
    }

    await updateProduct(credentials, product._id, {
      ...product,
      About: productMeta.About.trim(),
      description: (productMeta.description || "").trim(),
      brand: (productMeta.brand || "").trim(),
      category: (productMeta.category || "").trim()
    });

    await onChanged();
  };

  return (
    <div className="card">
      <div className="row-actions" style={{ justifyContent: "space-between", marginBottom: "8px" }}>
        <h3 style={{ margin: 0 }}>Manage Variants: {product.About}</h3>
        <button type="button" onClick={onBack}>Back to Products</button>
      </div>

      <div className="variant-card">
        <h4>Product Details (for this product)</h4>
        <div className="grid">
          <textarea
            className="fixed-textbox"
            placeholder="Product About"
            value={productMeta.About}
            onChange={(event) => setProductMeta((prev) => ({ ...prev, About: event.target.value }))}
          />
          <textarea
            className="fixed-textbox"
            placeholder="Detailed Description"
            value={productMeta.description}
            onChange={(event) => setProductMeta((prev) => ({ ...prev, description: event.target.value }))}
          />
          <input
            placeholder="Brand"
            value={productMeta.brand}
            onChange={(event) => setProductMeta((prev) => ({ ...prev, brand: event.target.value }))}
          />
          <input
            placeholder="Category"
            value={productMeta.category}
            onChange={(event) => setProductMeta((prev) => ({ ...prev, category: event.target.value }))}
          />
          <button type="button" onClick={handleUpdateProductMeta}>Update Product Details</button>
        </div>
      </div>

      <div className="variant-card">
        <div className="content-label">All Variants (Color + Size)</div>
        <div className="variant-selector-grid">
          {variants.map((variant) => (
            <button
              type="button"
              key={variant._id}
              className={`variant-select-card ${selectedVariantId === variant._id ? "active" : ""}`}
              onClick={() => setSelectedVariantId(variant._id)}
            >
              <span className="color-preview" style={{ backgroundColor: getVariantDisplay(variant).colorCode }}></span>
              <span>{getVariantDisplay(variant).color}</span>
              <span>•</span>
              <span>{variant.size}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="variant-card new-variant">
        <h4>Create Variant</h4>
        <p className="muted">Select a standard color name or choose Other Color and provide name + code.</p>
        <div className="variant-grid">
          <div>
            <label className="field-label">Color</label>
            <div className="color-picker-row">
              <select value={newVariant.selectedColorName} onChange={(event) => setNewField("selectedColorName", event.target.value)}>
                {STANDARD_COLORS.map((color) => (
                  <option key={color.name} value={color.name}>{color.name}</option>
                ))}
                <option value={OTHER_COLOR_VALUE}>Other Color</option>
              </select>
              <span className="color-preview" style={{ backgroundColor: getColorPayload(newVariant).colorCode }}></span>
            </div>
            {newVariant.selectedColorName === OTHER_COLOR_VALUE ? (
              <div className="grid" style={{ marginTop: "8px" }}>
                <input
                  placeholder="Custom color name"
                  value={newVariant.customColorName}
                  onChange={(event) => setNewField("customColorName", event.target.value)}
                />
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={normalizeColorCode(newVariant.customColorCode)}
                    onChange={(event) => setNewField("customColorCode", event.target.value)}
                  />
                  <input
                    value={newVariant.customColorCode}
                    onChange={(event) => setNewField("customColorCode", event.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <label className="field-label">Size</label>
            <input list="new-variant-sizes" value={newVariant.size} onChange={(event) => setNewField("size", event.target.value)} />
            <datalist id="new-variant-sizes">
              {sizeSuggestions.map((size) => <option key={size} value={size} />)}
            </datalist>
          </div>
          <div>
            <label className="field-label">MRP</label>
            <input type="number" value={newVariant.mrp} onChange={(event) => setNewField("mrp", event.target.value)} />
          </div>
          <div>
            <label className="field-label">Offer Price</label>
            <input type="number" value={newVariant.price} onChange={(event) => setNewField("price", event.target.value)} />
          </div>
          <div>
            <label className="field-label">Stock</label>
            <input type="number" value={newVariant.stock} onChange={(event) => setNewField("stock", event.target.value)} />
          </div>
        </div>
        <div className="variant-upload-row">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={async (event) => {
              const files = Array.from(event.target.files || []);
              await uploadImagesForForm(files, setNewUploading, setNewVariant);
              event.target.value = "";
            }}
          />
          <button onClick={handleAddVariant}>Create Variant</button>
          <span className="muted">{newUploading ? "Uploading..." : "Upload images"}</span>
        </div>
        <div className="image-grid">
          {newVariant.images.map((url, index) => (
            <div key={`${url}-${index}`} className="image-card">
              <img src={url} alt={`New Variant ${index + 1}`} />
              <button className="danger small" onClick={() => removeNewImage(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {editVariant ? (
        <div className="variant-card">
          <h4>Update / Delete Selected Variant</h4>
          <div className="variant-grid">
            <div>
              <label className="field-label">Color</label>
              <div className="color-picker-row">
                <select value={editVariant.selectedColorName} onChange={(event) => setEditField("selectedColorName", event.target.value)}>
                  {STANDARD_COLORS.map((color) => (
                    <option key={color.name} value={color.name}>{color.name}</option>
                  ))}
                  <option value={OTHER_COLOR_VALUE}>Other Color</option>
                </select>
                <span className="color-preview" style={{ backgroundColor: getColorPayload(editVariant).colorCode }}></span>
              </div>
              {editVariant.selectedColorName === OTHER_COLOR_VALUE ? (
                <div className="grid" style={{ marginTop: "8px" }}>
                  <input
                    placeholder="Custom color name"
                    value={editVariant.customColorName}
                    onChange={(event) => setEditField("customColorName", event.target.value)}
                  />
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={normalizeColorCode(editVariant.customColorCode)}
                      onChange={(event) => setEditField("customColorCode", event.target.value)}
                    />
                    <input
                      value={editVariant.customColorCode}
                      onChange={(event) => setEditField("customColorCode", event.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <div>
              <label className="field-label">Size</label>
              <input list="edit-variant-sizes" value={editVariant.size} onChange={(event) => setEditField("size", event.target.value)} />
              <datalist id="edit-variant-sizes">
                {sizeSuggestions.map((size) => <option key={size} value={size} />)}
              </datalist>
            </div>
            <div>
              <label className="field-label">MRP</label>
              <input type="number" value={editVariant.mrp} onChange={(event) => setEditField("mrp", event.target.value)} />
            </div>
            <div>
              <label className="field-label">Offer Price</label>
              <input type="number" value={editVariant.price} onChange={(event) => setEditField("price", event.target.value)} />
            </div>
            <div>
              <label className="field-label">Stock</label>
              <input type="number" value={editVariant.stock} onChange={(event) => setEditField("stock", event.target.value)} />
            </div>
          </div>

          <div className="variant-upload-row">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={async (event) => {
                const files = Array.from(event.target.files || []);
                await uploadImagesForForm(files, setEditUploading, setEditVariant);
                event.target.value = "";
              }}
            />
            <button onClick={handleUpdateVariant}>Update Variant</button>
            <button className="danger" onClick={handleDeleteVariant}>Delete Variant</button>
            <span className="muted">{editUploading ? "Uploading..." : "Upload images"}</span>
          </div>

          <div className="image-grid">
            {(editVariant.images || []).map((url, index) => (
              <div key={`${url}-${index}`} className="image-card">
                <img src={url} alt={`Selected Variant ${index + 1}`} />
                <button className="danger small" onClick={() => removeEditImage(index)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default VariantManager;
