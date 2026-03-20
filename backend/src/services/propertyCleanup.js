const PropertyCount = require("../model/propertyCountModel");
const PriceRange = require("../model/priceRangeModel");
const propertyCountCache = require("./propertyCountCache");

async function incrementPropertyCount(property, value) {
  const doc = await PropertyCount.findOneAndUpdate(
    { property },
    { $inc: { [`values.${value}`]: 1 } },
    { upsert: true, new: true }
  );
  return doc;
}

async function decrementPropertyCount(property, value) {
  const doc = await PropertyCount.findOneAndUpdate(
    { property },
    { $inc: { [`values.${value}`]: -1 } },
    { new: true }
  );
  // Remove value if count is 0 or less
  if (doc && doc.values.get(value) <= 0) {
    doc.values.delete(value);
    await doc.save();
  }
  return doc;
}

async function getPropertyCounts(property) {
  // Try cache first
  const cached = propertyCountCache.getPropertyCount(property);
  if (cached) return cached;
  const doc = await PropertyCount.findOne({ property });
  const result = doc ? Object.fromEntries(doc.values) : {};
  propertyCountCache.setPropertyCount(property, result);
  return result;
}

async function updatePriceRangeOnCreateOrUpdate(product) {
  const prices = [];
  (product.variants || []).forEach((variant) => {
    const price = Number(variant?.price);
    if (Number.isFinite(price) && price >= 0) {
      prices.push(price);
    }
  });
  if (!prices.length) return;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  await PriceRange.findOneAndUpdate({}, { min, max }, { upsert: true });
}

async function updatePriceRangeOnDelete() {
  // Recalculate from all products
  const Product = require("../model/productModel");
  const products = await Product.find({});
  const prices = [];
  products.forEach((product) => {
    (product.variants || []).forEach((variant) => {
      const price = Number(variant?.price);
      if (Number.isFinite(price) && price >= 0) {
        prices.push(price);
      }
    });
  });
  if (!prices.length) return;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  await PriceRange.findOneAndUpdate({}, { min, max }, { upsert: true });
}

async function getPriceRange() {
  // Try cache first
  const cached = propertyCountCache.getPriceRange();
  if (cached.min !== null && cached.max !== null) return cached;
  const doc = await PriceRange.findOne({});
  const result = doc ? { min: doc.min, max: doc.max } : { min: 0, max: 0 };
  propertyCountCache.setPriceRange(result.min, result.max);
  return result;
}

// Batch update property counts for multiple properties
async function batchIncrementPropertyCounts(propertyValues) {
  const updates = Object.entries(propertyValues).map(([property, values]) => {
    return PropertyCount.findOneAndUpdate(
      { property },
      { $inc: values },
      { upsert: true, new: true }
    );
  });
  return Promise.all(updates);
}

module.exports = {
  incrementPropertyCount,
  decrementPropertyCount,
  getPropertyCounts,
  updatePriceRangeOnCreateOrUpdate,
  updatePriceRangeOnDelete,
  getPriceRange,
  batchIncrementPropertyCounts,
};
