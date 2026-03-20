const PUBLIC_API_BASE_URL =
  import.meta.env.VITE_PUBLIC_API_BASE_URL || "http://localhost:3000/api/products";
const ADMIN_API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL || "http://localhost:3000/api/admin/products";
const ADMIN_UPLOAD_API_BASE_URL =
  import.meta.env.VITE_ADMIN_UPLOAD_API_BASE_URL || "http://localhost:3000/api/admin/upload";

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

export const getProducts = async () => {
  const payload = await request(PUBLIC_API_BASE_URL);
  return payload.data || [];
};

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
