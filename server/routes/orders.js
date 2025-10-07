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
  const { shippingAddress, fixedDeliverySlot } = req.body;

  try {
    // 💡 FIX: Find the user in MongoDB by their phone number from the Cognito token.
    const user = await User.findOne({ phone: req.user.phone }).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty or user not found' });
    }

    const totalAmount = user.cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) + 50;

    const newOrder = new Order({
      user: user._id, // Use the MongoDB user ID
      items: user.cart.map(item => ({ product: item.product, quantity: item.quantity })),
      totalAmount,
      shippingAddress,
      fixedDeliverySlot,
    });

    const order = await newOrder.save();
    
    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("POST /orders Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// GET user's own orders (Private)
router.get('/myorders', cognitoAuth, async (req, res) => {
  await dbConnect();
  try {
    // 💡 FIX: Find the user by phone first to get their MongoDB _id.
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    // Now, find orders using the correct MongoDB user _id.
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
