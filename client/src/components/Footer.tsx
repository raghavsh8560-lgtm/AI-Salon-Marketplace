'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, MapPin, Globe, Share2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { addToast } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    addToast('Subscribed to newsletter successfully! 🌸', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-150/70 dark:border-gray-800/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Brand details */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-1.5 focus:outline-none">
              <div className="bg-primary text-white p-2 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                SalonAI
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Instantly find, compare, and book the finest beauty salons in Jaipur. Powered by smart matching AI technology.
            </p>
            <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 mt-2">
              <a href="#" className="hover:text-primary transition-colors" aria-label="Website">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Share">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Browse by Area */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider mb-4">
              Salons in Jaipur
            </h3>
            <ul className="space-y-2.5 text-sm">
              {['C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Raja Park', 'Mansarovar', 'Jagatpura'].map((area) => (
                <li key={area}>
                  <Link 
                    href={`/browse?area=${encodeURIComponent(area)}`}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    Salons in {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services categories */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider mb-4">
              Popular Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              {['Bridal Makeup', 'Hair Spa', 'Hair Cut', 'Facial', 'Nail Art', 'Hair Color'].map((service) => (
                <li key={service}>
                  <Link 
                    href={`/browse?service=${encodeURIComponent(service)}`}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
              Subscribe to Offers
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get notified of exclusive discounts, beauty tips, and seasonal packages!
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center flex-shrink-0 focus:outline-none active:scale-95 cursor-pointer"
              >
                <Mail className="w-4.5 h-4.5" />
              </button>
            </form>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% spam-free. Unsubscribe anytime.</span>
            </div>
          </div>

        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800/80 my-10" />

        {/* Bottom Details */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Jaipur Office: Malviya Nagar Industrial Area
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> +91 141 278 9000
            </span>
          </div>
          <div className="text-center sm:text-right">
            &copy; {new Date().getFullYear()} SalonAI. All rights reserved. Created for Hackathons.
          </div>
        </div>

      </div>
    </footer>
  );
};
