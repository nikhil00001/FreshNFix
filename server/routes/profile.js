import express from 'express';
const router = express.Router();
import cognitoAuth from '../middleware/cognitoAuth.js';
import User from '../models/User.js';
import dbConnect from '../lib/dbConnect.js';

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', cognitoAuth, async (req, res) => {
  await dbConnect();
  try {
    // Find user by phone from the token, but select only name and phone fields
    const user = await User.findOne({ phone: req.user.phone }).select('name phone');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/me
// @desc    Update current user's profile (specifically the name)
// @access  Private
router.put('/me', cognitoAuth, async (req, res) => {
  await dbConnect();
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Name is required' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { phone: req.user.phone },
      { $set: { name: name } },
      { new: true } // Return the updated document
    ).select('name phone');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;