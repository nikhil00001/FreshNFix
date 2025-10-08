import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  phone: { 
    type: String, 
    required: true ,
    unique: true
  }, // Add the phone field
  email: {
    type: String,
    unique: true,
    sparse: true // Allows multiple docs with null email
  },
  
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  addresses: [
    {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    }
  ],
  cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1
        }
      }
    ],
    // Add this new wishlist field:
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
  }, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// This function runs BEFORE a user document is saved to the database
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  // Hash the password with a cost factor of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);
export default User;