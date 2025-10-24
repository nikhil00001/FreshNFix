import mongoose from 'mongoose';
    
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
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
    enum: ['Pending', 'Pending Payment', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  // --- NEW & UPDATED PAYMENT FIELDS ---
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  razorpay_payment_id: {
    type: String,
  },
  razorpay_order_id: {
    type: String,
  },
  razorpay_signature: {
    type: String,
  },
  // ------------------------------------
  fixedDeliverySlot: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
export default Order;

