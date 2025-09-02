const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const User = require('../models/User');

// --- SOLUTION: VALIDATE ENV VARS BEFORE INITIALIZING TWILIO ---
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Check if the credentials are provided
if (!accountSid || !authToken) {
  // Log a clear error message. This helps massively with debugging.
  console.error('FATAL ERROR: Twilio credentials (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN) are not set in the environment variables.');
  // In a real app, you might want to stop the server from starting,
  // but for now, we'll prevent the client from being initialized improperly.
}

// Initialize Twilio client ONLY if credentials exist.
//const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// --- Store OTPs temporarily (in a real app, use Redis or a database) ---
const otpStore = {};

// --- Send OTP to a phone number ---
// Endpoint: POST /api/otp/send
router.post('/send', async (req, res) => {
  const { phone } = req.body;
  
  const phoneNumber = parsePhoneNumberFromString(phone, 'IN');
  if (!phoneNumber || !phoneNumber.isValid()) {
    return res.status(400).json({ msg: 'Invalid phone number format.' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ phone: phoneNumber.number });
  if (existingUser) {
    return res.status(400).json({ msg: 'A user with this phone number already exists.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  
  try {
    await client.messages.create({
      body: `Your FreshNFix verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber.number
    });

    // Store the OTP with the phone number, with an expiry time (e.g., 5 minutes)
    otpStore[phoneNumber.number] = { otp, expires: Date.now() + 300000 }; 
    res.status(200).json({ msg: 'OTP sent successfully.' });

  } catch (error) {
    console.error('Twilio Error:', error);
    res.status(500).json({ msg: 'Failed to send OTP.' });
  }
});

module.exports = { router, otpStore }; // Export both router and the store