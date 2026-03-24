const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
      type: Number,
      unique: true,
      required: true,
    },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title: String,
      price: Number,
      quantity: Number,
      variant: Object,
    }
  ],
  user: {
    name: String,
    email: String,
    address: String,
    phone: String,
  },
  paymentMethod: {
    type: String,
    enum: ['COD'],
    default: 'COD',
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Order', orderSchema);
