const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const makeUrl = (path) => `${API_BASE_URL}${path}`;

const uniqueValues = (values) => [...new Set(values.filter(Boolean))];

const toArray = (value) => (Array.isArray(value) ? value : []);

const sanitizeString = (value) => typeof value === 'string' ? value.trim() : "";

export const normalizeProduct = (product) => {
  const variants = toArray(product?.variants);
  const prices = variants
    .map((variant) => Number(variant?.price))
    .filter((price) => Number.isFinite(price));
  const mrps = variants
    .map((variant) => Number(variant?.mrp))
    .filter((mrp) => Number.isFinite(mrp));

  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const minMrp = mrps.length ? Math.min(...mrps) : null;
  const maxMrp = mrps.length ? Math.max(...mrps) : null;
  const referencePrice = Number.isFinite(maxMrp) && maxMrp > 0 ? maxMrp : null;
  const displayPrice = Number.isFinite(minPrice) ? minPrice : null;
  const discountPercent =
    Number.isFinite(referencePrice) && Number.isFinite(displayPrice) && displayPrice > 0 && referencePrice > displayPrice
      ? Math.round(((referencePrice - displayPrice) / referencePrice) * 100)
      : 0;

  const image =
    product?.primaryImage?.url ||
    variants.find((variant) => variant?.images?.[0]?.url)?.images?.[0]?.url ||
    "https://via.placeholder.com/500x700?text=Product";

  return {
    ...product,
    title: sanitizeString(product?.name || product?.title || product?.About) || "Untitled Product",
    about: sanitizeString(product?.About),
    description: sanitizeString(product?.description),
    brand: sanitizeString(product?.brand),
    category: sanitizeString(product?.category),
    material: sanitizeString(product?.material),
    image,
    colors: uniqueValues(variants.map((variant) => variant?.color)),
    sizes: uniqueValues(variants.map((variant) => variant?.size)),
    minPrice,
    maxPrice,
    minMrp,
    maxMrp,
    displayPrice,
    referencePrice,
    discountPercent,
    variants
  };
};

const handleResponse = async (response) => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }
  return payload;
};

export const fetchProducts = async (options = {}) => {
  const params = new URLSearchParams();

  if (options.limit) {
    params.set("limit", String(options.limit));
  }

  if (options.page) {
    params.set("page", String(options.page));
  }

  if (options.sort) {
    params.set("sort", options.sort);
  }

  if (options.search && String(options.search).trim()) {
    params.set("search", String(options.search).trim());
  }

  if (Array.isArray(options.categories) && options.categories.length) {
    const categoriesValue = options.categories
      .map((entry) => String(entry || "").trim())
      .filter(Boolean)
      .join(",");

    if (categoriesValue) {
      params.set("categories", categoriesValue);
    }
  }

  const queryString = params.toString();
  const path = queryString ? `/api/products?${queryString}` : "/api/products";

  const response = await fetch(makeUrl(path));
  const payload = await handleResponse(response);
  return toArray(payload?.data).map(normalizeProduct);
};

export const fetchProductById = async (id) => {
  const response = await fetch(makeUrl(`/api/products/${id}`));
  const payload = await handleResponse(response);
  return normalizeProduct(payload?.data || {});
};

export async function fetchPropertyCounts(property) {
  const response = await fetch(makeUrl(`/admin/property-counts/${property}`));
  if (!response.ok) throw new Error("Failed to fetch property counts");
  return await response.json();
}
