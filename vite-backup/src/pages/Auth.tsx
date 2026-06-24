import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, User, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, addToast } = useApp();

  // Tab State
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form inputs state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password mockup
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoginTab) {
      if (!email || !password) {
        addToast('Please fill in all credentials', 'warning');
        return;
      }
      
      // Extract first part of email for mock user name
      const parsedName = email.split('@')[0];
      const displayName = parsedName.charAt(0).toUpperCase() + parsedName.slice(1);
      
      login(email, displayName, '+91 99999 88888');
      navigate('/dashboard');
    } else {
      if (!name || !email || !phone || !password) {
        addToast('Please fill in all signup details', 'warning');
        return;
      }
      if (phone.length < 10) {
        addToast('Please enter a valid phone number', 'error');
        return;
      }
      signup(name, email, phone);
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    login('google.user@example.com', 'Google User', '+91 98888 77777');
    navigate('/dashboard');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    addToast(`Password recovery link sent to ${forgotEmail}!`, 'success');
    setShowForgotModal(false);
    setForgotEmail('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col gap-6 relative">
      
      {/* Visual background blobs */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-pink-100 dark:bg-pink-950/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main card box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-150/70 dark:border-gray-700/60 rounded-3xl p-6 sm:p-8 shadow-md relative z-10">
        
        {/* Brand header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-primary text-white p-2.5 rounded-xl shadow-md flex items-center justify-center w-max">
            <Sparkles className="w-5 h-5 fill-white text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white mt-4">Welcome to SalonAI</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px]">
            Book premium beauty services in Jaipur instantly.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-1.5 rounded-2xl font-bold text-sm text-gray-500 dark:text-gray-400 mb-6 relative">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 py-2 rounded-xl transition-all focus:outline-none relative z-10 ${
              isLoginTab ? 'text-primary dark:text-pink-300 font-extrabold' : 'hover:text-gray-750'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 py-2 rounded-xl transition-all focus:outline-none relative z-10 ${
              !isLoginTab ? 'text-primary dark:text-pink-300 font-extrabold' : 'hover:text-gray-750'
            }`}
          >
            Sign Up
          </button>
          {/* Animated active bar */}
          <motion.div 
            layout
            className="absolute top-1.5 bottom-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60"
            style={{ 
              width: 'calc(50% - 12px)',
              left: isLoginTab ? '6px' : 'calc(50% + 6px)' 
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          />
        </div>

        {/* Google SSO */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-750 px-4 py-3 rounded-xl font-bold text-sm text-gray-750 dark:text-gray-250 bg-white dark:bg-gray-850 hover:bg-gray-50/50 hover:border-gray-300 transition-colors focus:outline-none mb-5 shadow-sm active:scale-98 duration-150"
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
          <span>Continue with Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-gray-150 dark:border-gray-750"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">or email</span>
          <div className="flex-grow border-t border-gray-150 dark:border-gray-750"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-sm font-semibold">
          
          {/* Name Field (Sign Up Only) */}
          {!isLoginTab && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</label>
              <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-850 dark:text-gray-150 focus-within:border-primary transition-colors">
                <User className="w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full font-medium"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
            <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-850 dark:text-gray-150 focus-within:border-primary transition-colors">
              <Mail className="w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full font-medium"
              />
            </div>
          </div>

          {/* Phone Field (Sign Up Only) */}
          {!isLoginTab && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone Number</label>
              <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-850 dark:text-gray-150 focus-within:border-primary transition-colors">
                <Phone className="w-4.5 h-4.5 text-gray-400" />
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full font-medium"
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Password</label>
            <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-850 dark:text-gray-150 focus-within:border-primary transition-colors">
              <Lock className="w-4.5 h-4.5 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full font-medium"
              />
            </div>
          </div>

          {/* Extra options: Remember & Forgot (Login Only) */}
          {isLoginTab && (
            <div className="flex justify-between items-center text-xs text-gray-550 dark:text-gray-400 py-1.5 font-bold">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-primary h-4 w-4 rounded"
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-primary hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Trigger */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 duration-200 mt-2 focus:outline-none"
          >
            {isLoginTab ? 'Log In to My Account' : 'Register & Sign Up'}
          </button>
        </form>

      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="fixed inset-0 bg-black z-45"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-3xl z-50 p-6 sm:p-8 flex flex-col gap-5 border border-gray-100 dark:border-gray-700 shadow-2xl"
            >
              <div className="text-center">
                <h3 className="font-extrabold text-lg text-gray-950 dark:text-white">Recover Password</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                  Enter your email address. We will email you a secure link to reset your account credentials.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4 text-sm font-semibold">
                <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-200">
                  <Mail className="w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full font-medium"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 font-bold text-xs text-gray-500 hover:text-gray-750"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
