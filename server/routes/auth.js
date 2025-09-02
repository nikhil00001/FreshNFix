const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js'); // 1. Import phone validator
const User = require('../models/User');
const { otpStore } = require('./otp'); // Import the otpStore


const router = express.Router();

// --- Register a new user (Handles Email and Phone) ---
router.post('/register', async (req, res) => {
  const { name, credential, method, password, otp } = req.body;

  try {
    let user;
    // 2. Validate and check for existing user based on the method
    if (method === 'email') {
      if (!validator.isEmail(credential)) {
        return res.status(400).json({ msg: 'Please enter a valid email address.' });
      }
      user = await User.findOne({ email: credential });
    } else if (method === 'phone') {
      const phoneNumber = parsePhoneNumberFromString(credential, 'IN'); // Assuming 'IN' for India
      if (!phoneNumber || !phoneNumber.isValid()) {
        return res.status(400).json({ msg: 'Please enter a valid phone number.' });
      }
      user = await User.findOne({ phone: phoneNumber.number });
    } else {
      return res.status(400).json({ msg: 'Invalid sign-up method.' });
    }

    if (user) {
      return res.status(400).json({ msg: 'User already exists with this credential.' });
    }

    // --- OTP Verification ---
    const storedOtpData = otpStore[phoneNumber.number];
    if (!storedOtpData || storedOtpData.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP.' });
    }
    if (Date.now() > storedOtpData.expires) {
      return res.status(400).json({ msg: 'OTP has expired.' });
    }
    // --- End of Verification ---

    // 3. Create the new user with the correct field
    const newUser = { name, password };
    if (method === 'email') {
      newUser.email = credential;
    } else {
      newUser.phone = credential;
    }

    user = new User(newUser);
    await user.save();
    res.status(201).json({ msg: 'User registered successfully!' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- Login a user (Handles Email and Phone) ---
router.post('/login', async (req, res) => {
    const { credential, password } = req.body;

    try {
        let query;
        // 4. Determine if credential is email or phone for the DB query
        if (validator.isEmail(credential)) {
            query = { email: credential };
        } else {
            const phoneNumber = parsePhoneNumberFromString(credential, 'IN');
            if (phoneNumber && phoneNumber.isValid()) {
                query = { phone: phoneNumber.number };
            } else {
                return res.status(400).json({ msg: 'Invalid credential format' });
            }
        }
        
        const user = await User.findOne(query);
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // ... JWT and password comparison logic remains the same ...
      // Compare submitted password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // If credentials are correct, create a JWT
      const payload = {
        user: {
          id: user.id, // This is the user's ID from the database
        },
      };
  
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' }, // Token expires in 5 hours
        (err, token) => {
          if (err) throw err;
          res.json({ token }); // Send the token back to the client
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;