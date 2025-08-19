import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar'; // Import the Navbar
import Footer from '@/components/Footer'; // Import the new Footer


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
          <Navbar /> {/* Add the Navbar here */}
          <main>{children}</main> {/* Wrap page content in a main tag */}
          <Footer /> {/* Add the Footer here */}
        </CartProvider>
      </body>
    </html>
  );

}