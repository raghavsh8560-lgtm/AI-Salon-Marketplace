import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Heart, Calendar, User, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, user, wishlist, bookings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const activeBookingsCount = bookings.filter(b => b.status === 'upcoming').length;
  const wishlistCount = wishlist.length;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Salons', path: '/browse' },
    { name: 'AI Assistant', path: '/ai-assistant' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass bg-white/75 dark:bg-gray-950/75 border-b border-gray-150/70 dark:border-gray-800/60 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 focus:outline-none">
            <div className="bg-primary text-white p-2 rounded-xl shadow-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              SalonAI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 transition-colors duration-250 ${
                  isActive(link.path)
                    ? 'text-primary dark:text-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Action Tools */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-all"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {/* Wishlist Shortcut */}
            <Link
              to="/dashboard?tab=saved"
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-all relative"
              aria-label="Favorites"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-gray-950">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Bookings Shortcut */}
            <Link
              to="/dashboard?tab=bookings"
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-all relative"
              aria-label="My Bookings"
            >
              <Calendar className="w-5 h-5" />
              {activeBookingsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-gray-950">
                  {activeBookingsCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile */}
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 hover:border-pink-200 rounded-xl transition-all"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 duration-200"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Tools (Hamburger & Theme & Actions) */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Dark Mode toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-150 dark:border-gray-800/80 bg-white dark:bg-gray-950 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 font-semibold text-base">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl transition-all ${
                    isActive(link.path)
                      ? 'bg-pink-50 dark:bg-pink-950/20 text-primary'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/40 hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-gray-100 dark:bg-gray-800/70 my-3" />

              {/* Wishlist Mobile */}
              <Link
                to="/dashboard?tab=saved"
                onClick={() => setIsOpen(false)}
                className="flex justify-between items-center px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-5 h-5 text-gray-400" />
                  <span>Favorites</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Bookings Mobile */}
              <Link
                to="/dashboard?tab=bookings"
                onClick={() => setIsOpen(false)}
                className="flex justify-between items-center px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>My Bookings</span>
                </div>
                {activeBookingsCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {activeBookingsCount}
                  </span>
                )}
              </Link>

              <div className="h-px bg-gray-100 dark:bg-gray-800/70 my-3" />

              {/* User Mobile */}
              {user ? (
                <div className="px-3 py-2 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-450">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center bg-gray-100 dark:bg-gray-900 hover:bg-pink-100 text-gray-800 dark:text-gray-250 py-2.5 rounded-xl text-sm font-bold transition-all"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="px-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center block bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
                  >
                    Login / Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
