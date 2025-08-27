const express = require('express');
const cors = require('cors'); // To allow communication between frontend and backend
const mongoose = require('mongoose');
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

  // --- Define Routes ---
app.use('/api/auth', require('./routes/auth')); // Add this line
app.use('/api/products', require('./routes/products')); // Add this line
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
// ... after other app.use statements
app.use('/api/wishlist', require('./routes/wishlist'));


// A simple test route to make sure the server is running
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the FreshNFix API! 🚀" });
});

// We will add our /api/auth/register and /api/auth/login routes here later

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});