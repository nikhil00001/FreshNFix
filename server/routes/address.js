import express from 'express';
const router = express.Router();
import cognitoAuth from '../middleware/cognitoAuth.js';
import User from '../models/User.js';
import dbConnect from '../lib/dbConnect.js';

// --- Get all of a user's addresses ---
// Endpoint: GET /api/address
router.get('/', cognitoAuth, async (req, res) => {
  try {
    await dbConnect();
    const user = await User.findOne({ phone: req.user.phone }).select('addresses');
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Add a new address ---
// Endpoint: POST /api/address
router.post('/', cognitoAuth, async (req, res) => {
  const { street, city, state, pincode, phone } = req.body;
  
  const newAddress = { street, city, state, pincode, phone };

  try {
    await dbConnect();
    const user = await User.findOne({ phone: req.user.phone });
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
router.delete('/:id', cognitoAuth, async (req, res) => {
  try {
    await dbConnect();
    const user = await User.findOne({ phone: req.user.phone });
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


export default router;