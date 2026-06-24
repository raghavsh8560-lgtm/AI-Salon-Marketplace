'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Heart, User, LogOut, AlertTriangle, CalendarRange, CheckCircle, Rss, ThumbsUp, Sparkles } from 'lucide-react';
import { useApp, type Booking } from '../../context/AppContext';
import { SalonCard, type Salon } from '../../components/SalonCard';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, bookings, cancelUserBooking, rescheduleUserBooking, wishlist, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'profile' | 'feed'>('bookings');
  
  // Modals state
  const [targetReschedule, setTargetReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [targetCancelId, setTargetCancelId] = useState<string | null>(null);

  // Profile fields state
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');

  // Sync tab with search parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'saved') setActiveTab('saved');
    else if (tab === 'profile') setActiveTab('profile');
    else if (tab === 'feed') setActiveTab('feed');
    else setActiveTab('bookings');
  }, [searchParams]);

  // Sync profile values when user resolves
  useEffect(() => {
    if (user) {
      setProfName(user.name);
      setProfEmail(user.email);
    }
  }, [user]);

  // Fetch salons to match wishlisted items
  const { data: salons = [] } = useQuery<Salon[]>({
    queryKey: ['salons-dashboard-saved'],
    queryFn: () => apiFetch('/salons'),
    enabled: !!user,
  });

  // Fetch timeline posts
  const { data: posts = [] } = useQuery<any[]>({
    queryKey: ['posts'],
    queryFn: () => apiFetch('/posts'),
    enabled: !!user,
  });

  // Toggle post like
  const likeMutation = useMutation({
    mutationFn: (postId: string) => {
      return apiFetch(`/posts/${postId}/like`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to like post.', 'error');
    }
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="w-12 h-12 text-primary animate-bounce" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-gray-500 max-w-xs">Please login to view appointments, favorites, and care profile settings.</p>
        <button
          onClick={() => router.push('/auth')}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Filter lists: bookings on server have status PENDING, CONFIRMED, CANCELLED
  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const pastBookings = bookings.filter(b => b.status === 'CANCELLED');

  // Filter wishlisted salons
  const savedSalons = salons.filter(s => wishlist.includes(s.id));

  // Change tab handler
  const handleTabChange = (tab: 'bookings' | 'saved' | 'profile' | 'feed') => {
    setActiveTab(tab);
    router.push(`/dashboard?tab=${tab}`);
  };

  // Perform Reschedule submission
  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReschedule) return;
    if (!rescheduleDate || !rescheduleTime) {
      addToast('Please pick a date and time slot', 'warning');
      return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(rescheduleDate) < today) {
      addToast('Rescheduled date cannot be in the past!', 'error');
      return;
    }

    try {
      await rescheduleUserBooking(targetReschedule.id, rescheduleDate, rescheduleTime);
      setTargetReschedule(null);
      setRescheduleDate('');
      setRescheduleTime('');
    } catch (err) {
      // handled inside context
    }
  };

  // Perform Cancellation
  const handleConfirmCancel = async () => {
    if (!targetCancelId) return;
    try {
      await cancelUserBooking(targetCancelId);
      setTargetCancelId(null);
    } catch (err) {
      // handled inside context
    }
  };

  // Save profile updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profEmail.trim()) {
      addToast('Please enter all profile fields', 'warning');
      return;
    }
    addToast('Profile metadata saved successfully!', 'success');
  };

  const handleLogoutClick = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 min-h-[82vh]">
      
      {/* Dashboard Welcome Header */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="h-16 w-16 sm:w-20 sm:h-20 rounded-2xl bg-pink-100 dark:bg-pink-950/40 text-primary flex items-center justify-center font-extrabold text-2xl border border-pink-200/40">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-gray-950 dark:text-white mb-0.5">
              Hello, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage appointments, reschedule slots, and view saved salon locations.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 dark:text-rose-400 dark:border-rose-900/60 dark:hover:bg-rose-950/20 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors focus:outline-none flex-shrink-0 active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Split layout: Sidebar nav & main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 flex flex-row lg:flex-col bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-2xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar w-full">
          {[
            { id: 'bookings', label: 'My Appointments', icon: Calendar },
            { id: 'feed', label: 'Salon Feed', icon: Rss },
            { id: 'saved', label: 'Saved Salons', icon: Heart },
            { id: 'profile', label: 'Account Profile', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors focus:outline-none flex-shrink-0 w-auto lg:w-full text-left cursor-pointer ${
                  isSelected 
                    ? 'bg-pink-50/70 dark:bg-pink-955/20 text-primary' 
                    : 'text-gray-655 dark:text-gray-355 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Section */}
        <main className="lg:col-span-9 flex flex-col gap-6 w-full text-xs sm:text-sm font-semibold">
          
          {/* APPOINTMENTS TAB */}
          {activeTab === 'bookings' && (
            <div className="flex flex-col gap-8">
              
              {/* Upcoming section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  Upcoming Appointments ({upcomingBookings.length})
                </h2>
                
                {upcomingBookings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {upcomingBookings.map((b) => (
                      <div 
                        key={b.id}
                        className="bg-white dark:bg-gray-850 border border-pink-100/50 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-5"
                      >
                        <div className="flex gap-4">
                          <img src={b.salon?.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=80'} alt={b.salon?.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-pink-50 flex-shrink-0" />
                          <div className="flex flex-col gap-1.5">
                            <h3 className="font-serif font-extrabold text-gray-950 dark:text-white text-base sm:text-lg leading-snug">
                              {b.salon?.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{b.date}</span>
                              <span className="text-gray-300 dark:text-gray-700">&bull;</span>
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{b.time}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-gray-400 dark:text-gray-450 leading-tight">
                              <MapPin className="w-4 h-4 text-gray-350 flex-shrink-0 mt-0.5" />
                              <span className="truncate max-w-[250px]">{b.salon?.address || b.salon?.location}</span>
                            </div>
                            
                            {/* Service names */}
                            <div className="text-[10px] font-bold text-gray-500 bg-gray-50 dark:bg-gray-900/60 px-2 py-1 rounded w-max mt-1 border border-gray-150">
                              Services: {b.services.map(s => s.name).join(', ')}
                            </div>
                          </div>
                        </div>

                        {/* Invoice & Actions Column */}
                        <div className="flex sm:flex-col justify-between items-end gap-3 sm:border-l sm:border-gray-100 sm:dark:border-gray-800 sm:pl-5 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] text-gray-450 uppercase tracking-wider font-extrabold">Counter Bill</div>
                            <div className="font-extrabold text-lg text-primary">₹{b.totalPrice}</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setTargetReschedule(b);
                                setRescheduleDate(b.date);
                                setRescheduleTime(b.time);
                              }}
                              className="border border-pink-100 hover:border-pink-300 dark:border-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => setTargetCancelId(b.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors focus:outline-none cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-pink-100/40 shadow-sm text-center flex flex-col items-center gap-3">
                    <CalendarRange className="w-10 h-10 text-gray-400" />
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white">No Active Bookings</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-normal">
                      Schedule beauty therapies, bridal sessions, and anti-frizz consults instantly.
                    </p>
                    <button
                      onClick={() => router.push('/browse')}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl mt-2 transition-colors focus:outline-none cursor-pointer"
                    >
                      Browse Salons
                    </button>
                  </div>
                )}
              </div>

              {/* Past history logs section */}
              <div className="flex flex-col gap-4 border-t border-pink-100/50 dark:border-gray-800/80 pt-6">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  Past History & Cancelled Appointments ({pastBookings.length})
                </h2>
                
                {pastBookings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3.5 opacity-80">
                    {pastBookings.map((b) => (
                      <div 
                        key={b.id}
                        className="bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold"
                      >
                        <div className="flex items-center gap-3.5">
                          <img src={b.salon?.coverImage} alt={b.salon?.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-pink-50" />
                          <div>
                            <h4 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">
                              {b.salon?.name}
                            </h4>
                            <div className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap font-medium">
                              <span>Date: {b.date}</span>
                              <span>&bull;</span>
                              <span>Total Value: ₹{b.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          <span className="bg-gray-100 dark:bg-gray-900 text-gray-550 dark:text-gray-400 font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-800/80 flex items-center gap-1">
                            Cancelled
                          </span>
                          <button
                            onClick={() => router.push(`/salon/${b.salonId}`)}
                            className="bg-pink-50 hover:bg-pink-100 text-primary px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Rebook Space
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-400 py-4 font-semibold">
                    No cancelled transactions logged.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SALON TIMELINE FEED TAB */}
          {activeTab === 'feed' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  Social & Salon Updates Feed
                </h2>
                <p className="text-xs text-gray-550 dark:text-gray-400 font-medium">
                  Stay updated with the latest style transformations, wellness announcements, and discount packages from Jaipur's premium salons.
                </p>
              </div>

              {posts && posts.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {posts.map((post: any) => {
                    const hasLiked = post.likes?.includes(user.id);
                    const createdAtString = new Date(post.createdAt).toLocaleDateString('default', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div 
                        key={post.id} 
                        className="bg-white dark:bg-gray-800 border border-pink-100/40 dark:border-gray-700/60 rounded-3xl p-5.5 shadow-sm flex flex-col gap-4"
                      >
                        {/* Post Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img 
                              src={post.salon?.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&auto=format&fit=crop&q=80'} 
                              alt={post.salon?.name} 
                              className="w-10 h-10 rounded-full object-cover border border-pink-50 flex-shrink-0"
                            />
                            <div>
                              <h4 
                                onClick={() => router.push(`/salon/${post.salonId}`)}
                                className="font-extrabold text-sm text-gray-950 dark:text-white hover:text-primary hover:underline cursor-pointer"
                              >
                                {post.salon?.name}
                              </h4>
                              <span className="text-[10px] text-gray-400 font-semibold">{createdAtString}</span>
                            </div>
                          </div>

                          <span className="bg-pink-50 dark:bg-pink-955/20 text-primary dark:text-pink-300 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-pink-100/30">
                            {post.category || 'Announcement'}
                          </span>
                        </div>

                        {/* Post Body Content */}
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>

                        {/* Post Media Image if any */}
                        {post.image && (
                          <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-750 max-h-[300px]">
                            <img 
                              src={post.image} 
                              alt="Feed Media" 
                              className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-250"
                            />
                          </div>
                        )}

                        {/* Post Actions footer */}
                        <div className="flex items-center justify-between border-t border-gray-55 dark:border-gray-750/70 pt-3.5 mt-1">
                          <button
                            onClick={() => likeMutation.mutate(post.id)}
                            disabled={likeMutation.isPending}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                              hasLiked 
                                ? 'bg-pink-50 dark:bg-pink-955/20 text-primary' 
                                : 'text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-primary text-primary' : 'text-gray-400'}`} />
                            <span>{post.likes?.length || 0} Likes</span>
                          </button>

                          <button
                            onClick={() => router.push(`/booking?salonId=${post.salonId}`)}
                            className="bg-primary hover:bg-primary-hover text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 duration-150 cursor-pointer"
                          >
                            Book Salon
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-pink-100/40 shadow-sm text-center flex flex-col items-center gap-3">
                  <Rss className="w-10 h-10 text-gray-300" />
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">No updates yet</h4>
                  <p className="text-xs text-gray-550 dark:text-gray-400 max-w-xs leading-normal">
                    Check back later for discount coupons, hairstyle updates, and announcements.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'saved' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                Saved Salons ({savedSalons.length})
              </h2>

              {savedSalons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  {savedSalons.map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-pink-100/40 shadow-sm text-center flex flex-col items-center gap-3">
                  <Heart className="w-10 h-10 text-gray-300 fill-gray-100" />
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">Your Wishlist is Empty</h4>
                  <p className="text-xs text-gray-550 dark:text-gray-400 max-w-xs leading-normal">
                    Save salons you love so you can quickly browse their services and book them in the future.
                  </p>
                  <button
                    onClick={() => router.push('/browse')}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl mt-2 transition-colors focus:outline-none cursor-pointer"
                  >
                    Browse Jaipur Salons
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-955 dark:text-white font-serif">Account Profile Details</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Keep your login and display metrics updated.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5 font-semibold text-xs sm:text-sm">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary font-medium text-xs sm:text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profEmail}
                    onChange={(e) => setProfEmail(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary font-medium text-xs sm:text-sm"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white font-extrabold px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 duration-200 focus:outline-none cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>

      </div>

      {/* Reschedule Booking Dialog */}
      <AnimatePresence>
        {targetReschedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setTargetReschedule(null)}
              className="fixed inset-0 bg-black"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm relative z-10 border border-gray-100 dark:border-gray-750 shadow-2xl p-6 sm:p-8 flex flex-col gap-5 text-xs font-semibold"
            >
              <div className="text-center">
                <h3 className="font-extrabold text-lg text-gray-950 dark:text-white flex items-center gap-1.5 justify-center">
                  <CalendarRange className="w-5 h-5 text-primary" /> Reschedule Appointment
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Adjust date and timeslot parameters.
                </p>
              </div>

              <form onSubmit={handleConfirmReschedule} className="flex flex-col gap-4 text-xs font-bold text-gray-500">
                {/* Date select */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider">New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-200 font-semibold"
                  />
                </div>

                {/* Time slot select */}
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider">New Time Slot</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl px-3.5 py-2.5 text-gray-850 dark:text-gray-200 font-semibold cursor-pointer"
                  >
                    {['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setTargetReschedule(null)}
                    className="px-4 py-2 font-bold text-xs text-gray-500 hover:text-gray-750 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
                  >
                    Update Appointment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Warning Dialog */}
      <AnimatePresence>
        {targetCancelId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setTargetCancelId(null)}
              className="fixed inset-0 bg-black"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm relative z-10 border border-gray-100 dark:border-gray-750 shadow-2xl p-6 sm:p-8 flex flex-col gap-5 text-xs font-semibold"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="bg-rose-50 dark:bg-rose-955/20 text-rose-500 p-3 rounded-full border border-rose-100 dark:border-rose-900/30">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-950 dark:text-white">Cancel Appointment?</h3>
                <p className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed max-w-[280px] font-medium">
                  Cancel this booking? This is immediate and free of charge, but cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setTargetCancelId(null)}
                  className="flex-1 border border-gray-205 dark:border-gray-700 py-2.5 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-850 hover:bg-gray-50/50 cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer animate-pulse"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function Dashboard() {
  return (
    <React.Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-500 font-semibold text-sm">Loading user dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </React.Suspense>
  );
}
