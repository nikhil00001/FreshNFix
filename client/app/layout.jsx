import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar'; // Import the Navbar
import Footer from '@/components/Footer'; // Import the new Footer
import { WishlistProvider } from '@/context/WishlistContext'; // Import WishlistProvider



const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FreshNFix',
  description: 'Groceries delivered fresh on fixed time',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <CartProvider>
          <WishlistProvider> {/* Wrap everything in WishlistProvider */}
            {/* This will provide wishlist context to all components */}
          <Navbar /> {/* Add the Navbar here */}
          <main>{children}</main> {/* Wrap page content in a main tag */}
          <Footer /> {/* Add the Footer here */}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );

}