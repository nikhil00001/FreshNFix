import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast'; // Import the Toaster
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar'; // Import the Navbar
import Footer from '@/components/Footer'; // Import the new Footer
import { WishlistProvider } from '@/context/WishlistContext'; // Import WishlistProvider
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';



const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FreshNFix',
  description: 'Groceries delivered fresh on fixed time',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
      <Toaster position="bottom-center" /> {/* Add the Toaster component here */}
        <AuthProvider> {/* Wrap everything in AuthProvider */}
          <CartProvider>
            <WishlistProvider> {/* Wrap everything in WishlistProvider */}
              <Navbar /> {/* Add the Navbar here */}
              <main>{children}</main> {/* Wrap page content in a main tag */}
              <Footer /> {/* Add the Footer here */}
              <AuthModal /> {/* Add the AuthModal here */}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );

}