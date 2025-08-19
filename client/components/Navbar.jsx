"use client";

import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import CartContext from '@/context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { cartCount } = useContext(CartContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // This effect now runs only on the client, preventing build errors
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    // Add sticky, top-0, z-50, shadow-sm and refine padding
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            FreshNFix
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/cart" className="relative p-2">
              <ShoppingCartIcon className="h-6 w-6 text-gray-600 hover:text-blue-600" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/account" className="text-gray-600 hover:text-blue-600 font-medium">
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}