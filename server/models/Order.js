const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: { type: Object, required: true },
    quantity: { type: Number, required: true },
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  status: {
    type: String,
    default: 'Pending', // e.g., Pending, Processing, Shipped, Delivered
  },
  paymentStatus: {
    type: String,
    default: 'Paid', // Assuming payment is successful
  },
  fixedDeliverySlot: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);