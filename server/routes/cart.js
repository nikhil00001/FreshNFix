import express from 'express';
const router = express.Router();
import cognitoAuth from '../middleware/cognitoAuth.js';
import User from '../models/User.js';

// --- Add an item to the cart ---
// Endpoint: POST /api/cart/add
// Access: Private (requires token)
router.post('/add', cognitoAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    
    try {User.findOne({ phone: req.user.phone });
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
        const populatedUser = await User.findOne({ phone: req.user.phone }).populate('cart.product');

        res.json(populatedUser.cart); // <-- Send the FULLY POPULATED cart back

    
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Get user's cart ---
// Endpoint: GET /api/cart
// Access: Private
router.get('/', cognitoAuth, async (req, res) => {
    try {
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

// ... existing GET and POST /add routes ...

// --- Update item quantity ---
// Endpoint: POST /api/cart/update
// Access: Private
router.post('/update', cognitoAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const user = await User.findOne({ phone: req.user.phone });
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
        const populatedCart = await User.findOne({ phone: req.user.phone }).populate('cart.product');
        res.json(populatedCart.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Remove item from cart ---
// Endpoint: DELETE /api/cart/remove/:productId
// Access: Private
router.delete('/remove/:productId', cognitoAuth, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user.id },
            { $pull: { cart: { product: req.params.productId } } }
        );
        const populatedCart = await User.findOne({ phone: req.user.phone }).populate('cart.product');
        res.json(populatedCart.cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


export default router;