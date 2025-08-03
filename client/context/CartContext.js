"use client";

import { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Fetch the cart when the component mounts
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('http://localhost:5001/api/cart', {
            headers: { 'x-auth-token': token },
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data);
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to add items to your cart.');
        return;
    }
    try {
        const res = await fetch('http://localhost:5001/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        if (res.ok) {
            const updatedCart = await res.json();
            setCart(updatedCart); // Update the cart state with the response from the server
            alert('Item added to cart!');
        } else {
          throw new Error('Failed to add item');
        }
    } catch (error) {
        console.error('Failed to add to cart:', error);
        alert('Could not add item to cart.');
    }
  };
  
    const updateQuantity = async (productId, quantity) => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5001/api/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
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
        const res = await fetch(`http://localhost:5001/api/cart/remove/${productId}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token },
        });
        if (res.ok) {
          const updatedCart = await res.json();
          setCart(updatedCart);
        }
      } catch (error) {
        console.error('Failed to remove item:', error);
      }
    };
  
    return (
      <CartContext.Provider value={{ cart, cartCount, addToCart, updateQuantity, removeFromCart }}>
        {children}
      </CartContext.Provider>
    );
  };
  
export default CartContext;