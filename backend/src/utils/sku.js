const normalizePart = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

const randomPart = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const generateSku = ({ color, size } = {}, existingSkus = new Set()) => {
  const colorPart = normalizePart(color) || "CLR";
  const sizePart = normalizePart(size) || "SZ";

  let sku = `${colorPart}-${sizePart}-${randomPart()}`;
  while (existingSkus.has(sku)) {
    sku = `${colorPart}-${sizePart}-${randomPart()}`;
  }

  return sku;
};

module.exports = {
  generateSku
};
