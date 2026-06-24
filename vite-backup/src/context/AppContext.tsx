import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BookingService {
  name: string;
  price: number;
}

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  salonImage: string;
  salonAddress: string;
  services: BookingService[];
  date: string;
  time: string;
  totalPrice: number;
  status: 'upcoming' | 'past' | 'cancelled';
  bookingId: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
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
  login: (email: string, name?: string, phone?: string) => void;
  signup: (name: string, email: string, phone: string) => void;
  logout: () => void;
  wishlist: string[]; // salon ids
  toggleWishlist: (salonId: string) => void;
  isInWishlist: (salonId: string) => boolean;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'bookingId'>) => string;
  cancelBooking: (bookingId: string) => void;
  rescheduleBooking: (bookingId: string, newDate: string, newTime: string) => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('salonai-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // User state (default: logged in as Raghav for a complete demo experience)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('salonai-user');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Raghav Sharma',
      email: 'raghav@example.com',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('salonai-wishlist');
    return saved ? JSON.parse(saved) : ['salon-1', 'salon-4']; // default saved salons
  });

  // Bookings state (pre-populate with 1 upcoming and 1 past booking for demonstration)
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('salonai-bookings');
    if (saved) return JSON.parse(saved);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 15);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];

    return [
      {
        id: 'b-mock-1',
        salonId: 'salon-1',
        salonName: 'La Belleza Salon & Spa',
        salonImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=80',
        salonAddress: 'Plot 12, Sardar Patel Marg, C-Scheme, Jaipur',
        services: [
          { name: 'Signature Haircut by Master Stylist', price: 950 },
          { name: 'Gel Extensions with Hand-painted Nail Art', price: 1799 }
        ],
        date: tomorrowStr,
        time: '02:00 PM',
        totalPrice: 2749,
        status: 'upcoming',
        bookingId: 'SAI-789321'
      },
      {
        id: 'b-mock-2',
        salonId: 'salon-3',
        salonName: 'The Pink City Salon',
        salonImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&auto=format&fit=crop&q=80',
        salonAddress: 'B-24, Sector 5, Malviya Nagar, Jaipur',
        services: [
          { name: 'Affordable Bridal Makeup', price: 1899 },
          { name: 'Nourishing Herbal Hair Spa', price: 699 }
        ],
        date: lastMonthStr,
        time: '11:00 AM',
        totalPrice: 2598,
        status: 'past',
        bookingId: 'SAI-124982'
      }
    ];
  });

  // Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('salonai-theme', theme);
  }, [theme]);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('salonai-user', user ? JSON.stringify(user) : '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('salonai-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('salonai-bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    addToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // Auth actions
  const login = (email: string, name: string = 'User', phone: string = '+91 99999 99999') => {
    setUser({
      name,
      email,
      phone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    });
    addToast('Logged in successfully!', 'success');
  };

  const signup = (name: string, email: string, phone: string) => {
    setUser({ name, email, phone });
    addToast('Account created successfully!', 'success');
  };

  const logout = () => {
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  // Wishlist actions
  const toggleWishlist = (salonId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(salonId);
      if (exists) {
        addToast('Removed from favorites', 'info');
        return prev.filter(id => id !== salonId);
      } else {
        addToast('Added to favorites!', 'success');
        return [...prev, salonId];
      }
    });
  };

  const isInWishlist = (salonId: string) => wishlist.includes(salonId);

  // Bookings actions
  const addBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'bookingId'>) => {
    const randomId = 'SAI-' + Math.floor(100000 + Math.random() * 900000);
    const id = 'b-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: Booking = {
      ...bookingData,
      id,
      status: 'upcoming',
      bookingId: randomId
    };
    setBookings(prev => [newBooking, ...prev]);
    addToast('Appointment booked successfully!', 'success');
    return randomId;
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    addToast('Booking cancelled successfully', 'info');
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newTime: string) => {
    setBookings(prev =>
      prev.map(b => (b.bookingId === bookingId ? { ...b, date: newDate, time: newTime } : b))
    );
    addToast('Appointment rescheduled successfully!', 'success');
  };

  // Toast actions
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
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
        addBooking,
        cancelBooking,
        rescheduleBooking,
        toasts,
        addToast,
        removeToast
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
