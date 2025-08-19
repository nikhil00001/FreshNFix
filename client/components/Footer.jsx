import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/category/fruits-vegetables" className="text-gray-600 hover:text-blue-600">Fruits & Vegetables</Link></li>
              <li><Link href="/category/dairy-eggs" className="text-gray-600 hover:text-blue-600">Dairy & Eggs</Link></li>
              <li><Link href="/category/bakery" className="text-gray-600 hover:text-blue-600">Bakery</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">About Us</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-blue-600">Our Story</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
              <li><Link href="/shipping" className="text-gray-600 hover:text-blue-600">Shipping Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">FreshNFix</h3>
            <p className="text-gray-600">Your daily groceries, delivered fresh and on time.</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} FreshNFix. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}