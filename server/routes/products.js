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


// --- Search for products ---
// Endpoint: GET /api/products/search?q=your_query
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    // Create a case-insensitive regular expression
    const regex = new RegExp(query, 'i');

    const products = await Product.find({
      // Search in both name and description fields
      $or: [{ name: regex }, { description: regex }],
    });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ... existing GET '/' and POST '/' routes ...

// --- Get a single product by ID (Public) ---
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Update a product (Admin Only) ---
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Delete a product (Admin Only) ---
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ... existing routes ...

// --- Get products by category ---
// Endpoint: GET /api/products/category/:categoryName
router.get('/category/:categoryName', async (req, res) => {
  try {
    // Create a case-insensitive regular expression from the URL parameter
    const categoryRegex = new RegExp(`^${req.params.categoryName}$`, 'i');
    
    const products = await Product.find({ category: categoryRegex });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ... existing routes ...

// --- Reorder products (Admin Only) ---
// Endpoint: POST /api/products/reorder
router.post('/reorder', [auth, admin], async (req, res) => {
  const { orderedIds } = req.body; // Expecting an array of product IDs in the new order

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ msg: 'Invalid data format.' });
  }

  try {
    // Create an array of update operations
    const updatePromises = orderedIds.map((id, index) => {
      return Product.findByIdAndUpdate(id, { position: index });
    });

    // Execute all update operations in parallel
    await Promise.all(updatePromises);

    res.json({ msg: 'Product order updated successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;