"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/solid';

// This is a self-contained component for a single, sortable table row.
// It handles all the specific logic for being a draggable item.
function SortableProductRow({ product, handleDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          {/* This button is the handle for dragging */}
          <button {...listeners} className="p-1 cursor-grab active:cursor-grabbing mr-3">
            <Bars3Icon className="h-5 w-5 text-gray-400" />
          </button>
          <p className="text-gray-900 whitespace-no-wrap">{product.name}</p>
        </div>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">₹{product.price}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{product.stock}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
        <Link href={`/admin/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900">
          Edit
        </Link>
        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 ml-4">
          Delete
        </button>
      </td>
    </tr>
  );
}

// This is the main component for the entire page.
export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);

  // Fetch all products when the page loads.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          toast.error('Could not fetch products.');
        }
      } catch (error) {
        toast.error('Failed to fetch products.');
      }
    };
    fetchProducts();
  }, []);

  // Function to handle deleting a product.
  const handleDelete = async (productId) => {
    // We use window.confirm instead of a custom modal here for simplicity.
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });

      if (res.ok) {
        setProducts(products.filter(p => p._id !== productId));
        toast.success('Product deleted successfully!');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to delete product');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // Function that runs when you stop dragging an item.
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Update the UI immediately for a smooth experience.
      const oldIndex = products.findIndex((p) => p._id === active.id);
      const newIndex = products.findIndex((p) => p._id === over.id);
      const newOrder = arrayMove(products, oldIndex, newIndex);
      setProducts(newOrder);

      // Send the new order to the backend to save it in the database.
      const orderedIds = newOrder.map(p => p._id);
      const token = localStorage.getItem('token');
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/products/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify({ orderedIds }),
        });
        if (!res.ok) throw new Error('Failed to save order.');
        toast.success('Product order saved!');
      } catch (error) {
        toast.error('Could not save new order.');
        // If the save fails, you could optionally revert the UI change here.
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link href="/admin/products/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add New Product
          </button>
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* The DndContext component provides the drag-and-drop functionality */}
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
              {/* The SortableContext tells dnd-kit that the items inside can be reordered */}
              <SortableContext items={products.map(p => p._id)} strategy={verticalListSortingStrategy}>
                {products.map(product => (
                  <SortableProductRow key={product._id} product={product} handleDelete={handleDelete} />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
