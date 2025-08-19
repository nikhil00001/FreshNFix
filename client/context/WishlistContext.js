"use client";

import { createContext, useState, useEffect, useContext } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/wishlist', {
            headers: { 'x-auth-token': token },
          });
          if (res.ok) {
            const data = await res.json();
            // Store just the IDs for easy lookup
            setWishlist(data.map(item => item._id));
          }
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
        }
      }
    };
    fetchWishlist();
  }, []);

  const toggleWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to manage your wishlist.');
        return;
    }

    try {
        const res = await fetch(`/api/wishlist/toggle/${productId}`, {
            method: 'POST',
            headers: { 'x-auth-token': token }
        });
        if (res.ok) {
            const updatedWishlist = await res.json();
            setWishlist(updatedWishlist);
        }
    } catch (error) {
        console.error('Failed to toggle wishlist:', error);
    }
  };

  const isProductInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isProductInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;