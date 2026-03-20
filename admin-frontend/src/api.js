// Batch fetch property counts for multiple properties
export async function getBatchPropertyCounts(properties) {
  if (!Array.isArray(properties) || properties.length === 0) return {};
  const results = {};
  const uncached = properties.filter((prop) => !propertyCountsCache[prop]);
  await Promise.all(
    uncached.map(async (property) => {
      const response = await fetch(`${ADMIN_API_BASE_URL}/property-counts/${property}`);
      if (!response.ok) return;
      const data = await response.json();
      propertyCountsCache[property] = data;
    })
  );
  savePropertyCountsCache();
  properties.forEach((prop) => {
    results[prop] = propertyCountsCache[prop] || null;
  });
  return results;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const PUBLIC_API_BASE_URL = `${API_BASE_URL}/api/products`;
const ADMIN_API_BASE_URL = `${API_BASE_URL}/api/admin/products`;
const ADMIN_UPLOAD_API_BASE_URL = `${API_BASE_URL}/api/admin/upload`;

const getHeaders = (credentials) => ({
  "Content-Type": "application/json",
  email: credentials.email,
  password: credentials.password
});

const toErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload.message || "Request failed";
  } catch {
    return "Request failed";
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(await toErrorMessage(response));
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

// Simple in-memory cache for property counts
const PROPERTY_COUNTS_STORAGE_KEY = 'adminPropertyCountsCache';
let propertyCountsCache = {};
// Load cache from localStorage
try {
  const stored = localStorage.getItem(PROPERTY_COUNTS_STORAGE_KEY);
  if (stored) propertyCountsCache = JSON.parse(stored);
} catch {}

function savePropertyCountsCache() {
  try {
    localStorage.setItem(PROPERTY_COUNTS_STORAGE_KEY, JSON.stringify(propertyCountsCache));
  } catch {}
}

export const getProducts = async (options = {}) => {
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
  const queryString = params.toString();
  const url = queryString ? `${PUBLIC_API_BASE_URL}?${queryString}` : PUBLIC_API_BASE_URL;
  const payload = await request(url);
  return payload.data || [];
};

export async function getPropertyCounts(property) {
  if (propertyCountsCache[property]) {
    return propertyCountsCache[property];
  }
  const response = await fetch(`${ADMIN_API_BASE_URL}/property-counts/${property}`);
  if (!response.ok) throw new Error("Failed to fetch property counts");
  const data = await response.json();
  propertyCountsCache[property] = data;
  savePropertyCountsCache();
  return data;
}

export const getProductById = async (productId) => {
  const payload = await request(`${PUBLIC_API_BASE_URL}/${productId}`);
  return payload.data || null;
};

export const createProduct = (credentials, body) =>
  request(ADMIN_API_BASE_URL, {
    method: "POST",
    headers: getHeaders(credentials),
    body: JSON.stringify(body)
  });

export const updateProduct = (credentials, productId, body) =>
  request(`${ADMIN_API_BASE_URL}/${productId}`, {
    method: "PUT",
    headers: getHeaders(credentials),
    body: JSON.stringify(body)
  });

export const deleteProduct = (credentials, productId) =>
  request(`${ADMIN_API_BASE_URL}/${productId}`, {
    method: "DELETE",
    headers: getHeaders(credentials)
  });

export const addVariant = (credentials, productId, body) =>
  request(`${ADMIN_API_BASE_URL}/${productId}/variants`, {
    method: "POST",
    headers: getHeaders(credentials),
    body: JSON.stringify(body)
  });

export const updateVariant = (credentials, productId, variantId, body) =>
  request(`${ADMIN_API_BASE_URL}/${productId}/variants/${variantId}`, {
    method: "PUT",
    headers: getHeaders(credentials),
    body: JSON.stringify(body)
  });

export const deleteVariant = (credentials, productId, variantId) =>
  request(`${ADMIN_API_BASE_URL}/${productId}/variants/${variantId}`, {
    method: "DELETE",
    headers: getHeaders(credentials)
  });

export const uploadImages = async (credentials, files, folder = "products") => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  formData.append("folder", folder);

  const endpoints = [
    `${ADMIN_UPLOAD_API_BASE_URL}/images`,
    `${ADMIN_API_BASE_URL}/upload/images`,
    "http://localhost:3000/api/upload/images"
  ];

  let lastError = "Request failed";

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        email: credentials.email,
        password: credentials.password
      },
      body: formData
    });

    if (response.ok) {
      const payload = await response.json();
      return payload.data?.images || [];
    }

    lastError = await toErrorMessage(response);
    if (response.status !== 404) {
      break;
    }
  }

  throw new Error(lastError);
};

export const fetchPropertyCounts = async (property) => {
  const response = await fetch(`${ADMIN_API_BASE_URL}/property-counts/${property}`);
  if (!response.ok) throw new Error("Failed to fetch property counts");
  return await response.json();
};
