// Simple in-memory cache for property counts and price range
// For production, replace with Redis or similar

const propertyCountsCache = new Map();
const priceRangeCache = { min: null, max: null };

function setPropertyCount(property, value) {
  propertyCountsCache.set(property, value);
}

function getPropertyCount(property) {
  return propertyCountsCache.get(property);
}

function setPriceRange(min, max) {
  priceRangeCache.min = min;
  priceRangeCache.max = max;
}

function getPriceRange() {
  return { min: priceRangeCache.min, max: priceRangeCache.max };
}

module.exports = {
  setPropertyCount,
  getPropertyCount,
  setPriceRange,
  getPriceRange,
};
