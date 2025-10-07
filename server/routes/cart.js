import express from 'express';
const router = express.Router();
import cognitoAuth from '../middleware/cognitoAuth.js';
import User from '../models/User.js';

// This single file fixes all cart-related issues.

// GET user's cart (Used by the cart page)
router.get('/', cognitoAuth, async (req, res) => {
    try {
        // 💡 FIX: Find the user in MongoDB by their phone number from the Cognito token.
        const user = await User.findOne({ phone: req.user.phone }).populate('cart.product');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST to add an item to the cart
router.post('/add', cognitoAuth, async (req, res) => {
  const { productId, quantity } = req.body;
  
  try {
    // 💡 FIX: Find the user in MongoDB by their phone number.
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      // If item exists, update quantity
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      // If item doesn't exist, add new item
      user.cart.push({ product: productId, quantity });
    }
    
    await user.save();
    // Populate product details before sending back
    await user.populate('cart.product');
    res.json(user.cart);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST to update item quantity
router.post('/update', cognitoAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        // 💡 FIX: Find the user in MongoDB by their phone number.
        const user = await User.findOne({ phone: req.user.phone });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            user.cart[itemIndex].quantity = quantity;
            if (user.cart[itemIndex].quantity <= 0) {
                user.cart.splice(itemIndex, 1);
            }
        } else {
            return res.status(404).json({ msg: 'Item not found in cart' });
        }
        await user.save();
        await user.populate('cart.product');
        res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE to remove an item from the cart
router.delete('/remove/:productId', cognitoAuth, async (req, res) => {
    try {
        // 💡 FIX: Find the user in MongoDB by their phone number.
        const user = await User.findOne({ phone: req.user.phone });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
        
        await user.save();
        await user.populate('cart.product');
        res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
