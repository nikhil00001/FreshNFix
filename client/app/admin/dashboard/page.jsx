"use client";

import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Products Card */}
        <Link href="/admin/products" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Manage Products</h2>
          <p className="font-normal text-gray-600">View, add, edit, and delete products in your store.</p>
        </Link>

        {/* Manage Orders Card */}
        <Link href="/admin/orders" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition-colors">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Manage Orders</h2>
          <p className="font-normal text-gray-600">View and update the status of all customer orders.</p>
        </Link>
      </div>
    </div>
  );
}