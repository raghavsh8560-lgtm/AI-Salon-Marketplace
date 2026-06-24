import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Contact: React.FC = () => {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      addToast('Please fill in all form fields', 'warning');
      return;
    }
    addToast('Your inquiry has been sent! We will contact you soon.', 'success');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      
      {/* Header title */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white">
          Get in Touch
        </h1>
        <p className="text-gray-650 dark:text-gray-400 text-sm sm:text-base mt-2 max-w-lg mx-auto leading-relaxed">
          Have feedback on SalonAI, or looking to register your own beauty salon? Fill in the details below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Contact info (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm flex flex-col gap-8 justify-between">
          
          <div className="flex flex-col gap-6">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Corporate Office</h3>
            
            <div className="flex flex-col gap-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5.5 h-5.5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-950 dark:text-white">Jaipur Headquarters</div>
                  <div className="text-xs text-gray-400 mt-1 leading-normal font-medium">B-84, Calgiri Marg, Sector 5, Malviya Nagar, Jaipur, Rajasthan 302017</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5.5 h-5.5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-950 dark:text-white">Phone Helpline</div>
                  <div className="text-xs text-gray-400 mt-1 leading-normal font-medium">+91 141 278 9000 (Mon - Sat, 10 AM - 7 PM)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5.5 h-5.5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-950 dark:text-white">Support Email</div>
                  <div className="text-xs text-gray-400 mt-1 leading-normal font-medium">support@salonai.example.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick info block */}
          <div className="bg-pink-50/30 dark:bg-gray-950/20 p-4 rounded-2xl border border-pink-100/50 dark:border-gray-900/60 text-xs text-gray-500 dark:text-gray-400 flex gap-2 items-start leading-normal">
            <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <span>If you are a salon owner in Jaipur looking to partner with us, please specify "Business Inquiry" as the email subject header.</span>
          </div>

        </div>

        {/* Contact Form (7 cols) */}
        <form onSubmit={handleSubmit} className="md:col-span-7 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm flex flex-col gap-5 text-sm font-semibold">
          
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">Send inquiry</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-450 dark:text-gray-400 uppercase tracking-wide">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Raghav"
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-805 dark:text-gray-155 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-455 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-805 dark:text-gray-155 focus:outline-none focus:border-primary font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-455 dark:text-gray-400 uppercase tracking-wide">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Partnering my salon / Booking issue"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-805 dark:text-gray-155 focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-455 dark:text-gray-400 uppercase tracking-wide">Message / Description</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide a detailed description of your query..."
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-gray-805 dark:text-gray-155 focus:outline-none focus:border-primary font-medium resize-none"
            />
          </div>

          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 duration-200 flex items-center justify-center gap-1.5 focus:outline-none mt-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>

        </form>

      </div>

    </div>
  );
};
