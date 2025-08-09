const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth'); // Import auth middleware
const admin = require('../middleware/admin'); // Import admin middleware


// --- Get all products ---
// Endpoint: GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Create a new product (for admin use later) ---
// Endpoint: POST /api/products
router.post('/', async (req, res) => {
  const { name, description, price, category, unit, imageUrl, stock } = req.body;
  try {
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      unit,
      imageUrl,
      stock,
    });

    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;