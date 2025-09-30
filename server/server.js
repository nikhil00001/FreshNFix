const express = require('express');
const cors = require('cors'); // To allow communication between frontend and backend
const mongoose = require('mongoose');
const { router: otpRouter } = require('./routes/otp');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5001; // We'll use port 5001 for the backend


// --- 💡 SOLUTION: Configure CORS to only allow your frontend URL ---
// List of allowed origins
const allowedOrigins = [
  'https://fresh-n-fix.vercel.app', // Your deployed frontend
  'http://localhost:3000'           // Your local development frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  optionsSuccessStatus: 200 // For legacy browser support
};
// Middleware
app.use(cors(corsOptions)); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow server to accept JSON data in requests

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch(err => console.error("MongoDB connection error:", err));
  // --- End of Connection ---


app.use('/api/auth', require(path.join(__dirname, 'routes', 'auth')));
app.use('/api/products', require(path.join(__dirname, 'routes', 'products')));
app.use('/api/cart', require(path.join(__dirname, 'routes', 'cart')));
app.use('/api/orders', require(path.join(__dirname, 'routes', 'orders')));
app.use('/api/wishlist', require(path.join(__dirname, 'routes', 'wishlist')));
app.use('/api/address', require(path.join(__dirname, 'routes', 'address')));
app.use('/api/otp', otpRouter);



// A simple test route to make sure the server is running
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the FreshNFix API! 🚀" });
});
// --- 💡 SOLUTION: Instead of app.listen(), export the app for Vercel ---
module.exports = app;