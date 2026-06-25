'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, getAuthToken, setAuthToken } from '../lib/api';

export interface BookingService {
  name: string;
  category: string;
  price: number;
}

export interface Booking {
  id: string;
  salonId: string;
  professionalId?: string | null;
  date: string;
  time: string;
  services: BookingService[];
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  salon: {
    name: string;
    coverImage: string;
    location: string;
    address?: string;
  };
  professional?: {
    name: string;
  } | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  hairType?: string | null;
  hairLength?: string | null;
  hairGoals?: string | null;
  hairConcerns?: string | null;
  skinType?: string | null;
  skinTone?: string | null;
  skinConcerns?: string | null;
  budgetRange?: string | null;
  occasion?: string | null;
  preferences?: string | null;
  favoriteSalons: string[];
  ownedSalons?: any[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: UserProfile | null;
  login: (email: string, role?: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, role?: string, password?: string) => Promise<void>;
  logout: () => void;
  wishlist: string[];
  toggleWishlist: (salonId: string) => Promise<void>;
  isInWishlist: (salonId: string) => boolean;
  bookings: Booking[];
  reloadBookings: () => Promise<void>;
  cancelUserBooking: (bookingId: string) => Promise<void>;
  rescheduleUserBooking: (bookingId: string, date: string, time: string) => Promise<void>;
  updateUserAssessment: (assessment: Partial<UserProfile>) => Promise<void>;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  isLoadingUser: boolean;
  notifications: any[];
  loadNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.warn('Failed to load notifications');
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiFetch('/notifications/read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark notifications read');
    }
  };

  // Initialize theme and load user profile from token on startup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('glowique-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
        const darkPreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(darkPreferred ? 'dark' : 'light');
      }

      const token = getAuthToken();
      if (token) {
        loadUserProfile();
      } else {
        setIsLoadingUser(false);
      }
    }
  }, []);

  // Sync theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('glowique-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadUserProfile = async () => {
    try {
      setIsLoadingUser(true);
      const profileData = await apiFetch('/auth/me');
      setUser(profileData);
      setWishlist(profileData.favoriteSalons || []);
      
      // Load bookings
      const bookingsData = await apiFetch('/bookings');
      setBookings(bookingsData);

      // Load notifications
      loadNotifications();
    } catch (err) {
      console.warn('Authentication token expired or database offline.', err);
      logout();
    } finally {
      setIsLoadingUser(false);
    }
  };

  const login = async (email: string, role?: string, password?: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role, password }),
    });

    setAuthToken(data.token);
    setUser(data.user);
    setWishlist(data.user.favoriteSalons || []);
    
    addToast('Welcome back to Glowique! 🌸', 'success');

    // Fetch user bookings
    const bookingsData = await apiFetch('/bookings').catch(() => []);
    setBookings(bookingsData);

    // Fetch notifications
    loadNotifications();
  };

  const signup = async (name: string, email: string, role?: string, password?: string) => {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, role, password }),
    });

    setAuthToken(data.token);
    setUser(data.user);
    setWishlist([]);
    addToast('Account created successfully! Welcome to Glowique.', 'success');

    // Fetch notifications
    loadNotifications();
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setBookings([]);
    setWishlist([]);
    addToast('Logged out successfully.', 'info');
  };

  const toggleWishlist = async (salonId: string) => {
    if (!user) {
      addToast('Please login to save favorite salons.', 'warning');
      return;
    }

    try {
      const data = await apiFetch('/auth/favorites', {
        method: 'POST',
        body: JSON.stringify({ salonId }),
      });
      setWishlist(data.favoriteSalons);
      setUser(prev => prev ? { ...prev, favoriteSalons: data.favoriteSalons } : null);
      addToast(
        data.favoriteSalons.includes(salonId)
          ? 'Added to favorites! ❤️'
          : 'Removed from favorites',
        'info'
      );
    } catch (err) {
      addToast('Failed to save favorite salon.', 'error');
    }
  };

  const isInWishlist = (salonId: string) => wishlist.includes(salonId);

  const reloadBookings = async () => {
    if (!user) return;
    try {
      const data = await apiFetch('/bookings');
      setBookings(data);
    } catch (err) {
      console.error('Failed to reload bookings:', err);
    }
  };

  const cancelUserBooking = async (bookingId: string) => {
    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'POST' });
      await reloadBookings();
      addToast('Appointment cancelled successfully.', 'info');
    } catch (err) {
      addToast('Cancellation failed.', 'error');
    }
  };

  const rescheduleUserBooking = async (bookingId: string, date: string, time: string) => {
    try {
      await apiFetch(`/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ date, time }),
      });
      await reloadBookings();
      addToast('Appointment rescheduled successfully! ✨', 'success');
    } catch (err) {
      addToast('Rescheduling failed.', 'error');
    }
  };

  const updateUserAssessment = async (assessment: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const updatedUser = await apiFetch('/auth/assessment', {
        method: 'PUT',
        body: JSON.stringify(assessment),
      });
      setUser(updatedUser);
      addToast('Personal care assessment updated! 🌸', 'success');
    } catch (err) {
      addToast('Failed to save assessment answers.', 'error');
    }
  };

  // Toast actions
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        login,
        signup,
        logout,
        wishlist,
        toggleWishlist,
        isInWishlist,
        bookings,
        reloadBookings,
        cancelUserBooking,
        rescheduleUserBooking,
        updateUserAssessment,
        toasts,
        addToast,
        removeToast,
        isLoadingUser,
        notifications,
        loadNotifications,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
