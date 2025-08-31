"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import validator from 'validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function RegisterPage() {
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [name, setName] = useState('');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Validation ---
    if (method === 'email' && !validator.isEmail(credential)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (method === 'phone') {
      const phoneNumber = parsePhoneNumberFromString(credential, 'IN');
      if (!phoneNumber || !phoneNumber.isValid()) {
        toast.error('Please enter a valid phone number (e.g., +919876543210).');
        return;
      }
    }

    const loadingToast = toast.loading('Creating your account...');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, credential, method, password }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (!res.ok) {
        throw new Error(data.msg || 'Failed to register');
      }
      
      toast.success('Registration successful! Please log in.');
      router.push('/login');

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
        </div>
        
        {/* --- Method Toggle UI --- */}
        <div className="flex border border-gray-300 rounded-md p-1">
          <button
            onClick={() => { setMethod('email'); setCredential(''); }}
            className={`w-1/2 py-2 rounded ${method === 'email' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Email
          </button>
          <button
            onClick={() => { setMethod('phone'); setCredential(''); }}
            className={`w-1/2 py-2 rounded ${method === 'phone' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required className="w-full px-3 py-2 border rounded-md" />
          
          {/* --- Conditional Input --- */}
          {method === 'email' ? (
            <input type="email" value={credential} onChange={(e) => setCredential(e.target.value)} placeholder="Email Address" required className="w-full px-3 py-2 border rounded-md" />
          ) : (
            <input type="tel" value={credential} onChange={(e) => setCredential(e.target.value)} placeholder="Phone Number (with country code)" required className="w-full px-3 py-2 border rounded-md" />
          )}

          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength="6" className="w-full px-3 py-2 border rounded-md" />

          <button type="submit" className="w-full py-2 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Sign Up
          </button>
        </form>
        
        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Log in</Link>
        </p>
      </div>
    </div>
  );
}