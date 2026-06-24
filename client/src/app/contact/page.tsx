'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ContactPage() {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      addToast('Please fill out all fields.', 'warning');
      return;
    }
    setIsPending(true);
    setTimeout(() => {
      addToast('Message sent! Our beauty support team will reach out in 24 hours. 🌸', 'success');
      setName('');
      setEmail('');
      setMessage('');
      setIsPending(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10 min-h-[75vh]">
      
      {/* Page header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-950 dark:text-white leading-tight">
          Get in Touch with SalonAI
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          Need booking help, partner salon signups, or custom AI recommendations? Reach our team anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Coordinates */}
        <div className="md:col-span-5 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm flex flex-col gap-6 font-semibold text-xs sm:text-sm">
          <div>
            <h3 className="font-serif font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-primary fill-pink-50" />
              <span>Office Details</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">Headquarters location in Jaipur.</p>
          </div>

          <div className="flex flex-col gap-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Plot 25, Malviya Nagar Sector 4, Jaipur, Rajasthan 302017</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <span>+91 141 278 9012</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <span>support@salonai.in</span>
            </div>
          </div>

          <div className="bg-pink-50/40 dark:bg-pink-950/20 text-primary border border-pink-100/40 p-4 rounded-2xl text-[10px] sm:text-xs leading-relaxed font-medium">
            <strong>Partner salons signup:</strong> Email partners@salonai.in with your trade licenses and stylist counts to apply.
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="md:col-span-7 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 text-xs sm:text-sm font-semibold">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Your Name</label>
              <input
                type="text"
                required
                placeholder="Elena Gilbert"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-805 rounded-xl px-3.5 py-2.5 text-gray-850 dark:text-gray-150 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Email Address</label>
              <input
                type="email"
                required
                placeholder="elena@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-805 rounded-xl px-3.5 py-2.5 text-gray-850 dark:text-gray-150 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Your Inquiry</label>
              <textarea
                required
                rows={4}
                placeholder="Write your booking query or partner details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-805 rounded-xl px-3.5 py-2.5 text-gray-850 dark:text-gray-155 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow active:scale-95 duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2 self-end"
            >
              <Send className="w-4 h-4" />
              <span>{isPending ? 'Sending...' : 'Send Message'}</span>
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
