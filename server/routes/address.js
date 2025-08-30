const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// --- Get all of a user's addresses ---
// Endpoint: GET /api/address
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Add a new address ---
// Endpoint: POST /api/address
router.post('/', auth, async (req, res) => {
  const { street, city, state, pincode, phone } = req.body;
  
  const newAddress = { street, city, state, pincode, phone };

  try {
    const user = await User.findById(req.user.id);
    user.addresses.unshift(newAddress); // Add to the beginning of the array
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Delete an address ---
// Endpoint: DELETE /api/address/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Find the index of the address to remove
    const removeIndex = user.addresses.findIndex(item => item.id === req.params.id);
    if (removeIndex === -1) {
        return res.status(404).json({ msg: 'Address not found' });
    }
    user.addresses.splice(removeIndex, 1);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;