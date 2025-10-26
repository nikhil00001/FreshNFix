import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import cognitoAuth from '../middleware/cognitoAuth.js';
import User from '../models/User.js';
import Order from '../models/Order.js'; // We'll create the order here
import dbConnect from '../lib/dbConnect.js';

const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @route   POST /api/payment/create-order
 * @desc    Create a new Razorpay order
 * @access  Private
 */
router.post('/create-order', cognitoAuth, async (req, res) => {
  await dbConnect();
  try {
    const user = await User.findOne({ phone: req.user.phone }).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Calculate total amount from the user's cart
    const totalAmountInRs = user.cart.reduce((acc, item) => {
      if (item.product && item.product.price) {
        return acc + item.product.price * item.quantity;
      }
      return acc;
    }, 40); // 40 is your delivery fee

    const amountInPaise = Math.round(totalAmountInRs * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * @route   POST /api/payment/verify-payment
 * @desc    Verify payment and create order in DB
 * @access  Private
 */
router.post('/verify-payment', cognitoAuth, async (req, res) => {
  await dbConnect();
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    shippingAddress,
    fixedDeliverySlot
  } = req.body;

  try {
    // 1. Verify the signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: 'Payment verification failed. Invalid signature.' });
    }

    // 2. Signature is valid. Get user and cart data to create the order.
    const user = await User.findOne({ phone: req.user.phone }).populate('cart.product');
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty or user not found' });
    }

    const totalAmount = user.cart.reduce((acc, item) => {
      if (item.product && item.product.price) {
        return acc + item.product.price * item.quantity;
      }
      return acc;
    }, 40); // 40 is your delivery fee

    // 3. Create and save the new order in your database
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
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      status: 'Processing', // Or 'Pending' if you want manual approval
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    await newOrder.save();

    // 4. Clear the user's cart
    user.cart = [];
    await user.save();

    res.status(201).json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ msg: 'Server Error' });
  }
});


// --- NEW ROUTE FOR CASH ON DELIVERY ---
/**
 * @route   POST /api/payment/create-cod-order
 * @desc    Create a new order for Cash on Delivery
 * @access  Private
 */
router.post('/create-cod-order', cognitoAuth, async (req, res) => {
    await dbConnect();
    const { shippingAddress, fixedDeliverySlot } = req.body;

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
        }, 40); // 40 is your delivery fee

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
            paymentStatus: 'Pending',
            status: 'Processing',
        });

        await newOrder.save();

        user.cart = [];
        await user.save();

        res.status(201).json({ success: true, orderId: newOrder._id });
    } catch (error) {
        console.error('Error creating COD order:', error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;

