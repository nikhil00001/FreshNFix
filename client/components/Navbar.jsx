"use client";

import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import CartContext from '@/context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline'; // A nice icon pack

export default function Navbar() {
  const { cartCount } = useContext(CartContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/login'; // Redirect to login after logout
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            FreshNFix
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/cart" className="relative">
              <ShoppingCartIcon className="h-7 w-7 text-gray-600 hover:text-blue-600" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}