import React, { useMemo, useState } from "react";
import { addVariant, deleteVariant, updateProduct, updateVariant, uploadImages } from "../api";
import { fetchPropertyCounts } from '../../api';

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
  sizes: [],
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
  sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
  mrp: toNumberOrZero(variant.mrp),
  price: toNumberOrZero(variant.price),
  stock: toNumberOrZero(variant.stock),
  images: (variant.images || []).map((url) => ({ url }))
});

function VariantManager({ product, credentials, onChanged, onBack }) {
  const variants = useMemo(() => product.variants || [], [product.variants]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [editVariant, setEditVariant] = useState(null);
  const [newSize, setNewSize] = useState("");
  const [editUploading, setEditUploading] = useState(false);

  React.useEffect(() => {
    if (!selectedVariantId) {
      setEditVariant(null);
      return;
    }

    const selectedVariant = variants.find((variant) => variant._id === selectedVariantId);
    if (!selectedVariant) {
      setEditVariant(null);
      return;
    }

    setEditVariant({
      _id: selectedVariant._id,
      ...getVariantColorModel(selectedVariant),
      sizes: Array.isArray(selectedVariant.sizes) ? selectedVariant.sizes : [],
      mrp: selectedVariant.mrp?.toString() || "",
      price: selectedVariant.price?.toString() || "",
      stock: selectedVariant.stock?.toString() || "",
      images: (selectedVariant.images || []).map((entry) => entry.url).filter(Boolean)
    });
  }, [selectedVariantId, variants]);

  const setEditField = (field, value) => {
    setEditVariant((prev) => ({ ...(prev || {}), [field]: value }));
  };

  // Add size to sizes array
  const handleAddSize = () => {
    const size = newSize.trim();
    if (!size) return;
    setEditVariant((prev) => ({
      ...prev,
      sizes: Array.from(new Set([...(prev.sizes || []), size]))
    }));
    setNewSize("");
  };

  // Remove size from sizes array
  const handleRemoveSize = (sizeToRemove) => {
    setEditVariant((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).filter((s) => s !== sizeToRemove)
    }));
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
    if (!variant.sizes || !variant.sizes.length) {
      alert("At least one size is required");
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

  const handleUpdateVariant = async () => {
    if (!editVariant || !validateVariant(editVariant)) {
      return;
    }

    // Save sizes array instead of single size
    await updateVariant(credentials, product._id, editVariant._id, {
      ...mapToPayload(editVariant),
      sizes: editVariant.sizes
    });
    setIsEditingVariant(false);
    setSelectedVariantId("");
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
    setIsEditingVariant(false);
    await onChanged();
  };

  const removeEditImage = (index) => {
    setEditVariant((prev) => ({ ...(prev || {}), images: (prev?.images || []).filter((_, i) => i !== index) }));
  };

  const [brandOptions, setBrandOptions] = React.useState([]);
  const [materialOptions, setMaterialOptions] = React.useState([]);
  const [categoryOptions, setCategoryOptions] = React.useState([]);
  const [colorOptions, setColorOptions] = React.useState([]);

  React.useEffect(() => {
    async function loadPropertyCounts() {
      setBrandOptions(Object.keys(await fetchPropertyCounts('brand')));
      setMaterialOptions(Object.keys(await fetchPropertyCounts('material')));
      setCategoryOptions(Object.keys(await fetchPropertyCounts('category')));
      setColorOptions(Object.keys(await fetchPropertyCounts('color')));
    }
    loadPropertyCounts();
  }, []);

  return (
    <div className="card">
      {!isEditingVariant ? (
        // THREE-TIER: PRODUCT PREVIEW + VARIANT LIST
        <>
          <div className="row-actions" style={{ justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>Manage Variants: {product.About}</h3>
          </div>

          {/* TIER 1: PRODUCT PREVIEW CARD */}
          <div className="variant-card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              {product.images && product.images.length > 0 && (
                <div style={{ flex: "0 0 150px" }}>
                  <img
                    src={product.images[0]}
                    alt={product.About}
                    style={{ width: "100%", height: "auto", aspectRatio: "1/1", objectFit: "cover", borderRadius: "8px" }}
                  />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ marginTop: 0, marginBottom: "8px" }}>{product.About}</h4>
                <p style={{ color: "#6b7280", lineHeight: 1.5, marginBottom: 0 }}>{product.brand || "No brand"}</p>
              </div>
            </div>
          </div>

          {/* TIER 2: VARIANT LIST GRID */}
          <div className="variant-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0 }}>Available Variants</h3>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>Click a variant to edit or delete</span>
            </div>

            {variants.length === 0 ? (
              <p style={{ color: "#9ca3af", fontStyle: "italic" }}>No variants yet. Add one in a separate section.</p>
            ) : (
              <div className="variants-grid">
                {variants.map((variant) => (
                  <button
                    type="button"
                    key={variant._id}
                    className="variant-card-selectable"
                    onClick={() => {
                      setSelectedVariantId(variant._id);
                      setIsEditingVariant(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Variant Image */}
                    {variant.images && variant.images.length > 0 && (
                      <div style={{ marginBottom: "12px" }}>
                        <img
                          src={variant.images[0]}
                          alt={`${getVariantDisplay(variant).color} ${variant.size}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            aspectRatio: "1/1",
                            objectFit: "cover",
                            borderRadius: "6px",
                            backgroundColor: "#f9fafb"
                          }}
                        />
                      </div>
                    )}

                    {/* Variant Details */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                      <span
                        className="color-preview-large"
                        style={{ backgroundColor: getVariantDisplay(variant).colorCode, flexShrink: 0 }}
                      ></span>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <strong style={{ display: "block", fontSize: "14px" }}>{getVariantDisplay(variant).color}</strong>
                        <span style={{ fontSize: "13px", color: "#6b7280" }}>• {Array.isArray(variant.sizes) ? variant.sizes.join(', ') : ''}</span>
                      </div>
                    </div>

                    {/* Variant Pricing & Stock */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #f3f4f6", fontSize: "13px" }}>
                      <span style={{ fontWeight: 600 }}>₹{variant.price}</span>
                      <span style={{ color: "#6b7280" }}>Stock: {variant.stock}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        // TIER 3: EDIT VARIANT FORM
        <>
          <div className="row-actions" style={{ justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>
              Edit Variant: {editVariant ? `${editVariant.selectedColorName === OTHER_COLOR_VALUE ? editVariant.customColorName : editVariant.selectedColorName} • ${(editVariant.sizes || []).join(', ')}` : ""}
            </h3>
          </div>

          {editVariant ? (
            <div className="variant-card">
              <h4>Update / Delete This Variant</h4>
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
                  <label className="field-label">Sizes</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      list="edit-variant-sizes"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="Add size"
                    />
                    <button type="button" onClick={handleAddSize}>Add</button>
                    <datalist id="edit-variant-sizes">
                      {sizeSuggestions.map((size) => <option key={size} value={size} />)}
                    </datalist>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(editVariant.sizes || []).map((size) => (
                      <span key={size} style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px', marginRight: 4, display: 'flex', alignItems: 'center' }}>
                        {size}
                        <button type="button" style={{ marginLeft: 4, color: 'red', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleRemoveSize(size)}>×</button>
                      </span>
                    ))}
                  </div>
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
        </>
      )}
    </div>
  );
}

export default VariantManager;
