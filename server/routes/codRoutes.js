import express from 'express';
import cognitoAuth from '../middleware/cognitoAuth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import dbConnect from '../lib/dbConnect.js';

const router = express.Router();

/**
 * @route   POST /api/cod/place-order
 * @desc    Create a new Cash on Delivery order
 * @access  Private
 */
router.post('/place-order', cognitoAuth, async (req, res) => {
  await dbConnect();
  const { shippingAddress, fixedDeliverySlot } = req.body;

  try {
    // 1. Get user and cart data from the database
    const user = await User.findOne({ phone: req.user.phone }).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty or user not found' });
    }

    // 2. Calculate the total amount (matches your frontend)
    const totalAmount = user.cart.reduce((acc, item) => {
      if (item.product && item.product.price) {
        return acc + item.product.price * item.quantity;
      }
      return acc;
    }, 40); // 40 is your delivery fee

    // 3. Create the new order with COD-specific details
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
      paymentMethod: 'COD',
      paymentStatus: 'Pending', // Payment is pending until delivery
      status: 'Processing',    // The order itself is being processed
      // razorpay fields will be empty
    });

    // 4. Save the order to the database
    await newOrder.save();

    // 5. Clear the user's cart
    user.cart = [];
    await user.save();

    // 6. Send the new order back to the frontend
    res.status(201).json(newOrder); 
  } catch (error) {
    console.error('Error creating COD order:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;

