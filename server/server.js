// --- 💡 FIX 1: Convert all `require` to `import` ---
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// --- 💡 FIX 2: Import all your route files using the `import` syntax ---
import { startAuth, verifyOtp } from './routes/auth.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import wishlistRouter from './routes/wishlist.js';
import addressRouter from './routes/address.js';
import profile from './routes/profile.js'; // 1. Import the new route

// --- This line initializes your environment variables ---
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Your CORS and middleware setup is correct, no changes needed here.
const allowedOrigins = [
  'https://fresh-n-fix.vercel.app',
  'http://localhost:3000'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch(err => console.error("MongoDB connection error:", err));

// --- 💡 FIX 3: Register all your imported routers ---
// New Cognito auth routes
app.post('/api/auth/start', startAuth);
app.post('/api/auth/verify', verifyOtp);
app.use('/api/profile', profile); // 2. Add this line
// The rest of your application routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/address', addressRouter);

// A simple test route to make sure the server is running
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the FreshNFix API! 🚀" });
});

// For Vercel deployment, we export the app instead of listening.
// If you want to run it locally, you can add app.listen(PORT, ...)/
// aauga vauga
export default app;
