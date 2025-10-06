"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPinIcon } from '@heroicons/react/24/solid'; // Import a location icon


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
          fetch(`${apiUrl}/api/orders/myorders`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/address`, { headers: { 'Authorization': `Bearer ${token}` } })
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


  // --- NEW: Function to get location and pre-fill the form ---
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    const loadingToast = toast.loading('Fetching your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
        
        if (!res.ok) {
            toast.error('Could not fetch address data.');
            toast.dismiss(loadingToast);
            return;
        }

        const data = await res.json();
        if (data.status === 'OK' && data.results[0]) {
          const components = data.results[0].address_components;
          const get = (type) => components.find(c => c.types.includes(type))?.long_name || '';
          
          const street = `${get('street_number')} ${get('route')}`.trim();
          
          setNewAddress({
            ...newAddress,
            street: street || get('sublocality'),
            city: get('locality'),
            state: get('administrative_area_level_1'),
            pincode: get('postal_code'),
          });
          toast.success('Location fetched!');
        } else {
          toast.error('Could not determine address.');
        }
        toast.dismiss(loadingToast);
      },
      () => {
        toast.error('Unable to retrieve your location. Please grant permission.');
        toast.dismiss(loadingToast);
      }
    );
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
            {/* --- NEW: The "Use Location" button --- */}
            <button type="button" onClick={handleGetCurrentLocation} className="flex items-center justify-center w-full p-2 border rounded-md text-blue-600 font-semibold hover:bg-blue-50">
                <MapPinIcon className="h-5 w-5 mr-2"/>
                Use my current location
            </button>
            <div className="text-center text-gray-400">OR</div>
            {/* ----------------------------------- */}
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