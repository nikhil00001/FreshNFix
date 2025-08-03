import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-green-600">Thank You!</h1>
      <p className="mt-2 text-lg">Your order has been placed successfully.</p>
      <p>We'll deliver it fresh, on your fixed time!</p>
      <Link href="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Continue Shopping
      </Link>
    </div>
  );
}