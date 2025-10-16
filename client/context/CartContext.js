"use client";

import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const res = await fetch(`${apiUrl}/api/cart`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data);
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      }
      setLoading(false);
    };
    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart);
        // We show the toast only when adding the *first* item
        const itemInCart = cart.find(item => item.product._id === productId);
        if (!itemInCart) {
            toast.success('Item added to cart!');
        }
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Could not add item to cart.');
    }
  };

  // --- NEW: Function to decrement quantity or remove item ---
  const decrementFromCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Find the current quantity to decide which endpoint to call
    const itemInCart = cart.find(item => item.product._id === productId);
    if (!itemInCart) return;

    if (itemInCart.quantity === 1) {
      // If quantity is 1, removing it is the same as decrementing
      await removeFromCart(productId);
    } else {
      // Otherwise, just update the quantity
      await updateQuantity(productId, itemInCart.quantity - 1);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const token = localStorage.getItem('token');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/cart/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    // --- Add the new 'decrementFromCart' function to the context value ---
    <CartContext.Provider value={{ cart, loading, cartCount, addToCart, decrementFromCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
