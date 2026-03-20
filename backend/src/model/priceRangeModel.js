const mongoose = require("mongoose");

const priceRangeSchema = new mongoose.Schema({
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("PriceRange", priceRangeSchema);