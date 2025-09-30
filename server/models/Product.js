import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  unit: { // e.g., 'kg', 'litre', 'pack'
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  // Add this new field:
  tag: { 
    type: String, 
    trim: true }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
export default Product;
