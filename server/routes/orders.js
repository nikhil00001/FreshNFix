import express from 'express';
const router = express.Router();
import cognitoAuth from '../middleware/cognitoAuth.js';
import admin from '../middleware/admin.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// --- Place a new order ---
// Endpoint: POST /api/orders
// Access: Private
router.post('/', cognitoAuth, async (req, res) => {
  const { shippingAddress, fixedDeliverySlot } = req.body;

  try {
    const user = await User.findOne({ phone: req.user.phone }).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    const totalAmount = user.cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) + 50; // +50 for delivery

    const newOrder = new Order({
      user: req.user.id,
      // --- 💡 SOLUTION: Map cart items correctly, storing price and product ID ---
      items: user.cart.map(item => ({
        product: item.product._id, // Store only the ID
        quantity: item.quantity,
        price: item.product.price // Store the price at time of purchase
      })),
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


// ... existing POST '/' route ...

// --- Get orders for the logged-in user ---
// Endpoint: GET /api/orders/myorders
// Access: Private
router.get('/myorders', cognitoAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ... existing routes: POST '/', GET '/myorders' ...

// --- Get all orders (Admin Only) ---
// Endpoint: GET /api/orders/all
router.get('/all', [cognitoAuth, admin], async (req, res) => {
  try {
    // Populate user's name and email to show in the admin panel
    const orders = await Order.find().populate('user', 'name email').populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Update order status (Admin Only) ---
// Endpoint: PUT /api/orders/status/:id
router.put('/status/:id', [cognitoAuth, admin], async (req, res) => {
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;