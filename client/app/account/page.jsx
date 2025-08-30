{/*"use client";

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
        // --- 💡 FIX: Use the full API URL from the environment variable ---
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/orders/myorders`, {
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
}*/}







"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const [ordersRes, addressesRes] = await Promise.all([
          fetch(`${apiUrl}/api/orders/myorders`, { headers: { 'x-auth-token': token } }),
          fetch(`${apiUrl}/api/address`, { headers: { 'x-auth-token': token } })
        ]);
        const ordersData = await ordersRes.json();
        const addressesData = await addressesRes.json();
        setOrders(ordersData);
        setAddresses(addressesData);
      } catch (error) {
        console.error('Failed to fetch account data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/api/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newAddress)
    });
    if (res.ok) {
        const updatedAddresses = await res.json();
        setAddresses(updatedAddresses);
        toast.success('Address added!');
        setShowAddressForm(false);
        setNewAddress({ street: '', city: '', state: '', pincode: '', phone: '' });
    } else {
        toast.error('Failed to add address.');
    }
  };

  if (loading) return <p className="text-center mt-8">Loading your account...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      {/* --- Address Section --- */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">My Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            {showAddressForm ? 'Cancel' : 'Add New Address'}
          </button>
        </div>
        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-lg shadow-md border mb-6 space-y-4">
            <input name="street" value={newAddress.street} onChange={handleAddressChange} placeholder="Street, House No." className="w-full p-2 border rounded" required />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="City" className="w-full p-2 border rounded" required />
                <input name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="State" className="w-full p-2 border rounded" required />
                <input name="pincode" value={newAddress.pincode} onChange={handleAddressChange} placeholder="Pincode" className="w-full p-2 border rounded" required />
            </div>
            <input name="phone" value={newAddress.phone} onChange={handleAddressChange} placeholder="Phone Number" className="w-full p-2 border rounded" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Save Address</button>
          </form>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
                <div key={addr._id} className="bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold">{addr.street}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p>Phone: {addr.phone}</p>
                </div>
            ))}
        </div>
      </div>

      {/* --- Order History Section --- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Order History</h2>
        {/* ... existing order history code ... */}
      </div>
    </div>
  );
}