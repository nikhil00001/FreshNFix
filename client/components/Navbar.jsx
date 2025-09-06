"use client";

import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import CartContext from '@/context/CartContext';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Import menu icons

export default function Navbar() {
  //hello this is pull request
  const { cartCount } = useContext(CartContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for the mobile menu

  useEffect(() => {
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
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            FreshNFix
          </Link>

          {/* --- Desktop Menu (hidden on mobile) --- */}
          <div className="hidden md:flex items-center space-x-6">
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

          {/* --- Mobile Menu Button (hamburger icon, hidden on desktop) --- */}
          <div className="md:hidden flex items-center">
            <Link href="/cart" className="relative p-2 mr-2">
              <ShoppingCartIcon className="h-6 w-6 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XMarkIcon className="h-7 w-7"/> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- Mobile Menu Panel (conditionally rendered) --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 flex flex-col space-y-4">
            {isLoggedIn ? (
              <>
                <Link href="/account" className="text-gray-800 hover:text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}