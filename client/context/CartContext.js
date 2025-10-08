"use client";

import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  // --- 💡 CHANGE 1: Add a loading state, default to true ---
  const [loading, setLoading] = useState(true); 

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Fetch the cart when the component mounts
  useEffect(() => {
    const fetchCart = async () => {
      // --- 💡 CHANGE 2: Ensure loading is true at the start ---
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
          // Optional: Show a toast error if cart fetching fails
          // toast.error("Could not load your cart.");
        }
      }
      // --- 💡 CHANGE 3: Set loading to false after everything is done ---
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
        toast.success('Item added to cart!');
      } else {
        throw new Error('Failed to add item');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Could not add item to cart.');
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
    setCart([]); // Simply set the cart state to an empty array
  };
  
  return (
    // --- 💡 CHANGE 4: Add loading to the provider's value ---
    <CartContext.Provider value={{ cart, loading, cartCount, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
  
export default CartContext;
