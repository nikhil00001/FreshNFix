import express from 'express';
const router = express.Router();
import cognitoAuth from '../middleware/cognitoAuth.js';
import User from '../models/User.js';
import dbConnect from '../lib/dbConnect.js';

// This single file fixes all current and potential cart-related issues.

// GET user's cart (Used by the cart page)
router.get('/', cognitoAuth, async (req, res) => {
    try {
        await dbConnect();
        // 💡 FIX 1: Find the user in MongoDB by their phone number from the Cognito token.
        const user = await User.findOne({ phone: req.user.phone }).populate('cart.product');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // 💡 FIX 2: Add a safety check to filter out deleted products.
        // This prevents the cart page from crashing if a product was removed from the store.
        const validCartItems = user.cart.filter(item => item.product !== null);

        // If we found and removed invalid items, update the user's cart in the database.
        if (validCartItems.length !== user.cart.length) {
            user.cart = validCartItems;
            await user.save();
        }

        res.json(validCartItems);
    } catch (err) {
        console.error("GET /cart Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// POST to add an item to the cart
router.post('/add', cognitoAuth, async (req, res) => {
  const { productId, quantity } = req.body;
  
  try {
    await dbConnect();
    // 💡 FIX 1: Find the user by their phone number.
    const user = await User.findOne({ phone: req.user.phone });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }
    
    await user.save();
    await user.populate('cart.product');
    res.json(user.cart);

  } catch (err) {
    console.error("POST /cart/add Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// POST to update item quantity
router.post('/update', cognitoAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        await dbConnect();
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
        console.error("POST /cart/update Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE to remove an item from the cart
router.delete('/remove/:productId', cognitoAuth, async (req, res) => {
    try {
        await dbConnect();
        const user = await User.findOne({ phone: req.user.phone });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
        
        await user.save();
        await user.populate('cart.product');
        res.json(user.cart);
    } catch (err) {
        console.error("DELETE /cart/remove Error:", err.message);
        res.status(500).send('Server Error');
    }
});

export default router;

