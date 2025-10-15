import express from 'express';
const router = express.Router();
import cognitoAuth from '../middleware/cognitoAuth.js';
import admin from '../middleware/admin.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import dbConnect from '../lib/dbConnect.js';


// POST to place an order (Private)
router.post('/', cognitoAuth, async (req, res) => {
  await dbConnect();
  // 1. Destructure the new paymentMethod field from the request body
  const { shippingAddress, fixedDeliverySlot, paymentMethod } = req.body;

  // Basic validation
  if (!paymentMethod) {
    return res.status(400).json({ msg: 'Payment method is required' });
  }

  try {
    const user = await User.findOne({ phone: req.user.phone }).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty or user not found' });
    }

    const totalAmount = user.cart.reduce((acc, item) => {
      if (item.product && item.product.price) {
        return acc + item.product.price * item.quantity;
      }
      return acc;
    }, 40); // Hardcoded delivery fee (changed from 50 to 40 to match frontend)

    const newOrder = new Order({
      user: user._id,
      items: user.cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      shippingAddress,
      fixedDeliverySlot,
      // 2. Set the status and payment method based on the user's choice
      paymentMethod: paymentMethod,
      status: paymentMethod === 'UPI' ? 'Pending Payment' : 'Pending',
    });

    const order = await newOrder.save();
    
    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("POST /orders Error:", err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// GET user's own orders (Private)
router.get('/myorders', cognitoAuth, async (req, res) => {
  await dbConnect();
  try {
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("GET /myorders Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// --- Admin Routes ---

// GET all orders (Admin Only)
router.get('/all', [cognitoAuth, admin], async (req, res) => {
  await dbConnect();
  try {
    const orders = await Order.find().populate('user', 'name phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("GET /orders/all Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// PUT to update order status (Admin Only)
router.put('/status/:id', [cognitoAuth, admin], async (req, res) => {
  await dbConnect();
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error("PUT /orders/status Error:", err.message);
    res.status(500).send('Server Error');
  }
});

export default router;