'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, addToast, user } = useApp();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Form inputs state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER'); // USER, OWNER, ADMIN
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      let path = redirectPath;
      if (user.role === 'OWNER') path = '/dashboard/owner';
      else if (user.role === 'ADMIN') path = '/admin';
      router.push(path);
    }
  }, [user, redirectPath, router]);

  // Pre-select role if passed in query params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['USER', 'OWNER', 'ADMIN'].includes(roleParam.toUpperCase())) {
      setRole(roleParam.toUpperCase());
    }
  }, [searchParams]);

  const selectRole = (newRole: string) => {
    setRole(newRole);
    setPassword('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (role !== 'USER' && !password) {
      addToast('Password is required for this role.', 'warning');
      return;
    }

    try {
      setIsPending(true);
      await login(email, role, role !== 'USER' ? password : undefined);
      
      let path = redirectPath;
      if (role === 'OWNER') path = '/dashboard/owner';
      else if (role === 'ADMIN') path = '/admin';
      router.push(path);
    } catch (err: any) {
      addToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsPending(true);
      // Mock Google login calls seed email
      await login('sujata.meena@example.com');
      addToast('Google login simulation successful! Welcome Sujata 🌸', 'success');
      router.push(redirectPath);
    } catch (err) {
      addToast('Google login simulation failed.', 'error');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col gap-6 relative min-h-[75vh]">
      
      {/* Visual background blobs */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-pink-50 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main card box */}
      <div className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl p-6 sm:p-8 shadow-sm relative z-10">
        
        {/* Brand header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="bg-primary text-white p-2.5 rounded-xl shadow-md flex items-center justify-center w-max">
            <Sparkles className="w-5 h-5 fill-white text-white" />
          </div>
          <h2 className="text-2xl font-serif font-extrabold text-gray-955 dark:text-white mt-4">Welcome to SalonAI</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px]">
            Book premium wellness & beauty services in Jaipur.
          </p>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-amber-50 dark:bg-amber-955/20 border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs rounded-2xl p-4 text-center font-medium shadow-sm mb-6 flex flex-col gap-2">
          <div className="font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-450">
            <span>⚠️ Demo Authentication Mode</span>
          </div>
          <p className="text-[11px] leading-normal">This platform is in presentation mode. Enter any email to access as Customer, or use these demo accounts:</p>
          <div className="bg-white/60 dark:bg-black/20 rounded-xl p-2.5 text-[10px] text-left flex flex-col gap-1.5 font-mono border border-amber-200/30">
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 text-[10px]">Admin ID:</span> admin@salonhub.com<br/>
              <span className="font-bold text-amber-900 dark:text-amber-200 text-[10px]">Password:</span> Admin123
            </div>
            <div className="border-t border-amber-200/20 pt-1.5">
              <span className="font-bold text-amber-900 dark:text-amber-200 text-[10px]">Salon Owner ID:</span> owner@royalglow.com<br/>
              <span className="font-bold text-amber-900 dark:text-amber-200 text-[10px]">Password:</span> Owner123
            </div>
          </div>
        </div>

        {/* Google SSO */}
        <button
          onClick={handleGoogleLogin}
          disabled={isPending}
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-gray-755 dark:text-gray-250 bg-white dark:bg-gray-850 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none mb-5 shadow-sm active:scale-98 duration-155 cursor-pointer disabled:opacity-50"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38C16.88,16.27,14.68,18,12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.66,0,3.14,0.69,4.24,1.8l2-2C16.42,4.08,14.32,3,12,3C7.03,3,3,7.03,3,12s4.03,9,9,9c4.8,0,8.75-3.6,9.35-8.22A1,1,0,0,0,21.35,11.1Z" fill="#EA4335" />
              <path d="M12,21c4.8,0,8.75-3.6,9.35-8.22a1,1,0,0,0-.35-.68H12v2.7h5.38C16.88,16.27,14.68,18,12,18Z" fill="#4285F4" />
              <path d="M17.38,14.82A5.88,5.88,0,0,1,12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.66,0,3.14,0.69,4.24,1.8l2-2A8.93,8.93,0,0,0,12,3C7.03,3,3,7.03,3,12s4.03,9,9,9C14.32,21,16.42,19.92,17.38,14.82Z" fill="#FBBC05" />
              <path d="M12,6c1.66,0,3.14,0.69,4.24,1.8l2-2A8.93,8.93,0,0,0,12,3C7.03,3,3,7.03,3,12s4.03,9,9,9C12,21,12,6,12,6Z" fill="#34A853" />
            </g>
          </svg>
          <span>Continue with Google (Demo Sujata)</span>
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-gray-150 dark:border-gray-750"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">or email identity</span>
          <div className="flex-grow border-t border-gray-150 dark:border-gray-750"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-xs sm:text-sm font-semibold">
          
          {/* Role Choice segment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-450 dark:text-gray-400 uppercase tracking-wider font-extrabold">Identity Role Type</label>
            <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-805 rounded-xl p-1 text-xs">
              {[
                { id: 'USER', label: 'Customer' },
                { id: 'OWNER', label: 'Salon Owner' },
                { id: 'ADMIN', label: 'Admin' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectRole(item.id)}
                  className={`py-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                    role === item.id 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150/40 dark:hover:bg-gray-800/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-450 dark:text-gray-455 uppercase tracking-wider font-extrabold">Email Address</label>
            <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-805 rounded-xl px-3.5 py-2.5 text-gray-855 dark:text-gray-150 focus-within:border-primary transition-colors">
              <Mail className="w-4.5 h-4.5 text-gray-455" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full font-medium"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
              Enter your email to continue your personalized beauty journey.
            </p>
          </div>

          {/* Password Field - ONLY for OWNER or ADMIN roles */}
          {role !== 'USER' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-455 dark:text-gray-455 uppercase tracking-wider font-extrabold">Password</label>
              <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl px-3.5 py-2.5 text-gray-855 dark:text-gray-150 focus-within:border-primary transition-colors">
                <Lock className="w-4.5 h-4.5 text-gray-455" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full font-medium"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                {role === 'ADMIN' ? 'Enter Admin password (e.g. Admin123)' : 'Enter Salon Owner password (e.g. Owner123)'}
              </p>
            </div>
          )}

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 duration-200 mt-2 focus:outline-none cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Connecting...' : 'Continue'}
          </button>
        </form>

      </div>

    </div>
  );
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-500 font-semibold text-sm">Loading authentication portal...</p>
      </div>
    }>
      <AuthPageContent />
    </React.Suspense>
  );
}
