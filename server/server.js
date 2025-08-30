const express = require('express');
const cors = require('cors'); // To allow communication between frontend and backend
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5001; // We'll use port 5001 for the backend


// --- 💡 SOLUTION: Configure CORS to only allow your frontend URL ---
const corsOptions = {
  origin: 'https://fresh-n-fix.vercel.app', // Your exact frontend URL
  optionsSuccessStatus: 200 // For legacy browser support
};
// Middleware
app.use(cors(corsOptions)); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow server to accept JSON data in requests

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully!"))
  .catch(err => console.error("MongoDB connection error:", err));
  // --- End of Connection ---


app.use('/api/auth', require(path.join(__dirname, 'routes', 'auth')));
app.use('/api/products', require(path.join(__dirname, 'routes', 'products')));
app.use('/api/cart', require(path.join(__dirname, 'routes', 'cart')));
app.use('/api/orders', require(path.join(__dirname, 'routes', 'orders')));
app.use('/api/wishlist', require(path.join(__dirname, 'routes', 'wishlist')));
app.use('/api/address', require(path.join(__dirname, 'routes', 'address')));



// A simple test route to make sure the server is running
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the FreshNFix API! 🚀" });
});

// We will add our /api/auth/register and /api/auth/login routes here later


// --- 💡 SOLUTION: Instead of app.listen(), export the app for Vercel ---
module.exports = app;