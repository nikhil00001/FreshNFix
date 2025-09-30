"use client";

import { useContext, useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import AuthContext from '@/context/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // NEW: This state will hold the session string from Cognito, which is
  // required for the second step of verification.
  const [cognitoSession, setCognitoSession] = useState(null);

  // Effect to manage the resend timer (unchanged).
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // REFACTORED: This function now calls your new Cognito backend endpoint.
  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast.error('Please enter a 10-digit mobile number.');
      return;
    }
    
    const loadingToast = toast.loading('Sending OTP...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // This now points to the Cognito "startAuth" route.
      const res = await fetch(`${apiUrl}/api/auth/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` })
      });
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (!res.ok) throw new Error(data.msg || "Failed to send OTP.");

      setCognitoSession(data.session); // Save the Cognito session.
      toast.success('OTP sent!');
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    }
  };
  
  // REFACTORED: This function now calls the Cognito verification endpoint.
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }
    
    const loadingToast = toast.loading('Verifying OTP...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // This points to the Cognito "verifyOtp" route and sends the session.
      const res = await fetch(`${apiUrl}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: `+91${phone}`, otp, session: cognitoSession })
      });
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (!res.ok) throw new Error(data.msg || "Verification failed.");
      
      toast.success('Logged in successfully!');
      localStorage.setItem('token', data.token); // The token now comes from Cognito.
      window.location.reload();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    }
  };

  // Reset function now also clears the Cognito session state.
  const reset = () => {
    setStep(1);
    setPhone('');
    setOtp('');
    setResendTimer(0);
    setCognitoSession(null); // Clear the session on close.
    closeAuthModal();
  }

  const isPhoneValid = phone.length === 10;
  const isOtpValid = otp.length === 6;

  // The entire JSX structure below is unchanged.
  return (
    <Transition appear show={isAuthModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={reset}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <button onClick={reset} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                {step === 1 && (
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-bold text-center">Log in or Sign up</Dialog.Title>
                    <div className="mt-4 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600 border-r pr-2 mr-2">+91</span>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Enter mobile number" className="w-full p-3 pl-[4.5rem] border rounded-md focus:ring-blue-500 focus:border-blue-500" maxLength="10"/>
                    </div>
                    <button onClick={isPhoneValid ? handleSendOtp : undefined} className={`w-full mt-4 py-3 rounded-md font-semibold transition-colors duration-200 ${isPhoneValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} disabled={!isPhoneValid}>
                        Continue
                    </button>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-bold text-center">OTP Verification</Dialog.Title>
                    <p className="text-center text-sm text-gray-500 mt-2">We have sent a verification code to +91{phone}</p>
                    <div className="mt-4">
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter OTP" className="w-full p-3 text-center tracking-[0.5em] border rounded-md focus:ring-blue-500 focus:border-blue-500" maxLength="6"/>
                    </div>
                    <button onClick={isOtpValid ? handleVerifyOtp : undefined} className={`w-full mt-4 py-3 rounded-md font-semibold transition-colors duration-200 ${isOtpValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} disabled={!isOtpValid}>
                        Verify
                    </button>
                    <div className="text-center text-sm mt-4">
                        {resendTimer > 0 ? (
                            <span className="text-gray-500">Resend Code in {resendTimer}s</span>
                        ) : (
                            <button onClick={handleSendOtp} className="text-blue-600 hover:underline">
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
