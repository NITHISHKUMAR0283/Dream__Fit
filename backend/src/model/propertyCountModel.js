const mongoose = require("mongoose");

const propertyCountSchema = new mongoose.Schema({
  property: {
    type: String,
    required: true,
    enum: ["brand", "material", "category", "color"]
  },
  values: {
    type: Map,
    of: Number,
    default: {}
  }
});

module.exports = mongoose.model("PropertyCount", propertyCountSchema);