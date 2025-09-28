/*const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js'); // 1. Import phone validator
const User = require('../models/User');
const { otpStore } = require('./otp'); // Import the otpStore


const router = express.Router();
*/
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const twilio = require('twilio');
const User = require('../models/User');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const otpStore = {}; // Temporary in-memory store

// --- Step 1: Send Login/Sign-up OTP ---
router.post('/login-otp', async (req, res) => {
  const { phone } = req.body;
  const phoneNumber = parsePhoneNumberFromString(phone, 'IN');

  if (!phoneNumber || !phoneNumber.isValid()) {
    return res.status(400).json({ msg: 'Invalid phone number format.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    // Uncomment this for production to send real SMS
    // await client.messages.create({
    //   body: `Your FreshNFix verification code is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber.number
    // });
    
    console.log(`OTP for ${phoneNumber.number} is: ${otp}`); // For testing without sending SMS

    otpStore[phoneNumber.number] = { otp, expires: Date.now() + 300000 }; // Expires in 5 mins
    res.status(200).json({ msg: 'OTP sent successfully.' });

  } catch (error) {
    console.error('Twilio Error:', error);
    res.status(500).json({ msg: 'Failed to send OTP.' });
  }
});

// --- Step 2: Verify OTP and Log In / Sign Up ---
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const phoneNumber = parsePhoneNumberFromString(phone, 'IN');

  if (!phoneNumber || !phoneNumber.isValid()) {
    return res.status(400).json({ msg: 'Invalid phone number.' });
  }

  const storedOtpData = otpStore[phoneNumber.number];
  if (!storedOtpData || storedOtpData.otp !== otp || Date.now() > storedOtpData.expires) {
    return res.status(400).json({ msg: 'Invalid or expired OTP.' });
  }

  try {
    delete otpStore[phoneNumber.number]; // OTP is used, delete it

    // Find user or create a new one
    let user = await User.findOne({ phone: phoneNumber.number });
    if (!user) {
      user = new User({ phone: phoneNumber.number });
      await user.save();
    }
    
    // Create JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;