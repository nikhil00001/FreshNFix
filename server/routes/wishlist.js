const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// --- Get user's wishlist ---
// Endpoint: GET /api/wishlist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist').populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Add/Remove an item from the wishlist (toggle) ---
// Endpoint: POST /api/wishlist/toggle/:productId
router.post('/toggle/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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

module.exports = router;