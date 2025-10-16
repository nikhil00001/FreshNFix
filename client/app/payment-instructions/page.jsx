"use client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const totalAmount = searchParams.get('amount');

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
      <p className="text-lg text-gray-700 mb-8">Please complete your payment to begin processing.</p>

      <div className="bg-white p-8 rounded-lg shadow-lg border w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Pay via UPI / QR Code</h2>
        <p className="text-gray-600 mb-4">
          Scan the code below with any UPI app.
        </p>

        <div className="flex justify-center my-6">
          {/* Replace this with your actual QR code image */}
          <img src="/path/to/your/upi-qr-code.png" alt="UPI QR Code" className="w-48 h-48" />
        </div>

        <p className="text-gray-500">or pay to UPI ID:</p>
        <p className="font-mono text-lg font-bold my-2 bg-gray-100 p-2 rounded">
          your-upi-id@okhdfcbank
        </p>

        <div className="mt-6 text-left bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold">Order ID: <span className="font-normal text-gray-800">{orderId}</span></p>
          <p className="font-bold text-xl">Amount to Pay: <span className="text-blue-600">₹{parseFloat(totalAmount).toFixed(2)}</span></p>
        </div>

        <div className="mt-6 text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md">
          <p><strong>Important:</strong> After payment, we will manually verify the transaction. Your order status will be updated to "Processing" within a few hours. Thank you for your patience.</p>
        </div>

        <Link href="/account" className="mt-8 inline-block bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-semibold">
          Go to My Orders
        </Link>
      </div>
    </div>
  );
}

export default function PaymentInstructionsPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading payment details...</div>}>
      <PaymentContent />
    </Suspense>
  );
}