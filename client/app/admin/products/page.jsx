"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';


// This would be a more robust check in a real app, maybe in a layout or middleware
const useAdminAuth = () => {
    // This is a placeholder for a real auth check
    // In a real app, you would decode the JWT and check the role
    const [isAdmin, setIsAdmin] = useState(true); 
    return isAdmin;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const isAdmin = useAdminAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  // ... existing useEffect and other code ...

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      // --- 💡 FIX: Use the full API URL ---
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });

      if (res.ok) {
        // Remove the product from the state to update the UI instantly
        setProducts(products.filter(p => p._id !== productId));
        alert('Product deleted successfully!');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to delete product');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (!isAdmin) {
    return <p className="text-center mt-8 text-red-500">Access Denied.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        {/* Wrap the button in a Link component */}
        <Link href="/admin/products/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add New Product
          </button>
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{product.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">₹{product.price}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{product.stock}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  {/* UPDATE THE EDIT BUTTON TO A LINK */}
                  <Link href={`/admin/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </Link>
                  {/* ADD ONCLICK TO THE DELETE BUTTON */}
                  <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 ml-4">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}