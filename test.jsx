"use client";

import Link from 'next/link';
import { useContext } from 'react';
import useAuth from '@/hooks/useAuth'; // 1. Import our new hook
import CartContext from '@/context/CartContext';
import AuthContext from '@/context/AuthContext';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { cartCount } = useContext(CartContext);
  const { openAuthModal } = useContext(AuthContext);
  
  // 2. Use the new hook to get the user's login and admin status
  const { isLoggedIn, isAdmin } = useAuth(); 
  
  // The isMenuOpen state remains the same
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            FreshNFix
          </Link>

          {/* --- Desktop Menu --- */}
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
                {/* 3. Conditionally render the Admin Panel button */}
                {isAdmin && (
                  <Link href="/admin/products" className="font-semibold text-red-600 hover:text-red-700">
                    Admin Panel
                  </Link>
                )}
                <Link href="/wishlist" className="text-gray-600 hover:text-blue-600 font-medium">
                  Wishlist
                </Link>
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
              <button onClick={openAuthModal} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Login
              </button>
            )}
          </div>

          {/* --- Mobile Menu (also updated) --- */}
          <div className="md:hidden flex items-center">
            {/* ... cart icon */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XMarkIcon className="h-7 w-7"/> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- Mobile Menu Panel (also updated) --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 flex flex-col space-y-4">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin/products" className="font-semibold text-red-600 hover:text-red-700" onClick={() => setIsMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <Link href="/wishlist" /* ... */>Wishlist</Link>
                <Link href="/account" /* ... */>My Account</Link>
                <button onClick={handleLogout} /* ... */>Logout</button>
              </>
            ) : (
              <button onClick={() => { openAuthModal(); setIsMenuOpen(false); }} /* ... */>
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}