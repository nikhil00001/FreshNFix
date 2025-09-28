"use client";

import { useContext, useState, Fragment, useEffect } from 'react'; // Added useEffect
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import AuthContext from '@/context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // NEW: State for the timer for OTP resend
  const [resendTimer, setResendTimer] = useState(0);

  // NEW: Effect to manage the resend timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer); // Cleanup
  }, [resendTimer]);

  const handleSendOtp = async () => {
    // Basic 10-digit validation for India
    if (phone.length !== 10) {
      toast.error('Please enter a 10-digit mobile number.');
      return;
    }
    
    const loadingToast = toast.loading('Sending OTP...');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` })
      });
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (!res.ok) throw new Error(data.msg);
      toast.success('OTP sent!');
      setStep(2);
      setResendTimer(60); // Start 60-second timer for resend
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    }
  };
  
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { // Ensure OTP is 6 digits
        toast.error('Please enter the 6-digit OTP.');
        return;
    }
    
    const loadingToast = toast.loading('Verifying OTP...');
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: `+91${phone}`, otp })
        });
        const data = await res.json();
        toast.dismiss(loadingToast);
        if (!res.ok) throw new Error(data.msg);
        
        toast.success('Logged in successfully!');
        localStorage.setItem('token', data.token);
        window.location.reload();
    } catch (err) {
        toast.dismiss(loadingToast);
        toast.error(err.message);
    }
  };

  const reset = () => {
    setStep(1);
    setPhone('');
    setOtp('');
    setResendTimer(0); // Reset timer on close
    closeAuthModal();
  }

  // Determine if the "Continue" button should be active
  const isPhoneValid = phone.length === 10;
  // Determine if the "Verify" button should be active
  const isOtpValid = otp.length === 6;


  return (
    <Transition appear show={isAuthModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={reset}> {/* Increased z-index */}
        {/* NEW: Background blur and dim */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <button onClick={reset} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {step === 1 && (
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-bold text-center">Log in or Sign up</Dialog.Title>
                    <div className="mt-4 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600 border-r pr-2 mr-2">
                            +91
                        </span>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} // Only allow digits, max 10
                            placeholder="Enter mobile number"
                            className="w-full p-3 pl-[4.5rem] border rounded-md focus:ring-blue-500 focus:border-blue-500" // Adjusted padding
                            maxLength="10"
                        />
                    </div>
                    {/* Conditional styling and onClick for the button */}
                    <button
                        onClick={isPhoneValid ? handleSendOtp : undefined}
                        className={`w-full mt-4 py-3 rounded-md font-semibold transition-colors duration-200
                                    ${isPhoneValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        disabled={!isPhoneValid}
                    >
                        Continue
                    </button>
                  </div>
                )}
                
                {step === 2 && (
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-bold text-center">OTP Verification</Dialog.Title>
                    <p className="text-center text-sm text-gray-500 mt-2">We have sent a verification code to +91{phone}</p>
                    <div className="mt-4">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} // Only allow digits, max 6
                            placeholder="Enter OTP"
                            className="w-full p-3 text-center tracking-[0.5em] border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            maxLength="6"
                        />
                    </div>
                    <button
                        onClick={isOtpValid ? handleVerifyOtp : undefined}
                        className={`w-full mt-4 py-3 rounded-md font-semibold transition-colors duration-200
                                    ${isOtpValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        disabled={!isOtpValid}
                    >
                        Verify
                    </button>
                    {/* Resend OTP button with timer */}
                    <div className="text-center text-sm mt-4">
                        {resendTimer > 0 ? (
                            <span className="text-gray-500">Resend Code in {resendTimer}s</span>
                        ) : (
                            <button 
                                onClick={handleSendOtp} 
                                className="text-blue-600 hover:underline"
                            >
                                Resend Code
                            </button>
                        )}
                    </div>
                  </div>
                )}

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}