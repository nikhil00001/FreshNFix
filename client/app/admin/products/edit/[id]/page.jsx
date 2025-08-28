"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const [product, setProduct] = useState({ name: '', description: '', price: '', stock: '', category: '', unit: '', imageUrl: '' });
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        // --- 💡 FIX: Use the full API URL ---
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    // Add this line to see the token in the browser's console
  console.log('Token being sent for EDIT:', token);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        alert('Product updated successfully!');
        router.push('/admin/products');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to update product');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required className="w-full p-2 border rounded" />
        <textarea name="description" value={product.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 border rounded"></textarea>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="number" name="price" value={product.price} onChange={handleChange} placeholder="Price" required className="w-full p-2 border rounded" />
          <input type="number" name="stock" value={product.stock} onChange={handleChange} placeholder="Stock Quantity" required className="w-full p-2 border rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="category" value={product.category} onChange={handleChange} placeholder="Category" required className="w-full p-2 border rounded" />
          <input type="text" name="unit" value={product.unit} onChange={handleChange} placeholder="Unit" required className="w-full p-2 border rounded" />
        </div>
        <input type="text" name="imageUrl" value={product.imageUrl} onChange={handleChange} placeholder="Image URL" required className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Update Product</button>
      </form>
    </div>
  );
}