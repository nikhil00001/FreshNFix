"use client";

import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CartContext from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart } = useContext(CartContext);
  const router = useRouter();

  // State for addresses and the selected one
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliverySlot, setDeliverySlot] = useState('');

  // Fetch addresses when the component loads
  useEffect(() => {
    const fetchAddresses = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/address', { headers: { 'x-auth-token': token } });
        if (res.ok) {
            const data = await res.json();
            setAddresses(data);
            if (data.length > 0) {
                setSelectedAddress(data[0]); // Default to the first address
            }
        }
    };
    fetchAddresses();
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + 40; // Hardcoded delivery fee

  // ... inside the CheckoutPage component ...

const handlePlaceOrder = async () => {
    if (!deliverySlot) {
      toast.error('Please select a delivery slot.');
      return;
    }
    if (!selectedAddress) {
      toast.error('Please select a shipping address.');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify({ shippingAddress, fixedDeliverySlot: deliverySlot }),
      });

      if (res.ok) {
        toast.success('Order placed successfully!');
        // In a real app, you would also clear the cart context here
        router.push('/order-success');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to place order');
      }
    } catch (error) {
      console.error(error);
      toast.error(`Error: ${error.message}`);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">1. Select Delivery Slot</h2>
          <select
            value={deliverySlot}
            onChange={(e) => setDeliverySlot(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">-- Choose a time --</option>
            <option value="Today, 5 PM - 7 PM">Today, 5 PM - 7 PM</option>
            <option value="Tomorrow, 9 AM - 11 AM">Tomorrow, 9 AM - 11 AM</option>
          </select>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Shipping Address</h2>
          <div className="space-y-4">
            {addresses.map(addr => (
                <div 
                    key={addr._id} 
                    onClick={() => setSelectedAddress(addr)}
                    className={`p-4 border-2 rounded-md cursor-pointer ${selectedAddress?._id === addr._id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                    <p className="font-semibold">{addr.street}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
            ))}
            {addresses.length === 0 && <p>No saved addresses. Please add one in your account page.</p>}
          </div>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          {cart.map(item => (
            <div key={item.product._id} className="flex justify-between text-sm mb-1">
              <span>{item.product.name} x {item.quantity}</span>
              <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={handlePlaceOrder}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold"
          >
            Place Order & Pay
          </button>
          <p className="text-xs text-center mt-2">Payment integration with Stripe/Razorpay would happen here.</p>
        </div>
      </div>
    </div>
  );
}