import React, { useEffect, useMemo, useRef, useState } from "react";
import { createProduct, deleteProduct, updateProduct, uploadImages, addVariant, updateVariant, deleteVariant } from "../api";
import { fetchPropertyCounts } from "../api";

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

const SIZE_SUGGESTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43"];
const OTHER_COLOR_VALUE = "__OTHER_COLOR__";
const CREATE_NEW_CATEGORY_VALUE = "__CREATE_NEW_CATEGORY__";
const CREATE_NEW_BRAND_VALUE = "__CREATE_NEW_BRAND__";
const CREATE_NEW_MATERIAL_VALUE = "__CREATE_NEW_MATERIAL__";
const CREATE_NEW_SIZE_VALUE = "__CREATE_NEW_SIZE__";
const DEFAULT_COLOR = STANDARD_COLORS[0].code;
const DEFAULT_COLOR_NAME = STANDARD_COLORS[0].name;

const normalizeColorCode = (value) => {
  const normalized = (value || "").trim();
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(normalized) ? normalized.toLowerCase() : DEFAULT_COLOR;
};

const isHexColor = (value) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(String(value || "").trim());

const toNumberOrZero = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function ProductManager({ products, credentials, onChanged }) {
  const HISTORY_KEY = "__adminProductManager";
  const historyReadyRef = useRef(false);

  // VIEW STATE
  const [currentView, setCurrentView] = useState("products"); // products | variants | edit-variant
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");

  // SEARCH & FILTER
  const [searchQuery, setSearchQuery] = useState("");

  // MODALS
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateVariantModal, setShowCreateVariantModal] = useState(false);

  // CREATE PRODUCT FORM
  const [newAbout, setNewAbout] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBrandSelection, setNewBrandSelection] = useState("");
  const [newCustomBrand, setNewCustomBrand] = useState("");
  const [newMaterialSelection, setNewMaterialSelection] = useState("");
  const [newCustomMaterial, setNewCustomMaterial] = useState("");
  const [newCategorySelection, setNewCategorySelection] = useState("");
  const [newCustomCategory, setNewCustomCategory] = useState("");
  const [newPrimaryImageUrl, setNewPrimaryImageUrl] = useState("");
  const [newPrimaryUploading, setNewPrimaryUploading] = useState(false);
  const [newVariant, setNewVariant] = useState({
    selectedColorName: DEFAULT_COLOR_NAME,
    customColorName: "",
    customColorCode: DEFAULT_COLOR,
    sizes: [],
    sizeInput: "",
    mrp: "",
    price: "",
    stock: "",
    images: []
  });
  const [newVariantUploading, setNewVariantUploading] = useState(false);

  // UPDATE PRODUCT FORM
  const [editAbout, setEditAbout] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editMaterial, setEditMaterial] = useState("");
  const [editBrandSelection, setEditBrandSelection] = useState("");
  const [editCustomBrand, setEditCustomBrand] = useState("");
  const [editMaterialSelection, setEditMaterialSelection] = useState("");
  const [editCustomMaterial, setEditCustomMaterial] = useState("");
  const [editCategorySelection, setEditCategorySelection] = useState("");
  const [editCustomCategory, setEditCustomCategory] = useState("");

  // CREATE VARIANT FORM
  const [variantToCreate, setVariantToCreate] = useState({
    selectedColorName: DEFAULT_COLOR_NAME,
    customColorName: "",
    customColorCode: DEFAULT_COLOR,
    sizes: [],
    sizeInput: "",
    mrp: "",
    price: "",
    stock: "",
    images: []
  });
  const [variantCreating, setVariantCreating] = useState(false);
  const [variantCreateUploading, setVariantCreateUploading] = useState(false);

  // EDIT VARIANT FORM
  const [editVariant, setEditVariant] = useState(null);
  const [editVariantUploading, setEditVariantUploading] = useState(false);

  // ===== HELPERS =====
  const selectedProduct = useMemo(() => products.find((p) => p._id === selectedProductId), [products, selectedProductId]);
  const selectedVariant = useMemo(() => selectedProduct?.variants?.find((v) => v._id === selectedVariantId), [selectedProduct, selectedVariantId]);
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter((p) => p.About.toLowerCase().includes(query) || (p.brand || "").toLowerCase().includes(query) || (p.category || "").toLowerCase().includes(query));
  }, [products, searchQuery]);

  const existingCategories = useMemo(() => {
    const uniqueByLower = new Map();

    products.forEach((product) => {
      const rawCategory = String(product?.category || "").trim();
      if (!rawCategory) {
        return;
      }

      const lowerKey = rawCategory.toLowerCase();
      if (!uniqueByLower.has(lowerKey)) {
        uniqueByLower.set(lowerKey, rawCategory);
      }
    });

    // Remove 'StrainlessSteel', keep 'Stainless Steel'
    return Array.from(uniqueByLower.values())
      .filter((mat) => mat.toLowerCase() !== 'strainlesssteel')
      .sort((left, right) => left.localeCompare(right));
  }, [products]);

  const existingBrands = useMemo(() => {
    const uniqueByLower = new Map();

    products.forEach((product) => {
      const rawBrand = String(product?.brand || "").trim();
      if (!rawBrand) {
        return;
      }

      const lowerKey = rawBrand.toLowerCase();
      if (!uniqueByLower.has(lowerKey)) {
        uniqueByLower.set(lowerKey, rawBrand);
      }
    });

    // Remove 'StrainlessSteel' and 'StainlessSteel', keep 'Stainless Steel'
    return Array.from(uniqueByLower.values())
      .filter((mat) => {
        const lower = mat.toLowerCase();
        return lower !== 'strainlesssteel' && lower !== 'stainlesssteel';
      })
      .sort((left, right) => left.localeCompare(right));
  }, [products]);

  const existingMaterials = useMemo(() => {
    const uniqueByLower = new Map();

    products.forEach((product) => {
      const rawMaterial = String(product?.material || "").trim();
      if (!rawMaterial) {
        return;
      }

      const lowerKey = rawMaterial.toLowerCase();
      if (!uniqueByLower.has(lowerKey)) {
        uniqueByLower.set(lowerKey, rawMaterial);
      }
    });

    return Array.from(uniqueByLower.values()).sort((left, right) => left.localeCompare(right));
  }, [products]);

  const existingSizes = useMemo(() => {
    const uniqueByLower = new Map();

    products.forEach((product) => {
      (product.variants || []).forEach((variant) => {
        const rawSize = String(variant?.size || "").trim();
        if (!rawSize) {
          return;
        }

        const lowerKey = rawSize.toLowerCase();
        if (!uniqueByLower.has(lowerKey)) {
          uniqueByLower.set(lowerKey, rawSize);
        }
      });
    });

    return Array.from(uniqueByLower.values()).sort((left, right) => left.localeCompare(right));
  }, [products]);

  const resolveCategoryValue = (selection, customValue) => {
    if (selection === CREATE_NEW_CATEGORY_VALUE) {
      return (customValue || "").trim();
    }

    return (selection || "").trim();
  };

  const resolveBrandValue = (selection, customValue) => {
    if (selection === CREATE_NEW_BRAND_VALUE) {
      return (customValue || "").trim();
    }

    return (selection || "").trim();
  };

  const resolveMaterialValue = (selection, customValue) => {
    if (selection === CREATE_NEW_MATERIAL_VALUE) {
      return (customValue || "").trim();
    }

    return (selection || "").trim();
  };

  const resolveSizeValue = (selection, customValue) => {
    if (selection === CREATE_NEW_SIZE_VALUE) {
      return (customValue || "").trim();
    }

    return (selection || "").trim();
  };

  const getColorPayload = (variant) => {
    if (variant.selectedColorName === OTHER_COLOR_VALUE) {
      return {
        color: (variant.customColorName || "").trim(),
        colorCode: normalizeColorCode(variant.customColorCode)
      };
    }
    const selected = STANDARD_COLORS.find((color) => color.name === variant.selectedColorName) || STANDARD_COLORS[0];
    return { color: selected.name, colorCode: selected.code };
  };

  const mapVariantToEditForm = (variant) => {
    const variantColorName = String(variant?.color || "").trim();
    const variantColorKey = variantColorName.toLowerCase();
    const matchingStandard = STANDARD_COLORS.find(
      (entry) => String(entry.name || "").trim().toLowerCase() === variantColorKey
    );

    if (matchingStandard) {
      return {
        ...variant,
        selectedColorName: matchingStandard.name,
        customColorName: "",
        customColorCode: matchingStandard.code
      };
    }

    return {
      ...variant,
      selectedColorName: OTHER_COLOR_VALUE,
      customColorName: variantColorName,
      customColorCode: isHexColor(variant?.colorCode)
        ? variant.colorCode
        : (isHexColor(variant?.color) ? variant.color : DEFAULT_COLOR)
    };
  };

  const getVariantImage = (product) =>
    product?.primaryImage?.url || product?.variants?.[0]?.images?.[0]?.url || NO_IMAGE_DATA_URI;

  const applyViewState = (nextView, productId = "", variantId = "") => {
    setCurrentView(nextView || "products");
    setSelectedProductId(productId || "");
    setSelectedVariantId(variantId || "");
  };

  const navigateToView = (nextView, productId = "", variantId = "") => {
    applyViewState(nextView, productId, variantId);

    if (!historyReadyRef.current) {
      return;
    }

    const historyState = {
      [HISTORY_KEY]: true,
      view: nextView,
      productId: productId || "",
      variantId: variantId || ""
    };

    window.history.pushState(historyState, "");
  };

  useEffect(() => {
    const existingState = window.history.state;

    if (existingState?.[HISTORY_KEY]) {
      applyViewState(existingState.view, existingState.productId, existingState.variantId);
    } else {
      window.history.replaceState(
        {
          [HISTORY_KEY]: true,
          view: "products",
          productId: "",
          variantId: ""
        },
        ""
      );
    }

    historyReadyRef.current = true;

    const onPopState = (event) => {
      const nextState = event.state;

      if (nextState?.[HISTORY_KEY]) {
        applyViewState(nextState.view, nextState.productId, nextState.variantId);
      } else {
        applyViewState("products", "", "");
      }

      setShowCreateModal(false);
      setShowUpdateModal(false);
      setShowCreateVariantModal(false);
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (currentView === "products") {
      return;
    }

    if (currentView === "variants") {
      if (!selectedProduct) {
        applyViewState("products", "", "");
      }
      return;
    }

    if (currentView === "edit-variant") {
      if (!selectedProduct) {
        applyViewState("products", "", "");
        return;
      }

      if (!selectedVariant) {
        applyViewState("variants", selectedProduct._id, "");
        return;
      }

      if (!editVariant || editVariant._id !== selectedVariant._id) {
        setEditVariant({ ...selectedVariant });
      }
    }
  }, [currentView, selectedProduct, selectedVariant, editVariant]);

  // ===== PRODUCT CRUD =====
  const handleCreateProduct = async () => {
    const about = newAbout.trim();
    if (!about) {
      alert("Product About is required");
      return;
    }
    if (!newPrimaryImageUrl) {
      alert("Primary image is required");
      return;
    }
    if (!newVariant.sizes || !newVariant.sizes.length) {
      alert("At least one size is required for first variant");
      return;
    }
    if (newVariant.selectedColorName === OTHER_COLOR_VALUE && !(newVariant.customColorName || "").trim()) {
      alert("Custom color name is required");
      return;
    }
    if (!newVariant.mrp || !newVariant.price) {
      alert("MRP and Offer Price required");
      return;
    }
    if (!newVariant.images.length) {
      alert("Upload at least one image for first variant");
      return;
    }

    const colorPayload = getColorPayload(newVariant);
    const resolvedBrand = resolveBrandValue(newBrandSelection, newCustomBrand);
    const resolvedMaterial = resolveMaterialValue(newMaterialSelection, newCustomMaterial);
    
    await createProduct(credentials, {
      About: about,
      description: newDescription.trim(),
      brand: resolvedBrand,
      material: resolvedMaterial,
      category: resolveCategoryValue(newCategorySelection, newCustomCategory),
      primaryImage: { url: newPrimaryImageUrl },
      variants: [
        {
          color: colorPayload.color,
          colorCode: colorPayload.colorCode,
          sizes: newVariant.sizes,
          mrp: toNumberOrZero(newVariant.mrp),
          price: toNumberOrZero(newVariant.price),
          stock: toNumberOrZero(newVariant.stock),
          images: (newVariant.images || []).map((url) => ({ url }))
        }
      ]
    });

    // Reset form
    setNewAbout("");
    setNewDescription("");
    setNewBrandSelection("");
    setNewCustomBrand("");
    setNewMaterialSelection("");
    setNewCustomMaterial("");
    setNewCategorySelection("");
    setNewCustomCategory("");
    setNewPrimaryImageUrl("");
    setNewVariant({
      selectedColorName: DEFAULT_COLOR_NAME,
      customColorName: "",
      customColorCode: DEFAULT_COLOR,
      sizes: [],
      sizeInput: "",
      mrp: "",
      price: "",
      stock: "",
      images: []
    });
    setShowCreateModal(false);
    await onChanged();
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    const about = editAbout.trim();
    if (!about) {
      alert("Product About is required");
      return;
    }

    const payload = {
      ...selectedProduct,
      About: about,
      description: editDescription.trim(),
      brand: resolveBrandValue(editBrandSelection, editCustomBrand),
      material: resolveMaterialValue(editMaterialSelection, editCustomMaterial),
      category: resolveCategoryValue(editCategorySelection, editCustomCategory)
    };

    await updateProduct(credentials, selectedProduct._id, payload);
    setShowUpdateModal(false);
    await onChanged();
  };

  const handleDeleteProduct = async (productId) => {
    const ok = window.confirm("Delete this product and all variants?");
    if (!ok) return;
    await deleteProduct(credentials, productId);
    if (currentView === "variants" && selectedProductId === productId) {
      navigateToView("products", "", "");
    }
    await onChanged();
  };

  // ===== VARIANT CRUD =====
  const handleCreateVariant = async () => {
    if (!selectedProduct) return;
    if (!variantToCreate.sizes || !variantToCreate.sizes.length) {
      alert("At least one size is required");
      return;
    }
    if (variantToCreate.selectedColorName === OTHER_COLOR_VALUE && !(variantToCreate.customColorName || "").trim()) {
      alert("Custom color name is required");
      return;
    }
    if (!variantToCreate.mrp || !variantToCreate.price) {
      alert("MRP and Offer Price required");
      return;
    }
    if (!variantToCreate.images.length) {
      alert("Upload at least one image");
      return;
    }

    const colorPayload = getColorPayload(variantToCreate);
    await addVariant(credentials, selectedProduct._id, {
      color: colorPayload.color,
      colorCode: colorPayload.colorCode,
      sizes: variantToCreate.sizes,
      mrp: toNumberOrZero(variantToCreate.mrp),
      price: toNumberOrZero(variantToCreate.price),
      stock: toNumberOrZero(variantToCreate.stock),
      images: (variantToCreate.images || []).map((url) => ({ url }))
    });

    setVariantToCreate({
      selectedColorName: DEFAULT_COLOR_NAME,
      customColorName: "",
      customColorCode: DEFAULT_COLOR,
      sizes: [],
      sizeInput: "",
      mrp: "",
      price: "",
      stock: "",
      images: []
    });
    setShowCreateVariantModal(false);
    await onChanged();
  };

  const handleUpdateVariant = async () => {
    if (!selectedProduct || !selectedVariant || !editVariant) return;
    if (!editVariant.size.trim()) {
      alert("Size is required");
      return;
    }
    if (editVariant.selectedColorName === OTHER_COLOR_VALUE && !(editVariant.customColorName || "").trim()) {
      alert("Custom color name is required");
      return;
    }
    if (!editVariant.mrp || !editVariant.price) {
      alert("MRP and Offer Price required");
      return;
    }

    const colorPayload = getColorPayload(editVariant);
    const normalizedImages = (editVariant.images || [])
      .map((imageEntry) => {
        if (typeof imageEntry === "string") {
          return imageEntry;
        }

        return imageEntry?.url || "";
      })
      .filter(Boolean)
      .map((url) => ({ url }));

    const payload = {
      ...editVariant,
      color: colorPayload.color,
      colorCode: colorPayload.colorCode,
      size: editVariant.size.trim(),
      mrp: toNumberOrZero(editVariant.mrp),
      price: toNumberOrZero(editVariant.price),
      stock: toNumberOrZero(editVariant.stock),
      images: normalizedImages
    };

    await updateVariant(credentials, selectedProduct._id, selectedVariant._id, payload);
    navigateToView("variants", selectedProduct._id, "");
    await onChanged();
  };

  const handleDeleteVariant = async () => {
    if (!selectedProduct || !selectedVariant) return;
    const ok = window.confirm("Delete this variant?");
    if (!ok) return;
    await deleteVariant(credentials, selectedProduct._id, selectedVariant._id);
    navigateToView("variants", selectedProduct._id, "");
    await onChanged();
  };

  const openUpdateModal = (productArg) => {
    const productToEdit = productArg || selectedProduct;
    if (!productToEdit) {
      alert("Please select a product to update");
      return;
    }

    setSelectedProductId(productToEdit._id);
    setEditAbout(productToEdit.About || "");
    setEditDescription(productToEdit.description || "");
    setEditBrand(productToEdit.brand || "");
    const normalizedBrand = String(productToEdit.brand || "").trim();
    const hasExistingBrand = existingBrands.some((brand) => brand.toLowerCase() === normalizedBrand.toLowerCase());
    if (!normalizedBrand) {
      setEditBrandSelection("");
      setEditCustomBrand("");
    } else if (hasExistingBrand) {
      const matchedBrand = existingBrands.find((brand) => brand.toLowerCase() === normalizedBrand.toLowerCase()) || normalizedBrand;
      setEditBrandSelection(matchedBrand);
      setEditCustomBrand("");
    } else {
      setEditBrandSelection(CREATE_NEW_BRAND_VALUE);
      setEditCustomBrand(normalizedBrand);
    }
    setEditMaterial(productToEdit.material || "");
    const normalizedMaterial = String(productToEdit.material || "").trim();
    const hasExistingMaterial = existingMaterials.some((material) => material.toLowerCase() === normalizedMaterial.toLowerCase());
    if (!normalizedMaterial) {
      setEditMaterialSelection("");
      setEditCustomMaterial("");
    } else if (hasExistingMaterial) {
      const matchedMaterial = existingMaterials.find((material) => material.toLowerCase() === normalizedMaterial.toLowerCase()) || normalizedMaterial;
      setEditMaterialSelection(matchedMaterial);
      setEditCustomMaterial("");
    } else {
      setEditMaterialSelection(CREATE_NEW_MATERIAL_VALUE);
      setEditCustomMaterial(normalizedMaterial);
    }
    const normalizedCategory = String(productToEdit.category || "").trim();
    const hasExistingCategory = existingCategories.some((category) => category.toLowerCase() === normalizedCategory.toLowerCase());

    if (!normalizedCategory) {
      setEditCategorySelection("");
      setEditCustomCategory("");
    } else if (hasExistingCategory) {
      const matchedCategory = existingCategories.find((category) => category.toLowerCase() === normalizedCategory.toLowerCase()) || normalizedCategory;
      setEditCategorySelection(matchedCategory);
      setEditCustomCategory("");
    } else {
      setEditCategorySelection(CREATE_NEW_CATEGORY_VALUE);
      setEditCustomCategory(normalizedCategory);
    }

    setShowUpdateModal(true);
  };

  const openEditVariantView = (variant) => {
    const parentProductId = selectedProduct?._id || selectedProductId;
    navigateToView("edit-variant", parentProductId, variant._id);
    setEditVariant(mapVariantToEditForm(variant));
  };

  const handleUploadPrimaryImage = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    try {
      setNewPrimaryUploading(true);
      const uploaded = await uploadImages(credentials, [files[0]], "products/primary");
      const imageUrl = uploaded?.[0]?.imageUrl || "";
      if (!imageUrl) throw new Error("Failed to upload");
      setNewPrimaryImageUrl(imageUrl);
    } catch (error) {
      alert(error.message || "Failed to upload");
    } finally {
      setNewPrimaryUploading(false);
      event.target.value = "";
    }
  };

  const handleUploadVariantImages = async (event, isCreateModal = false) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    try {
      if (isCreateModal) {
        setVariantCreateUploading(true);
      } else {
        setNewVariantUploading(true);
      }
      const uploaded = await uploadImages(credentials, files, "products/variants");
      const urls = uploaded.map((entry) => entry.imageUrl);
      if (isCreateModal) {
        setVariantToCreate((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
      } else {
        setNewVariant((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      }
    } catch (error) {
      alert(error.message || "Failed to upload");
    } finally {
      if (isCreateModal) {
        setVariantCreateUploading(false);
      } else {
        setNewVariantUploading(false);
      }
      event.target.value = "";
    }
  };

  const handleUploadEditVariantImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    try {
      setEditVariantUploading(true);
      const uploaded = await uploadImages(credentials, files, "products/variants");
      const uploadedImages = uploaded
        .map((entry) => entry?.imageUrl)
        .filter(Boolean)
        .map((url) => ({ url }));

      setEditVariant((prev) => ({ ...prev, images: [...(prev?.images || []), ...uploadedImages] }));
    } catch (error) {
      alert(error.message || "Failed to upload");
    } finally {
      setEditVariantUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (arr, index) => arr.filter((_, i) => i !== index);

  // ===== RENDER VIEWS =====

  // VIEW 1: PRODUCTS LIST
  if (currentView === "products") {
    return (
      <div className="space-y-4">
        <div className="card panel-toolbar">
          <div className="toolbar-search">
            <input
              type="text"
              placeholder="Search products by name, brand, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="muted toolbar-meta">{filteredProducts.length} products found</span>
          </div>
          <div className="toolbar-actions">
            <button onClick={() => setShowCreateModal(true)}>Create Product</button>
          </div>
        </div>

        <div className="table-card">
          <table className="admin-table fixed">
            <thead>
              <tr>
                <th style={{ width: "60%" }}>Product</th>
                <th style={{ width: "10%" }}>Variants</th>
                <th style={{ width: "30%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="product-cell">
                      <img src={getVariantImage(product)} alt="Product" className="product-thumb" />
                      <div className="text-wrap">
                        <div className="content-label">About</div>
                        <div className="table-product-title">{product.About}</div>
                        <div className="sub">Brand: {product.brand || "-"}</div>
                        <div className="sub">Material: {product.material || "-"}</div>
                        <div className="sub">Category: {product.category || "-"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="variants-count-cell">{(product.variants || []).length}</td>
                  <td>
                    <div className="row-actions wrap">
                      <button onClick={() => openUpdateModal(product)}>
                        Update
                      </button>
                      <button
                        className={selectedProduct?._id === product._id ? "active-tab" : "ghost-tab"}
                        onClick={() => {
                          navigateToView("variants", product._id, "");
                        }}
                      >
                        Variants
                      </button>
                      <button className="danger small" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">No products match your search.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* CREATE PRODUCT MODAL */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Product</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
              </div>
              <div className="modal-body modal-scroll-body">
                <div className="create-form-grid">
                  <div className="grid">
                    <label className="field-label">About (Required)</label>
                    <textarea className="fixed-textbox" placeholder="Product About" value={newAbout} onChange={(e) => setNewAbout(e.target.value)} />
                    <label className="field-label">Description</label>
                    <textarea className="fixed-textbox" placeholder="Detailed Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                    <label className="field-label">Brand</label>
                    <select
                      value={newBrandSelection}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        setNewBrandSelection(selectedValue);
                        if (selectedValue !== CREATE_NEW_BRAND_VALUE) {
                          setNewCustomBrand("");
                        }
                      }}
                    >
                      <option value="">Select Brand</option>
                      {existingBrands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                      <option value={CREATE_NEW_BRAND_VALUE}>+ Create New Brand</option>
                    </select>
                    {newBrandSelection === CREATE_NEW_BRAND_VALUE && (
                      <input
                        value={newCustomBrand}
                        placeholder="Enter new brand"
                        onChange={(e) => setNewCustomBrand(e.target.value)}
                      />
                    )}
                    <label className="field-label">Material</label>
                    <select
                      value={newMaterialSelection}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        setNewMaterialSelection(selectedValue);
                        if (selectedValue !== CREATE_NEW_MATERIAL_VALUE) {
                          setNewCustomMaterial("");
                        }
                      }}
                    >
                      <option value="">Select Material</option>
                      {existingMaterials.map((material) => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                      <option value={CREATE_NEW_MATERIAL_VALUE}>+ Create New Material</option>
                    </select>
                    {newMaterialSelection === CREATE_NEW_MATERIAL_VALUE && (
                      <input
                        value={newCustomMaterial}
                        placeholder="Enter new material"
                        onChange={(e) => setNewCustomMaterial(e.target.value)}
                      />
                    )}
                    <label className="field-label">Category</label>
                    <select
                      value={newCategorySelection}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        setNewCategorySelection(selectedValue);
                        if (selectedValue !== CREATE_NEW_CATEGORY_VALUE) {
                          setNewCustomCategory("");
                        }
                      }}
                    >
                      <option value="">Select Category</option>
                      {existingCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                      <option value={CREATE_NEW_CATEGORY_VALUE}>+ Create New Category</option>
                    </select>
                    {newCategorySelection === CREATE_NEW_CATEGORY_VALUE && (
                      <input
                        placeholder="Enter new category"
                        value={newCustomCategory}
                        onChange={(e) => setNewCustomCategory(e.target.value)}
                      />
                    )}
                  </div>
                  <div className="primary-image-box">
                    <label className="field-label">Primary Image (Required)</label>
                    <input type="file" accept="image/*" onChange={handleUploadPrimaryImage} />
                    <div className="muted">{newPrimaryUploading ? "Uploading..." : "Upload image"}</div>
                    {newPrimaryImageUrl && <img className="primary-preview" src={newPrimaryImageUrl} alt="Primary" />}
                  </div>
                </div>

                <div className="variant-card new-variant section-gap-top">
                  <h4>First Variant (Required)</h4>
                  <div className="variant-grid">
                    <div>
                      <label className="field-label">Color</label>
                      <div className="color-picker-row">
                        <select value={newVariant.selectedColorName} onChange={(e) => setNewVariant((prev) => ({ ...prev, selectedColorName: e.target.value }))}>
                          {STANDARD_COLORS.map((c) => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                          <option value={OTHER_COLOR_VALUE}>Other Color</option>
                        </select>
                        <span className="color-preview" style={{ backgroundColor: normalizeColorCode(getColorPayload(newVariant).colorCode) }}></span>
                      </div>
                      {newVariant.selectedColorName === OTHER_COLOR_VALUE && (
                        <div className="grid color-subgrid-gap">
                          <input placeholder="Custom color name" value={newVariant.customColorName} onChange={(e) => setNewVariant((prev) => ({ ...prev, customColorName: e.target.value }))} />
                          <div className="color-picker-row">
                            <input type="color" value={normalizeColorCode(newVariant.customColorCode)} onChange={(e) => setNewVariant((prev) => ({ ...prev, customColorCode: e.target.value }))} />
                            <input placeholder="#000000" value={newVariant.customColorCode} onChange={(e) => setNewVariant((prev) => ({ ...prev, customColorCode: e.target.value }))} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="field-label">Sizes</label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input
                          list="size-list"
                          placeholder="Add size"
                          value={newVariant.sizeInput}
                          onChange={(e) => setNewVariant((prev) => ({ ...prev, sizeInput: e.target.value }))}
                        />
                        <button type="button" onClick={() => {
                          const size = newVariant.sizeInput.trim();
                          if (!size) return;
                          setNewVariant((prev) => ({
                            ...prev,
                            sizes: Array.from(new Set([...(prev.sizes || []), size])),
                            sizeInput: ""
                          }));
                        }}>Add</button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(newVariant.sizes || []).map((size) => (
                          <span key={size} style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px', marginRight: 4, display: 'flex', alignItems: 'center' }}>
                            {size}
                            <button type="button" style={{ marginLeft: 4, color: 'red', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setNewVariant((prev) => ({ ...prev, sizes: (prev.sizes || []).filter((s) => s !== size) }))}>×</button>
                          </span>
                        ))}
                      </div>
                      <datalist id="size-list">
                        {SIZE_SUGGESTIONS.map((size) => <option key={size} value={size} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="field-label">MRP</label>
                      <input type="number" placeholder="MRP" value={newVariant.mrp} onChange={(e) => setNewVariant((prev) => ({ ...prev, mrp: e.target.value }))} />
                    </div>
                    <div>
                      <label className="field-label">Offer Price</label>
                      <input type="number" placeholder="Offer Price" value={newVariant.price} onChange={(e) => setNewVariant((prev) => ({ ...prev, price: e.target.value }))} />
                    </div>
                    <div>
                      <label className="field-label">Stock</label>
                      <input type="number" placeholder="Stock" value={newVariant.stock} onChange={(e) => setNewVariant((prev) => ({ ...prev, stock: e.target.value }))} />
                    </div>
                  </div>
                  <div className="variant-upload-row upload-gap-top">
                    <input type="file" multiple accept="image/*" onChange={(e) => handleUploadVariantImages(e, false)} />
                    <span className="muted">{newVariantUploading ? "Uploading..." : "Upload images"}</span>
                  </div>
                  <div className="image-grid">
                    {newVariant.images.map((url, i) => (
                      <div key={`${url}-${i}`} className="image-card">
                        <img src={url} alt={`Variant ${i + 1}`} />
                        <button className="danger small" onClick={() => setNewVariant((prev) => ({ ...prev, images: removeImage(prev.images, i) }))}>Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button onClick={handleCreateProduct}>Create Product</button>
              </div>
            </div>
          </div>
        )}

        {/* UPDATE PRODUCT MODAL */}
        {showUpdateModal && selectedProduct && (
          <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h2>Update Product: {selectedProduct.About}</h2>
                <button className="close-btn" onClick={() => setShowUpdateModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="grid">
                  <label className="field-label">About (Required)</label>
                  <textarea className="fixed-textbox" value={editAbout} onChange={(e) => setEditAbout(e.target.value)} />
                  <label className="field-label">Description</label>
                  <textarea className="fixed-textbox" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  <label className="field-label">Brand</label>
                  <select
                    value={editBrandSelection}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      setEditBrandSelection(selectedValue);
                      if (selectedValue !== CREATE_NEW_BRAND_VALUE) {
                        setEditCustomBrand("");
                      }
                    }}
                  >
                    <option value="">Select Brand</option>
                    {existingBrands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value={CREATE_NEW_BRAND_VALUE}>+ Create New Brand</option>
                  </select>
                  {editBrandSelection === CREATE_NEW_BRAND_VALUE && (
                    <input
                      value={editCustomBrand}
                      placeholder="Enter new brand"
                      onChange={(e) => setEditCustomBrand(e.target.value)}
                    />
                  )}
                  <label className="field-label">Material</label>
                  <select
                    value={editMaterialSelection}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      setEditMaterialSelection(selectedValue);
                      if (selectedValue !== CREATE_NEW_MATERIAL_VALUE) {
                        setEditCustomMaterial("");
                      }
                    }}
                  >
                    <option value="">Select Material</option>
                    {existingMaterials.map((material) => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                    <option value={CREATE_NEW_MATERIAL_VALUE}>+ Create New Material</option>
                  </select>
                  {editMaterialSelection === CREATE_NEW_MATERIAL_VALUE && (
                    <input
                      value={editCustomMaterial}
                      placeholder="Enter new material"
                      onChange={(e) => setEditCustomMaterial(e.target.value)}
                    />
                  )}
                  <label className="field-label">Category</label>
                  <select
                    value={editCategorySelection}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      setEditCategorySelection(selectedValue);
                      if (selectedValue !== CREATE_NEW_CATEGORY_VALUE) {
                        setEditCustomCategory("");
                      }
                    }}
                  >
                    <option value="">Select Category</option>
                    {existingCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value={CREATE_NEW_CATEGORY_VALUE}>+ Create New Category</option>
                  </select>
                  {editCategorySelection === CREATE_NEW_CATEGORY_VALUE && (
                    <input
                      value={editCustomCategory}
                      placeholder="Enter new category"
                      onChange={(e) => setEditCustomCategory(e.target.value)}
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowUpdateModal(false)}>Cancel</button>
                <button onClick={handleUpdateProduct}>Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // VIEW 2: VARIANTS LIST
  if (currentView === "variants" && selectedProduct) {
    return (
      <div className="space-y-4">
        <div className="card panel-header-row">
          <div>
            <h2 className="panel-title">Variants: {selectedProduct.About}</h2>
            <p className="muted panel-subtitle">Total variants: {(selectedProduct.variants || []).length}</p>
          </div>
          {/* Removed toolbar-actions buttons */}
        </div>

        {/* VARIANTS GRID */}
        <div className="variants-grid-view">
          {(selectedProduct.variants || []).length === 0 ? (
            <div className="card empty-card">
              <p className="muted">No variants yet. Create one below.</p>
            </div>
          ) : (
            <div className="variants-grid">
              {selectedProduct.variants.map((variant) => (
                <button
                  key={variant._id}
                  className="variant-card-selectable"
                  onClick={() => openEditVariantView(variant)}
                  type="button"
                >
                  {variant.images?.[0] && (
                    <div className="variant-image-wrap">
                      <img
                        src={variant.images[0].url}
                        alt={`${variant.color} ${variant.size}`}
                        className="variant-image"
                      />
                    </div>
                  )}
                  <div className="variant-meta-row">
                    <span className="color-preview-large" style={{ backgroundColor: variant.colorCode, flexShrink: 0 }}></span>
                    <div className="variant-meta-text">
                      <strong>{variant.color}</strong>
                      <span>• {variant.size}</span>
                    </div>
                  </div>
                  <div className="variant-footer-row">
                    <span className="variant-price">₹{variant.price}</span>
                    <span className="variant-stock">Stock: {variant.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card create-variant-cta">
          <button onClick={() => setShowCreateVariantModal(true)} className="create-variant-btn">Create New Variant</button>
        </div>

        {/* CREATE VARIANT MODAL */}
        {showCreateVariantModal && (
          <div className="modal-overlay" onClick={() => setShowCreateVariantModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Variant for {selectedProduct.About}</h2>
                <button className="close-btn" onClick={() => setShowCreateVariantModal(false)}>✕</button>
              </div>
              <div className="modal-body modal-scroll-body">
                <div className="variant-grid">
                  <div>
                    <label className="field-label">Color</label>
                    <div className="color-picker-row">
                      <select value={variantToCreate.selectedColorName} onChange={(e) => setVariantToCreate((prev) => ({ ...prev, selectedColorName: e.target.value }))}>
                        {STANDARD_COLORS.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                        <option value={OTHER_COLOR_VALUE}>Other Color</option>
                      </select>
                      <span className="color-preview" style={{ backgroundColor: normalizeColorCode(getColorPayload(variantToCreate).colorCode) }}></span>
                    </div>
                    {variantToCreate.selectedColorName === OTHER_COLOR_VALUE && (
                      <div className="grid color-subgrid-gap">
                        <input placeholder="Custom color name" value={variantToCreate.customColorName} onChange={(e) => setVariantToCreate((prev) => ({ ...prev, customColorName: e.target.value }))} />
                        <div className="color-picker-row">
                          <input type="color" value={normalizeColorCode(variantToCreate.customColorCode)} onChange={(e) => setVariantToCreate((prev) => ({ ...prev, customColorCode: e.target.value }))} />
                          <input placeholder="#000000" value={variantToCreate.customColorCode} onChange={(e) => setVariantToCreate((prev) => ({ ...prev, customColorCode: e.target.value }))} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="field-label">Sizes</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        list="size-list-2"
                        placeholder="Add size"
                        value={variantToCreate.sizeInput}
                        onChange={(e) => setVariantToCreate((prev) => ({ ...prev, sizeInput: e.target.value }))}
                      />
                      <button type="button" onClick={() => {
                        const size = variantToCreate.sizeInput.trim();
                        if (!size) return;
                        setVariantToCreate((prev) => ({
                          ...prev,
                          sizes: Array.from(new Set([...(prev.sizes || []), size])),
                          sizeInput: ""
                        }));
                      }}>Add</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(variantToCreate.sizes || []).map((size) => (
                        <span key={size} style={{ background: '#f3f4f6', borderRadius: 4, padding: '2px 8px', marginRight: 4, display: 'flex', alignItems: 'center' }}>
                          {size}
                          <button type="button" style={{ marginLeft: 4, color: 'red', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setVariantToCreate((prev) => ({ ...prev, sizes: (prev.sizes || []).filter((s) => s !== size) }))}>×</button>
                        </span>
                      ))}
                    </div>
                    <datalist id="size-list-2">
                      {SIZE_SUGGESTIONS.map((size) => <option key={size} value={size} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="field-label">MRP</label>
                    <input type="number" placeholder="MRP" value={variantToCreate.mrp} onChange={(e) => setVariantToCreate((prev) => ({ ...prev, mrp: e.target.value }))} />
                  </div>
                  <div>
                    <label className="field-label">Offer Price</label>
                    <input type="number" placeholder="Offer Price" value={variantToCreate.price} onChange={(e) => setVariantToCreate((prev) => ({ ...prev, price: e.target.value }))} />
                  </div>
                  <div>
                    <label className="field-label">Stock</label>
                    <input type="number" placeholder="Stock" value={variantToCreate.stock} onChange={(e) => setVariantToCreate((prev) => ({ ...prev, stock: e.target.value }))} />
                  </div>
                </div>
                <div className="variant-upload-row upload-gap-top">
                  <input type="file" multiple accept="image/*" onChange={(e) => handleUploadVariantImages(e, true)} />
                  <span className="muted">{variantCreateUploading ? "Uploading..." : "Upload images"}</span>
                </div>
                <div className="image-grid">
                  {variantToCreate.images.map((url, i) => (
                    <div key={`${url}-${i}`} className="image-card">
                      <img src={url} alt={`Variant ${i + 1}`} />
                      <button className="danger small" onClick={() => setVariantToCreate((prev) => ({ ...prev, images: removeImage(prev.images, i) }))}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowCreateVariantModal(false)}>Cancel</button>
                <button onClick={handleCreateVariant}>Create Variant</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // VIEW 3: EDIT VARIANT
  if (currentView === "edit-variant" && selectedProduct && editVariant) {
    return (
      <div className="space-y-4">
        <div className="card panel-header-row">
          <h2 className="panel-title">Edit Variant: {editVariant.color} • {editVariant.size}</h2>
          <button onClick={() => navigateToView("variants", selectedProduct?._id || selectedProductId, "")}>Back to Variants</button>
        </div>

        <div className="card variant-card">
          <div className="variant-grid">
            <div>
              <label className="field-label">Color</label>
              <div className="color-picker-row">
                <select value={editVariant.selectedColorName} onChange={(e) => setEditVariant((prev) => ({ ...prev, selectedColorName: e.target.value }))}>
                  {STANDARD_COLORS.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                  <option value={OTHER_COLOR_VALUE}>Other Color</option>
                </select>
                <span className="color-preview" style={{ backgroundColor: normalizeColorCode(getColorPayload(editVariant).colorCode) }}></span>
              </div>
              {editVariant.selectedColorName === OTHER_COLOR_VALUE && (
                <div className="grid color-subgrid-gap">
                  <input placeholder="Custom color name" value={editVariant.customColorName} onChange={(e) => setEditVariant((prev) => ({ ...prev, customColorName: e.target.value }))} />
                  <div className="color-picker-row">
                    <input type="color" value={normalizeColorCode(editVariant.customColorCode)} onChange={(e) => setEditVariant((prev) => ({ ...prev, customColorCode: e.target.value }))} />
                    <input placeholder="#000000" value={editVariant.customColorCode} onChange={(e) => setEditVariant((prev) => ({ ...prev, customColorCode: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="field-label">Size</label>
              <input list="size-list-3" value={editVariant.size} onChange={(e) => setEditVariant((prev) => ({ ...prev, size: e.target.value }))} />
              <datalist id="size-list-3">
                {SIZE_SUGGESTIONS.map((size) => <option key={size} value={size} />)}
              </datalist>
            </div>
            <div>
              <label className="field-label">MRP</label>
              <input type="number" value={editVariant.mrp} onChange={(e) => setEditVariant((prev) => ({ ...prev, mrp: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Offer Price</label>
              <input type="number" value={editVariant.price} onChange={(e) => setEditVariant((prev) => ({ ...prev, price: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Stock</label>
              <input type="number" value={editVariant.stock} onChange={(e) => setEditVariant((prev) => ({ ...prev, stock: e.target.value }))} />
            </div>
          </div>

          <div className="variant-upload-row upload-gap-large-top">
            <input type="file" multiple accept="image/*" onChange={handleUploadEditVariantImages} />
            <button onClick={handleUpdateVariant}>Update Variant</button>
            <button className="danger" onClick={handleDeleteVariant}>Delete Variant</button>
            <span className="muted">{editVariantUploading ? "Uploading..." : "Upload images"}</span>
          </div>

          <div className="image-grid">
            {(editVariant.images || []).map((img, i) => {
              const imageSrc = typeof img === "string" ? img : img.url;
              return (
                <div key={`${imageSrc}-${i}`} className="image-card">
                  <img src={imageSrc} alt={`Variant ${i + 1}`} />
                  <button className="danger small" onClick={() => setEditVariant((prev) => ({ ...prev, images: removeImage(prev?.images || [], i) }))}>Remove</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row-actions">
        <span className="muted">View could not be restored. Returning to products.</span>
        <button onClick={() => navigateToView("products", "", "")}>Go to Products</button>
      </div>
    </div>
  );
}

export default ProductManager;
