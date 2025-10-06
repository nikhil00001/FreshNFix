import express from 'express';
const router = express.Router();
import cognitoAuth from '../middleware/cognitoAuth.js';
import User from '../models/User.js';

// --- Get user's wishlist ---
// Endpoint: GET /api/wishlist
router.get('/', cognitoAuth, async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.user.phone }).select('wishlist').populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Add/Remove an item from the wishlist (toggle) ---
// Endpoint: POST /api/wishlist/toggle/:productId
router.post('/toggle/:productId', cognitoAuth, async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.user.phone });
    const productId = req.params.productId;

    // Check if the product is already in the wishlist
    const index = user.wishlist.indexOf(productId);

    if (index === -1) {
      // If not present, add it
      user.wishlist.push(productId);
    } else {
      // If present, remove it
      user.wishlist.splice(index, 1);
    }
    
    await user.save();
    res.json(user.wishlist);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;