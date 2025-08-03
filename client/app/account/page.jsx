"use client";

import { useEffect, useState } from 'react';

export default function AccountPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/orders/myorders', {
          headers: { 'x-auth-token': token },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Loading your orders...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <h2 className="text-2xl font-semibold mb-4">Order History</h2>
      
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Order ID: <span className="font-normal text-gray-600">{order._id}</span></p>
                <p className={`px-3 py-1 text-sm rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.status}
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Ordered on: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <div>
                {order.items.map(item => (
                  <div key={item.product._id} className="flex justify-between items-center text-sm py-1">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-2 pt-2 text-right">
                <p className="font-bold">Total: ₹{order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}