const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

// --- Place a new order ---
// Endpoint: POST /api/orders
// Access: Private
router.post('/', auth, async (req, res) => {
  const { shippingAddress, fixedDeliverySlot } = req.body;

  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    const totalAmount = user.cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) + 50; // +50 for delivery

    const newOrder = new Order({
      user: req.user.id,
      items: user.cart.map(item => ({ product: item.product, quantity: item.quantity })),
      totalAmount,
      shippingAddress,
      fixedDeliverySlot,
    });

    const order = await newOrder.save();
    
    // Clear the user's cart
    user.cart = [];
    await user.save();

    res.status(201).json(order);

  } catch (err) {
     console.error("Order placement error:", err); // Log the full error for your reference
     // Send back the specific validation message from the database
     res.status(400).json({ msg: err.message });
    }

});

module.exports = router;