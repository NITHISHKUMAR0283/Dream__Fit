const PropertyCount = require("../model/propertyCountModel");
const PriceRange = require("../model/priceRangeModel");

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
  const doc = await PropertyCount.findOne({ property });
  return doc ? Object.fromEntries(doc.values) : {};
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
  const doc = await PriceRange.findOne({});
  return doc ? { min: doc.min, max: doc.max } : { min: 0, max: 0 };
}

module.exports = {
  incrementPropertyCount,
  decrementPropertyCount,
  getPropertyCounts,
  updatePriceRangeOnCreateOrUpdate,
  updatePriceRangeOnDelete,
  getPriceRange
};
