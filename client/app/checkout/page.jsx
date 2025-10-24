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

  // 4. --- THIS IS THE NEW PAYMENT FUNCTION ---
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

    try {
      // Step 1: Create a payment order on your server
      const orderRes = await fetch(`${apiUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create payment order.');
      }

      const { orderId, amount, keyId } = await orderRes.json();

      // Step 2: Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "FreshNFix",
        description: "Grocery Payment",
        order_id: orderId,
        
        // This function runs after successful payment
        handler: async function (response) {
          try {
            // Step 3: Verify the payment on your server
            const verificationRes = await fetch(`${apiUrl}/api/payment/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress: selectedAddress,
                fixedDeliverySlot: deliverySlot,
              }),
            });

            if (!verificationRes.ok) {
              throw new Error('Payment verification failed.');
            }

            // Step 4: Payment verified, order created in DB
            toast.success('Order placed successfully!');
            clearCart();
            router.push('/order-success');

          } catch (error) {
            console.error(error);
            toast.error(error.message || 'Payment verification failed. Please contact support.');
            setIsLoading(false);
          }
        },
        prefill: {
          name: userProfile.name || "Valued Customer",
          phone: userProfile.phone,
        },
        theme: {
          color: "#2563EB", // Your blue color
        },
      };

      // Step 5: Open the Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.open();

      // Handle payment modal close
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
            
            {/* 6. We've removed the COD/UPI selection. It's now Razorpay-only */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Payment Method</h2>
            <div className="p-4 border-2 rounded-md border-blue-500 bg-blue-50">
              <p className="font-semibold">Secure Online Payment</p>
              <p className="text-sm text-gray-500">You will be redirected to pay with UPI, Cards, Netbanking, or Wallets via Razorpay.</p>
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
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Place Order & Pay'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
