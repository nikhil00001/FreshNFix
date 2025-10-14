"use client";

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function useAuth() {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    isAdmin: false,
    user: null,
  });

  useEffect(() => {
    // This code only runs on the client side
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Check if the token is expired
        const isExpired = decodedToken.exp * 1000 < Date.now();
        
        if (!isExpired) {
          setAuth({
            isLoggedIn: true,
            // Check if the user's Cognito groups include 'Admins'
            isAdmin: decodedToken['cognito:groups']?.includes('Admins') || false,
            user: decodedToken,
          });
        } else {
          // If token is expired, clear it
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  return auth;
}