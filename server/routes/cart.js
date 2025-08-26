const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import our auth middleware
const User = require('../models/User');

// --- Add an item to the cart ---
// Endpoint: POST /api/cart/add
// Access: Private (requires token)
router.post('/add', auth, async (req, res) => {
    const { productId, quantity } = req.body;
    
    try {
        const user = await User.findById(req.user.id);
        const cartItemIndex = user.cart.findIndex(item => item.product == productId);
        
        if (cartItemIndex > -1) {
            // If item exists, update quantity
            user.cart[cartItemIndex].quantity += quantity;
        } else {
            // If item doesn't exist, add new item
            user.cart.push({ product: productId, quantity });
        }
        
        await user.save();
        // --- 💡 SOLUTION: Find the user again and populate the cart ---
        const populatedUser = await User.findById(req.user.id).populate('cart.product');

        res.json(populatedUser.cart); // <-- Send the FULLY POPULATED cart back

    
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Get user's cart ---
// Endpoint: GET /api/cart
// Access: Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cart.product');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ... existing GET and POST /add routes ...

// --- Update item quantity ---
// Endpoint: POST /api/cart/update
// Access: Private
router.post('/update', auth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const itemIndex = user.cart.findIndex(item => item.product == productId);

        if (itemIndex > -1) {
            user.cart[itemIndex].quantity = quantity;
            if (user.cart[itemIndex].quantity <= 0) {
                user.cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
            }
        } else {
            return res.status(404).json({ msg: 'Item not found in cart' });
        }
        await user.save();
        const populatedCart = await User.findById(req.user.id).populate('cart.product');
        res.json(populatedCart.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Remove item from cart ---
// Endpoint: DELETE /api/cart/remove/:productId
// Access: Private
router.delete('/remove/:productId', auth, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user.id },
            { $pull: { cart: { product: req.params.productId } } }
        );
        const populatedCart = await User.findById(req.user.id).populate('cart.product');
        res.json(populatedCart.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;