'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Calendar, Clock, MapPin, Phone, Users, 
  Settings, Scissors, Plus, Trash2, BarChart3, 
  Check, X, LogOut, AlertTriangle, Play, Image, Rss, ThumbsUp, Lock
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { apiFetch } from '../../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsSummary {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  revenue: number;
  customerGrowth: number;
}

interface PopularService {
  name: string;
  count: number;
}

interface MonthlyBooking {
  month: string;
  count: number;
}

interface OwnerAnalyticsResponse {
  summary: AnalyticsSummary;
  popularServices: PopularService[];
  monthlyBookings: MonthlyBooking[];
}

export default function SalonOwnerDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, addToast } = useApp();

  // Owned Salon reference
  const ownedSalon = user?.ownedSalons?.[0] || null;
  const salonId = ownedSalon?.id || '';

  // Redirect if not signed in or not an owner
  useEffect(() => {
    if (user && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch Owner Analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<OwnerAnalyticsResponse>({
    queryKey: ['owner-analytics', salonId],
    queryFn: () => apiFetch(`/analytics/owner/${salonId}`),
    enabled: !!salonId,
  });

  // Fetch full Salon Details
  const { data: salon, isLoading: isLoadingSalon } = useQuery<any>({
    queryKey: ['owner-salon-details', salonId],
    queryFn: () => apiFetch(`/salons/${salonId}`),
    enabled: !!salonId,
  });

  // Fetch Salon Bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<any[]>({
    queryKey: ['owner-bookings', salonId],
    queryFn: () => apiFetch(`/bookings/owner/${salonId}`),
    enabled: !!salonId,
  });

  // Fetch all feed posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<any[]>({
    queryKey: ['owner-posts'],
    queryFn: () => apiFetch('/posts'),
  });

  const salonPosts = posts.filter((p: any) => p.salonId === salonId);

  // Slot freezing state & query
  const [freezeDate, setFreezeDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotReasons, setSlotReasons] = useState<Record<string, string>>({});

  const { data: slotStatus } = useQuery<{
    frozenSlots: { time: string; reason: string }[];
    occupancy: Record<string, number>;
  }>({
    queryKey: ['owner-slots-occupancy', salonId, freezeDate],
    queryFn: () => apiFetch(`/salons/${salonId}/slots-occupancy?date=${freezeDate}`),
    enabled: !!salonId && !!freezeDate,
  });

  // Salon Info State
  const [salonName, setSalonName] = useState('');
  const [salonLogo, setSalonLogo] = useState('');
  const [salonCover, setSalonCover] = useState('');
  const [salonBrandStory, setSalonBrandStory] = useState('');
  const [salonOverview, setSalonOverview] = useState('');
  const [salonHours, setSalonHours] = useState('');
  const [salonPhone, setSalonPhone] = useState('');
  const [salonAddress, setSalonAddress] = useState('');
  const [salonArea, setSalonArea] = useState('C-Scheme');
  const [salonPricing, setSalonPricing] = useState('MID');
  const [salonGender, setSalonGender] = useState('UNISEX');
  const [salonAmenities, setSalonAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Sync Salon Info fields
  useEffect(() => {
    if (salon) {
      setSalonName(salon.name || '');
      setSalonLogo(salon.logo || '');
      setSalonCover(salon.coverImage || '');
      setSalonBrandStory(salon.brandStory || '');
      setSalonOverview(salon.overview || '');
      setSalonHours(salon.openingHours || '');
      setSalonPhone(salon.phone || '');
      setSalonAddress(salon.address || '');
      setSalonArea(salon.area || 'C-Scheme');
      setSalonPricing(salon.pricingCategory || 'MID');
      setSalonGender(salon.genderCategory || 'UNISEX');
      setSalonAmenities(salon.amenities || []);
      setVideoUrl(salon.videoUrl || '');
    }
  }, [salon]);

  // Social feed creation state
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Announcement');
  const [postImage, setPostImage] = useState('');

  // Add Professional Stylist fields
  const [profName, setProfName] = useState('');
  const [profSpec, setProfSpec] = useState('Hair Styling Specialist');
  const [profExp, setProfExp] = useState(5);
  const [profBio, setProfBio] = useState('');
  const [profImage, setProfImage] = useState('');

  // Add Service Menu fields
  const [srvName, setSrvName] = useState('');
  const [srvCat, setSrvCat] = useState('Hair Cut');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDur, setSrvDur] = useState(30);
  const [srvDesc, setSrvDesc] = useState('');

  // Mutations
  const updateSalonMutation = useMutation({
    mutationFn: (updatedData: any) => apiFetch(`/salons/${salonId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-salon-details', salonId] });
      addToast('Salon profile updated successfully! 🌸', 'success');
    }
  });

  const createPostMutation = useMutation({
    mutationFn: (newPost: any) => apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify(newPost)
    }),
    onSuccess: () => {
      setPostContent('');
      setPostImage('');
      queryClient.invalidateQueries({ queryKey: ['owner-posts'] });
      addToast('Social post published on feed! 🌸', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to publish post.', 'error');
    }
  });

  const addProfMutation = useMutation({
    mutationFn: (newProf: any) => apiFetch(`/salons/${salonId}/professionals`, {
      method: 'POST',
      body: JSON.stringify(newProf)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-salon-details', salonId] });
      setProfName('');
      setProfBio('');
      setProfImage('');
      addToast('Stylist added successfully.', 'success');
    }
  });

  const deleteProfMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/salons/professionals/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-salon-details', salonId] });
      addToast('Stylist removed.', 'info');
    }
  });

  const addSrvMutation = useMutation({
    mutationFn: (newSrv: any) => apiFetch(`/salons/${salonId}/services`, {
      method: 'POST',
      body: JSON.stringify(newSrv)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-salon-details', salonId] });
      setSrvName('');
      setSrvPrice('');
      setSrvDesc('');
      addToast('Service added to menu.', 'success');
    }
  });

  const deleteSrvMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/salons/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-salon-details', salonId] });
      addToast('Service removed from menu.', 'info');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiFetch(`/bookings/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings', salonId] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics', salonId] });
      addToast(`Booking status updated to ${data.booking.status}.`, 'success');
    }
  });

  const handleFreeze = async (time: string) => {
    const reason = slotReasons[time] || 'Scheduled Maintenance';
    try {
      await apiFetch(`/salons/${salonId}/freeze-slot`, {
        method: 'POST',
        body: JSON.stringify({ date: freezeDate, time, reason }),
      });
      addToast(`Slot ${time} frozen successfully.`, 'success');
      setSlotReasons(prev => ({ ...prev, [time]: '' }));
      queryClient.invalidateQueries({ queryKey: ['owner-slots-occupancy'] });
    } catch (err: any) {
      addToast(err.message || 'Failed to freeze slot.', 'error');
    }
  };

  const handleUnfreeze = async (time: string) => {
    try {
      await apiFetch(`/salons/${salonId}/unfreeze-slot`, {
        method: 'POST',
        body: JSON.stringify({ date: freezeDate, time }),
      });
      addToast(`Slot ${time} unfrozen.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['owner-slots-occupancy'] });
    } catch (err: any) {
      addToast(err.message || 'Failed to unfreeze slot.', 'error');
    }
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      addToast('Post content cannot be empty.', 'warning');
      return;
    }
    createPostMutation.mutate({
      salonId,
      content: postContent,
      category: postCategory,
      image: postImage || null
    });
  };

  const handleAddStylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) {
      addToast('Stylist name is required.', 'warning');
      return;
    }
    addProfMutation.mutate({
      name: profName,
      specialization: profSpec,
      yearsExperience: Number(profExp),
      bio: profBio,
      profileImage: profImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim() || !srvPrice.trim()) {
      addToast('Service name and price are required.', 'warning');
      return;
    }
    addSrvMutation.mutate({
      name: srvName,
      category: srvCat,
      price: parseFloat(srvPrice),
      duration: Number(srvDur),
      description: srvDesc,
    });
  };

  const handleSaveSalonInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSalonMutation.mutate({
      name: salonName,
      logo: salonLogo,
      coverImage: salonCover,
      brandStory: salonBrandStory,
      overview: salonOverview,
      openingHours: salonHours,
      phone: salonPhone,
      address: salonAddress,
      area: salonArea,
      pricingCategory: salonPricing,
      genderCategory: salonGender,
      amenities: salonAmenities,
      videoUrl,
    });
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !salonAmenities.includes(newAmenity.trim())) {
      setSalonAmenities(prev => [...prev, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  if (!user || !ownedSalon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="w-12 h-12 text-primary animate-bounce" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Salon Owner Access Required</h2>
        <p className="text-xs text-gray-550 max-w-xs">You must be logged in as an Owner demo user (`owner@royalglow.com`) to manage a salon.</p>
        <button onClick={() => router.push('/auth')} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer">
          Go to Sign In
        </button>
      </div>
    );
  }

  if (isLoadingSalon || !salon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-500 font-semibold text-xs sm:text-sm">Initializing your salon workspace...</p>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const otherBookings = bookings.filter(b => b.status !== 'PENDING');

  const operatingSlots = ['09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 min-h-[85vh] font-sans">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="h-14 w-14 rounded-2xl bg-pink-100 dark:bg-pink-955/20 text-primary flex items-center justify-center font-serif font-extrabold text-xl border border-pink-200/40">
            {ownedSalon.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/20 uppercase tracking-widest font-black inline-block mb-1.5">Salon Workspace</span>
            <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-gray-955 dark:text-white leading-snug">
              {ownedSalon.name} Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Unified 3-Column Administration Hub for Stylists, Menu, Posts, and Bookings.</p>
          </div>
        </div>
        
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="flex items-center gap-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 dark:text-rose-455 dark:border-rose-900/60 dark:hover:bg-rose-955/20 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors focus:outline-none flex-shrink-0 active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main 3-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full text-xs font-semibold">
        
        {/* ==================== COLUMN 1: LEFT SIDEBAR (METRICS & PENDINGS) ==================== */}
        <div className="lg:col-span-3 flex flex-col gap-6 w-full lg:sticky lg:top-4 lg:overflow-y-auto lg:max-h-[85vh] no-scrollbar">
          
          {/* Quick Metrics Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-gray-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Financials & Orders</span>
            </h3>

            {isLoadingAnalytics ? (
              <div className="text-center py-4 text-gray-400 animate-pulse">Calculating metrics...</div>
            ) : analytics ? (
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide block">Total Bookings</span>
                  <span className="text-base font-black text-gray-950 dark:text-white mt-0.5 block">{analytics.summary.totalBookings}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide block">Estimated Rev</span>
                  <span className="text-base font-black text-primary mt-0.5 block">₹{analytics.summary.revenue}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide block">Completed</span>
                  <span className="text-base font-black text-emerald-600 mt-0.5 block">{analytics.summary.completedBookings}</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide block">Growth</span>
                  <span className="text-base font-black text-purple-600 mt-0.5 block">+{analytics.summary.customerGrowth}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-gray-400">No stats.</div>
            )}
          </div>

          {/* Pending Bookings Requests */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Pending Requests</span>
              </span>
              <span className="bg-amber-50 dark:bg-amber-955/25 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-black border border-amber-200">
                {pendingBookings.length}
              </span>
            </h3>

            {pendingBookings.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pendingBookings.map((b: any) => (
                  <div key={b.id} className="p-3 bg-amber-50/20 dark:bg-amber-955/5 border border-amber-100/50 dark:border-amber-900/20 rounded-2xl flex flex-col gap-2.5">
                    <div>
                      <div className="font-extrabold text-gray-900 dark:text-white text-xs">{b.user?.name || 'Guest User'}</div>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{b.date} at {b.time}</div>
                      <div className="text-[9px] text-primary mt-1">Services: {b.services.map((s: any) => s.name).join(', ')}</div>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'CONFIRMED' })}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'REJECTED' })}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 text-center py-4 font-semibold">No pending requests.</p>
            )}
          </div>

          {/* Bookings Timeline / Past Bookings */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm flex flex-col gap-3.5">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-gray-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>Confirmed & Past ({otherBookings.length})</span>
            </h3>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
              {otherBookings.length > 0 ? (
                otherBookings.map((b: any) => (
                  <div key={b.id} className="p-2.5 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-xl flex justify-between items-start text-[11px]">
                    <div>
                      <div className="font-extrabold text-gray-800 dark:text-gray-200">{b.user?.name || 'Guest User'}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">{b.date} &bull; {b.time}</div>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      b.status === 'CONFIRMED' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : b.status === 'COMPLETED'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-550'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 text-center py-4">No other bookings found.</p>
              )}
            </div>
          </div>

        </div>

        {/* ==================== COLUMN 2: CENTER TIMELINE FEED (POST CREATION & FEED LIST) ==================== */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* Post Creation Form */}
          <div className="bg-white dark:bg-gray-800 p-5.5 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-950 dark:text-white font-serif">Publish Salon Update</h3>
              <p className="text-xs text-gray-550 mt-0.5">Share Style Transformations, Promotional Offers, or announcements on the public timeline.</p>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wide font-extrabold">Post Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-2 cursor-pointer font-bold"
                >
                  <option value="Announcement">Announcement 📢</option>
                  <option value="Offer">Discount Offer 🏷️</option>
                  <option value="Transformation">Style Transformation ✂️</option>
                  <option value="Premium Package">Premium Package ✨</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wide font-extrabold">Post Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your style transformation, bridal offer, anti-frizz success story..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl p-3 font-medium text-xs sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wide font-extrabold">Optional Image URL</label>
                <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-805 rounded-xl px-3.5 py-2.5">
                  <Image className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                    className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer mt-2"
              >
                {createPostMutation.isPending ? 'Publishing...' : 'Publish Post to Feed'}
              </button>
            </form>
          </div>

          {/* Social Feed List */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-gray-400 flex items-center gap-1.5">
              <Rss className="w-4 h-4 text-primary" />
              <span>Salon Timeline Updates ({salonPosts.length})</span>
            </h3>

            {salonPosts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {salonPosts.map((post: any) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 border border-pink-100/40 dark:border-gray-700/60 rounded-3xl p-5 shadow-sm flex flex-col gap-3 animate-fadeIn">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-pink-50 text-primary border border-pink-100 flex items-center justify-center font-extrabold text-xs">
                          {ownedSalon.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-gray-900 dark:text-white">{ownedSalon.name}</div>
                          <div className="text-[9px] text-gray-400 font-semibold">{new Date(post.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <span className="bg-pink-50 dark:bg-pink-955/20 text-primary dark:text-pink-300 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.image && (
                      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-750 max-h-[220px]">
                        <img src={post.image} alt="Media" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-750/60 pt-3 mt-1 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-primary fill-pink-100" />
                        <span>{post.likes?.length || 0} Likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-pink-100/40 shadow-sm text-center flex flex-col items-center gap-2">
                <Rss className="w-8 h-8 text-gray-300" />
                <h4 className="font-bold text-gray-900 dark:text-white text-xs">No posts yet</h4>
                <p className="text-[11px] text-gray-500 max-w-[200px]">Create style posts above to broadcast updates to users.</p>
              </div>
            )}
          </div>

        </div>

        {/* ==================== COLUMN 3: RIGHT PANEL (EDIT PROFILE, MENU, STAFF, FREEZING) ==================== */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-4 lg:overflow-y-auto lg:max-h-[85vh] no-scrollbar">
          
          {/* Slot Freezing controls */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-950 dark:text-white font-serif flex items-center gap-1.5">
                <Lock className="w-5 h-5 text-primary" />
                <span>Slot Freezing Control</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Temporarily block booking slots for staff training, rest, or emergency closures.</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-wide font-extrabold">Choose Date</label>
                <input
                  type="date"
                  required
                  value={freezeDate}
                  onChange={(e) => setFreezeDate(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-850 rounded-xl px-3.5 py-2 font-bold text-gray-800 dark:text-gray-200"
                />
              </div>

              {/* Slots rendering list */}
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar mt-2 border-t border-gray-50 dark:border-gray-800 pt-3">
                {operatingSlots.map(time => {
                  const frozenDetails = slotStatus?.frozenSlots?.find(f => f.time === time);
                  const occupancy = slotStatus?.occupancy?.[time] || 0;
                  const isFrozen = !!frozenDetails;

                  return (
                    <div key={time} className="p-3 bg-gray-50/70 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-xs text-gray-800 dark:text-gray-200">{time}</span>
                        <span className="text-[9px] text-gray-400">({occupancy}/2 bookings)</span>
                      </div>

                      {isFrozen ? (
                        <div className="flex justify-between items-center gap-2 bg-red-50/30 p-2 rounded-xl border border-red-105">
                          <span className="text-[10px] text-red-500 font-extrabold truncate max-w-[120px]">
                            Frozen: {frozenDetails.reason}
                          </span>
                          <button
                            onClick={() => handleUnfreeze(time)}
                            className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-lg cursor-pointer"
                          >
                            Unfreeze
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5 items-center w-full">
                          <input
                            type="text"
                            placeholder="Reason (e.g. staff rest)"
                            value={slotReasons[time] || ''}
                            onChange={(e) => setSlotReasons(prev => ({ ...prev, [time]: e.target.value }))}
                            className="bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 text-[10px] px-2 py-1 rounded-lg flex-grow font-medium"
                          />
                          <button
                            onClick={() => handleFreeze(time)}
                            className="bg-primary hover:bg-primary-hover text-white text-[9px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0 cursor-pointer"
                          >
                            Freeze Slot
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Edit Profile accordion container */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm overflow-hidden">
            <details className="group">
              <summary className="p-5 font-serif font-extrabold text-gray-950 dark:text-white flex justify-between items-center cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>Edit Salon Information</span>
                </span>
                <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">&darr;</span>
              </summary>
              
              <form onSubmit={handleSaveSalonInfo} className="p-5 border-t border-gray-50 dark:border-gray-800 flex flex-col gap-4 font-semibold text-xs text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Salon Name</label>
                  <input type="text" required value={salonName} onChange={(e) => setSalonName(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Phone Number</label>
                  <input type="text" required value={salonPhone} onChange={(e) => setSalonPhone(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Opening Hours</label>
                  <input type="text" required value={salonHours} onChange={(e) => setSalonHours(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Area Neighborhood</label>
                  <select value={salonArea} onChange={(e) => setSalonArea(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 cursor-pointer font-bold">
                    {['C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Raja Park', 'Mansarovar', 'Jagatpura'].map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Price Segment</label>
                  <select value={salonPricing} onChange={(e) => setSalonPricing(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 cursor-pointer font-bold">
                    <option value="BUDGET">BUDGET</option>
                    <option value="MID">MID</option>
                    <option value="LUXURY">LUXURY</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Audience Gender Category</label>
                  <select value={salonGender} onChange={(e) => setSalonGender(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 cursor-pointer font-bold">
                    <option value="UNISEX">UNISEX</option>
                    <option value="FEMALE">FEMALE ONLY</option>
                    <option value="MALE">MALE ONLY</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Full Address Address</label>
                  <input type="text" required value={salonAddress} onChange={(e) => setSalonAddress(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Logo Image URL</label>
                  <input type="text" value={salonLogo} onChange={(e) => setSalonLogo(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Cover Image URL</label>
                  <input type="text" value={salonCover} onChange={(e) => setSalonCover(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Walkthrough Video URL</label>
                  <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Brand Story Description</label>
                  <textarea rows={2} value={salonBrandStory} onChange={(e) => setSalonBrandStory(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 font-medium" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Salon Overview Statement</label>
                  <textarea rows={3} value={salonOverview} onChange={(e) => setSalonOverview(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 font-medium" />
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-gray-150">
                  <label className="text-[10px] text-gray-450 uppercase tracking-wider font-extrabold">Amenities</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Add amenity..." value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl px-3 py-2 font-medium flex-1" />
                    <button type="button" onClick={handleAddAmenity} className="bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 rounded-xl font-bold cursor-pointer shadow">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {salonAmenities.map((a, idx) => (
                      <span key={idx} className="bg-pink-50/60 dark:bg-pink-955/20 text-primary text-[10px] px-2 py-0.5 rounded border border-pink-100 flex items-center gap-1">
                        {a}
                        <X className="w-3 h-3 text-gray-400 hover:text-primary cursor-pointer" onClick={() => setSalonAmenities(prev => prev.filter((_, i) => i !== idx))} />
                      </span>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={updateSalonMutation.isPending} className="bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 cursor-pointer mt-3">
                  {updateSalonMutation.isPending ? 'Saving...' : 'Save Profile Details'}
                </button>
              </form>
            </details>
          </div>

          {/* Services Menu CRUD accordion */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm overflow-hidden">
            <details className="group">
              <summary className="p-5 font-serif font-extrabold text-gray-955 dark:text-white flex justify-between items-center cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-primary" />
                  <span>Services & Treatments</span>
                </span>
                <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">&darr;</span>
              </summary>

              <div className="p-5 border-t border-gray-50 dark:border-gray-800 flex flex-col gap-5 text-left text-xs font-semibold">
                
                {/* List current services */}
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar border-b border-gray-50 dark:border-gray-800 pb-4">
                  {salon.services && salon.services.map((srv: any) => (
                    <div key={srv.id} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <div className="font-extrabold text-gray-800 dark:text-gray-200">{srv.name}</div>
                        <div className="text-[9px] text-gray-400 font-semibold">{srv.duration} mins &bull; ₹{srv.price}</div>
                      </div>
                      <button
                        onClick={() => deleteSrvMutation.mutate(srv.id)}
                        disabled={deleteSrvMutation.isPending}
                        className="p-1.5 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Service form */}
                <form onSubmit={handleAddService} className="flex flex-col gap-3 font-semibold">
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Add New Service</h4>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-450 uppercase font-extrabold">Service Name</label>
                    <input type="text" required placeholder="Hydra Facial Deluxe" value={srvName} onChange={(e) => setSrvName(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-450 uppercase font-extrabold">Price (INR)</label>
                      <input type="number" required placeholder="2499" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-455 uppercase font-extrabold">Duration (min)</label>
                      <input type="number" required value={srvDur} onChange={(e) => setSrvDur(Number(e.target.value))} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-455 uppercase font-extrabold">Category</label>
                    <select value={srvCat} onChange={(e) => setSrvCat(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 cursor-pointer font-bold">
                      {['Hair Cut', 'Hair Spa', 'Facial', 'Bridal Makeup', 'Nail Art', 'Hair Color', 'Skin Care', 'Groom Packages'].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-450 uppercase font-extrabold">Description</label>
                    <textarea rows={2} placeholder="Brief benefits description..." value={srvDesc} onChange={(e) => setSrvDesc(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 font-medium" />
                  </div>

                  <button type="submit" disabled={addSrvMutation.isPending} className="bg-primary hover:bg-primary-hover text-white py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95 cursor-pointer mt-1">
                    {addSrvMutation.isPending ? 'Adding...' : 'Add Service'}
                  </button>
                </form>

              </div>
            </details>
          </div>

          {/* Stylists CRUD accordion */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm overflow-hidden">
            <details className="group">
              <summary className="p-5 font-serif font-extrabold text-gray-955 dark:text-white flex justify-between items-center cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Stylists & Staff</span>
                </span>
                <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">&darr;</span>
              </summary>

              <div className="p-5 border-t border-gray-50 dark:border-gray-800 flex flex-col gap-5 text-left text-xs font-semibold">
                
                {/* List current professionals */}
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar border-b border-gray-50 dark:border-gray-800 pb-4">
                  {salon.professionals && salon.professionals.map((prof: any) => (
                    <div key={prof.id} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <img src={prof.profileImage} alt={prof.name} className="w-9 h-9 rounded-full object-cover border border-pink-100" />
                        <div>
                          <div className="font-extrabold text-gray-800 dark:text-gray-200">{prof.name}</div>
                          <div className="text-[9px] text-gray-400 font-semibold">{prof.specialization} &bull; {prof.yearsExperience} yrs exp</div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProfMutation.mutate(prof.id)}
                        disabled={deleteProfMutation.isPending}
                        className="p-1.5 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Professional Form */}
                <form onSubmit={handleAddStylist} className="flex flex-col gap-3 font-semibold">
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Add New Stylist</h4>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-450 uppercase font-extrabold">Full Name</label>
                    <input type="text" required placeholder="Aarav Sharma" value={profName} onChange={(e) => setProfName(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-450 uppercase font-extrabold">Specialization</label>
                      <input type="text" value={profSpec} onChange={(e) => setProfSpec(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-455 uppercase font-extrabold">Experience (years)</label>
                      <input type="number" value={profExp} onChange={(e) => setProfExp(Number(e.target.value))} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-450 uppercase font-extrabold">Profile Photo URL</label>
                    <input type="text" placeholder="https://images.unsplash.com/..." value={profImage} onChange={(e) => setProfImage(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 font-medium" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-450 uppercase font-extrabold">Bio</label>
                    <textarea rows={2} placeholder="Expertise description..." value={profBio} onChange={(e) => setProfBio(e.target.value)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 font-medium" />
                  </div>

                  <button type="submit" disabled={addProfMutation.isPending} className="bg-primary hover:bg-primary-hover text-white py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95 cursor-pointer mt-1">
                    {addProfMutation.isPending ? 'Saving Stylist...' : 'Add Stylist'}
                  </button>
                </form>

              </div>
            </details>
          </div>

        </div>

      </div>

    </div>
  );
}
