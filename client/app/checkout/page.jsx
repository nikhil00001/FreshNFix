"use client";

import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CartContext from '@/context/CartContext';
import toast from 'react-hot-toast';
import Script from 'next/script'; // 1. Import the Script component

export default function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliverySlot, setDeliverySlot] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', pincode: '', phone: '' });
  
  // 2. Add state for user profile and loading
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online'); // NEW: State for payment method

  // 3. Fetch user's addresses AND profile info
  useEffect(() => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchAddresses = async () => {
      const res = await fetch(`${apiUrl}/api/address`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddress(data[0]);
        } else {
          setShowAddressForm(true);
        }
      }
    };

    const fetchProfile = async () => {
      const res = await fetch(`${apiUrl}/api/profile/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    };

    fetchAddresses();
    fetchProfile();
  }, []);

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    // ... (Your existing add address logic - no changes needed)
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/api/address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newAddress)
    });
    if (res.ok) {
      const updatedAddresses = await res.json();
      setAddresses(updatedAddresses);
      setSelectedAddress(updatedAddresses[0]);
      toast.success('Address added!');
      setShowAddressForm(false);
      setNewAddress({ street: '', city: '', state: '', pincode: '', phone: '' });
    } else {
      toast.error('Failed to add address.');
    }
  };
  
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + 40;



  // --- UPDATED PAYMENT FUNCTION ---
  const handlePayment = async () => {
    if (!deliverySlot) {
      toast.error('Please select a delivery slot.');
      return;
    }
    if (!selectedAddress) {
      toast.error('Please select a shipping address.');
      return;
    }
    if (!userProfile) {
      toast.error('User profile not loaded. Please wait a moment.');
      return;
    }
    
      
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (paymentMethod === 'COD') {
        // --- HANDLE CASH ON DELIVERY ---
        try {
            const res = await fetch(`${apiUrl}/api/payment/create-cod-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shippingAddress: selectedAddress,
                    fixedDeliverySlot: deliverySlot,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to place COD order.');
            }

            toast.success('Order placed successfully!');
            clearCart();
            router.push('/order-success');

        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Could not place COD order.');
        } finally {
            setIsLoading(false);
        }
    } else {
        // --- HANDLE ONLINE PAYMENT (Existing Razorpay logic) ---
        try {
            const orderRes = await fetch(`${apiUrl}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            if (!orderRes.ok) throw new Error('Failed to create payment order.');

            const { orderId, amount, keyId } = await orderRes.json();
            const options = {
                key: keyId,
                amount: amount,
                currency: "INR",
                name: "FreshNFix",
                description: "Grocery Payment",
                order_id: orderId,
                handler: async function (response) {
                    try {
                        const verificationRes = await fetch(`${apiUrl}/api/payment/verify-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                shippingAddress: selectedAddress,
                                fixedDeliverySlot: deliverySlot,
                            }),
                        });
                        if (!verificationRes.ok) throw new Error('Payment verification failed.');
                        toast.success('Order placed successfully!');
                        clearCart();
                        router.push('/order-success');
                    } catch (error) {
                        console.error(error);
                        toast.error(error.message || 'Payment verification failed.');
                        setIsLoading(false);
                    }
                },
                prefill: { name: userProfile.name || "Valued Customer", phone: userProfile.phone },
                theme: { color: "#2563EB" },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
            rzp.on('payment.failed', function (response) {
                console.error(response.error);
                toast.error('Payment failed. Please try again.');
                setIsLoading(false);
            });
        } catch (error) {
            console.error(error);
            toast.error('An error occurred. Please try again.');
            setIsLoading(false);
        }
    }
  };

  return (
    <>
      {/* 5. Add the Razorpay Script to the page */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">1. Select Delivery Slot</h2>
            <select value={deliverySlot} onChange={(e) => setDeliverySlot(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="">-- Choose a time --</option>
              <option value="Today, 5 PM - 7 PM">Today, 5 PM - 7 PM</option>
              <option value="Tomorrow, 9 AM - 11 AM">Tomorrow, 9 AM - 11 AM</option>
            </select>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Shipping Address</h2>
            <div className="space-y-4">
              {addresses.map(addr => (
                <div key={addr._id} onClick={() => setSelectedAddress(addr)} className={`p-4 border-2 rounded-md cursor-pointer ${selectedAddress?._id === addr._id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <p className="font-semibold">{addr.street}</p>
                  <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
              ))}
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="w-full text-center p-3 border-2 border-dashed rounded-md text-blue-600 font-semibold hover:bg-blue-50">
                {showAddressForm ? 'Cancel' : '+ Add a New Address'}
              </button>
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-lg shadow-md border space-y-4">
                  {/* ... (Your existing address form) ... */}
                </form>
              )}
            </div>
            
            {/* --- UPDATED PAYMENT METHOD SECTION --- */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Payment Method</h2>
            <div className="space-y-3">
                <div
                    onClick={() => setPaymentMethod('Online')}
                    className={`p-4 border-2 rounded-md cursor-pointer ${paymentMethod === 'Online' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                    <p className="font-semibold">Secure Online Payment</p>
                    <p className="text-sm text-gray-500">UPI, Cards, Netbanking, etc. via Razorpay.</p>
                </div>
                <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 border-2 rounded-md cursor-pointer ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay with cash when your order is delivered.</p>
                </div>
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
              <div className="flex justify-between mb-1">
                <span>Delivery Fee</span>
                <span>₹40.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            {/* 7. The button now calls handlePayment and shows a loading state */}
            <button 
              onClick={handlePayment} 
              disabled={isLoading || cart.length === 0}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (paymentMethod === 'COD' ? 'Place Order' : 'Place Order & Pay')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
