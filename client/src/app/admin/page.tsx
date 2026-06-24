'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  Award,
  BarChart3,
  AlertCircle,
  ShoppingBag,
  Landmark,
  Star,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Ban,
  Trash2,
  ShieldCheck,
  UserX,
  UserCheck,
  MapPin,
  Clock,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiFetch } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Summary {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  userGrowth: number;
  conversionRate: number;
  totalSalons?: number;
  totalUsers?: number;
  totalRevenue?: number;
  pendingBookings?: number;
  completedBookings?: number;
  rejectedBookings?: number;
  upcomingBookings?: number;
}

interface AIAnalytics {
  mostAskedQuestions: Array<{ question: string; count: number }>;
  mostRecommendedServices: Array<{ service: string; count: number }>;
  mostRecommendedSalons: Array<{ salonName: string; count: number }>;
  popularTreatments: Array<{ treatment: string; count: number }>;
  chatSatisfaction: number;
  totalChats: number;
}

interface SalonPerformance {
  salonId: string;
  name: string;
  area: string;
  rating: number;
  bookingsCount?: number;
  revenue?: number;
  ownerName?: string;
  totalBookings?: number;
  upcomingBookings?: number;
  completedBookings?: number;
  rejectedBookings?: number;
  visitors?: number;
}

interface AnalyticsResponse {
  summary: Summary;
  aiAnalytics: AIAnalytics;
  salonPerformance: SalonPerformance[];
}

export default function AdminDashboard() {
  const { user, addToast } = useApp();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'users-salons' | 'bookings'>('overview');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [salonSearch, setSalonSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [inspectedSalon, setInspectedSalon] = useState<any | null>(null);

  // Fetch analytics metrics
  const { data: analyticsData, isLoading: isAnalyticsLoading, error: analyticsError } = useQuery<AnalyticsResponse>({
    queryKey: ['admin-analytics'],
    queryFn: () => apiFetch('/analytics'),
    enabled: !!user && user.role === 'ADMIN',
  });

  // Fetch all users
  const { data: users, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ['admin-users'],
    queryFn: () => apiFetch('/auth/admin/users'),
    enabled: !!user && user.role === 'ADMIN' && activeTab === 'users-salons',
  });

  // Fetch all salons
  const { data: salons, isLoading: isSalonsLoading, refetch: refetchSalons } = useQuery<any[]>({
    queryKey: ['admin-salons'],
    queryFn: () => apiFetch('/salons'),
    enabled: !!user && user.role === 'ADMIN',
  });

  // Fetch all bookings
  const { data: allBookings, isLoading: isBookingsLoading, refetch: refetchBookings } = useQuery<any[]>({
    queryKey: ['admin-all-bookings'],
    queryFn: () => apiFetch('/bookings/admin/all'),
    enabled: !!user && user.role === 'ADMIN',
  });

  // Delete Salon Mutation
  const deleteSalonMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/salons/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-salons'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      addToast('Salon deleted from marketplace catalog. 🗑️', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to delete salon.', 'error');
    }
  });

  const handleDeleteSalon = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}" from the marketplace? All stylists, booking records, and slots will be purged.`)) {
      deleteSalonMutation.mutate(id);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-primary animate-bounce" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Authentication Required</h2>
        <p className="text-xs text-gray-500 max-w-xs">Please sign in as an Administrator to view AI analytics, booking conversion indices, and salon revenue logs.</p>
        <a
          href="/auth?redirect=/admin"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
        >
          Go to Sign In
        </a>
      </div>
    );
  }

  // User Actions
  const handleToggleUserSuspension = async (userId: string, currentSuspended: boolean) => {
    try {
      await apiFetch(`/auth/admin/users/${userId}/suspend`, {
        method: 'PUT',
        body: JSON.stringify({ suspend: !currentSuspended })
      });
      addToast(currentSuspended ? 'User unsuspended successfully! 🔓' : 'User suspended successfully! 🔒', 'success');
      refetchUsers();
    } catch (err: any) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) return;
    try {
      await apiFetch(`/auth/admin/users/${userId}`, {
        method: 'DELETE'
      });
      addToast('User account deleted successfully. 🗑️', 'success');
      refetchUsers();
    } catch (err: any) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  // Salon Actions
  const handleToggleSalonVerification = async (salonId: string, currentVerified: boolean) => {
    try {
      await apiFetch(`/salons/${salonId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ isVerified: !currentVerified })
      });
      addToast(!currentVerified ? 'Salon verified successfully! 🛡️' : 'Salon verification removed.', 'success');
      refetchSalons();
    } catch (err: any) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleToggleSalonSuspension = async (salonId: string, currentStatus: string) => {
    const willSuspend = currentStatus !== 'SUSPENDED';
    try {
      await apiFetch(`/salons/${salonId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ suspend: willSuspend })
      });
      addToast(willSuspend ? 'Salon suspended successfully! 🛑' : 'Salon status restored to APPROVED! ✅', 'success');
      refetchSalons();
    } catch (err: any) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  // Booking Actions
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await apiFetch(`/bookings/${bookingId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus })
      });
      addToast(`Booking status updated to ${newStatus}. ✨`, 'success');
      refetchBookings();
    } catch (err: any) {
      addToast(err.message || 'Action failed.', 'error');
    }
  };

  // Fallback demo metrics if database error or empty data
  const fallbackData: AnalyticsResponse = {
    summary: {
      totalBookings: 24,
      confirmedBookings: 20,
      cancelledBookings: 4,
      userGrowth: 56,
      conversionRate: 48.5,
      totalSalons: 3,
      totalUsers: 15,
      totalRevenue: 28750,
      pendingBookings: 2,
      completedBookings: 18,
      rejectedBookings: 4,
      upcomingBookings: 4
    },
    aiAnalytics: {
      mostAskedQuestions: [
        { question: 'Dry hair remedies under Jaipurs climate', count: 18 },
        { question: 'Best bridal makeup studios under ₹10,000', count: 14 },
        { question: 'De-tan facial options near Vaishali Nagar', count: 12 },
        { question: 'Anti-frizz hair spas for curly hair types', count: 9 },
        { question: 'Complimentary beard trim packages for men', count: 7 }
      ],
      mostRecommendedServices: [
        { service: 'Keratin Nourishing Hair Spa', count: 20 },
        { service: 'Hydra Facial Brightening Cure', count: 16 },
        { service: 'O3+ Power Facial', count: 11 }
      ],
      mostRecommendedSalons: [
        { salonName: 'La Belleza Salon & Spa', count: 15 },
        { salonName: 'Aura Unisex Salon', count: 12 },
        { salonName: 'The Pink City Salon', count: 8 }
      ],
      popularTreatments: [
        { treatment: 'Bridal Makeovers', count: 25 }
      ],
      chatSatisfaction: 4.8,
      totalChats: 55,
    },
    salonPerformance: [
      { salonId: 'salon-1', name: 'La Belleza Salon & Spa', area: 'C-Scheme', rating: 4.8, bookingsCount: 14, revenue: 17500, ownerName: 'La Belleza Owner', totalBookings: 14, upcomingBookings: 2, completedBookings: 10, rejectedBookings: 2, visitors: 164 },
      { salonId: 'salon-2', name: 'Aura Unisex Salon', area: 'Vaishali Nagar', rating: 4.6, bookingsCount: 7, revenue: 8750, ownerName: 'Aura Owner', totalBookings: 7, upcomingBookings: 1, completedBookings: 5, rejectedBookings: 1, visitors: 108 },
      { salonId: 'salon-3', name: 'The Pink City Salon', area: 'Malviya Nagar', rating: 4.4, bookingsCount: 3, revenue: 3750, ownerName: 'Pink City Owner', totalBookings: 3, upcomingBookings: 0, completedBookings: 2, rejectedBookings: 1, visitors: 76 }
    ]
  };

  const activeData = analyticsError || !analyticsData ? fallbackData : analyticsData;
  const totalRevenue = activeData.salonPerformance.reduce((sum, s) => sum + (s.revenue || 0), 0);

  // Filter lists
  const filteredUsers = (users || []).filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredSalons = (salons || []).filter(s =>
    s.name?.toLowerCase().includes(salonSearch.toLowerCase()) ||
    s.area?.toLowerCase().includes(salonSearch.toLowerCase()) ||
    s.location?.toLowerCase().includes(salonSearch.toLowerCase())
  );

  const filteredBookings = (allBookings || []).filter(b => {
    const matchesSearch =
      b.id?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.salon?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(bookingSearch.toLowerCase());
    
    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 min-h-[82vh]">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-gray-950 dark:text-white">
            Marketplace Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time analytics aggregating user signups, Gemini RAG query history, and booking revenues.
          </p>
        </div>
        {analyticsError && (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg">
            Demo Sandbox Mode (Backend DB Offline)
          </span>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'overview'
              ? 'text-primary'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Overview & AI Analytics
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('users-salons')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'users-salons'
              ? 'text-primary'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Users & Salons Control
          {activeTab === 'users-salons' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'bookings'
              ? 'text-primary'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          Booking Monitor
          {activeTab === 'bookings' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW & AI ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Summary Widgets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total Salons', val: activeData.summary.totalSalons || salons?.length || 0, bg: 'bg-purple-50 dark:bg-purple-955/20', textCol: 'text-purple-600 dark:text-purple-400' },
              { label: 'Total Users', val: activeData.summary.totalUsers || users?.length || 0, bg: 'bg-blue-50 dark:bg-blue-955/20', textCol: 'text-blue-600 dark:text-blue-400' },
              { label: 'Total Bookings', val: activeData.summary.totalBookings, bg: 'bg-pink-50 dark:bg-pink-955/20', textCol: 'text-primary dark:text-pink-300' },
              { label: 'Total Revenue', val: `₹${activeData.summary.totalRevenue || totalRevenue}`, bg: 'bg-amber-50 dark:bg-amber-955/20', textCol: 'text-amber-600 dark:text-amber-400' },
              { label: 'Pending', val: activeData.summary.pendingBookings || 0, bg: 'bg-yellow-50 dark:bg-yellow-955/20', textCol: 'text-yellow-600 dark:text-yellow-450' },
              { label: 'Completed', val: activeData.summary.completedBookings || 0, bg: 'bg-emerald-50 dark:bg-emerald-955/20', textCol: 'text-emerald-600 dark:text-emerald-455' },
              { label: 'Rejected/Can', val: activeData.summary.rejectedBookings || 0, bg: 'bg-rose-50 dark:bg-rose-955/20', textCol: 'text-rose-600 dark:text-rose-455' },
              { label: 'Upcoming', val: activeData.summary.upcomingBookings || 0, bg: 'bg-cyan-50 dark:bg-cyan-955/20', textCol: 'text-cyan-600 dark:text-cyan-400' },
            ].map((card, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-1.5 text-center">
                <span className="text-[9px] text-gray-400 uppercase tracking-wider font-extrabold block truncate">{card.label}</span>
                <span className={`text-base font-black mt-0.5 block ${card.textCol}`}>{card.val}</span>
              </div>
            ))}
          </div>

          {/* RAG and AI Search Performance graphs columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Most Asked Questions list */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 font-serif">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Top AI Skincare & Hair Queries</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Frequency tracker of topics queried in Gemini Chat.</p>
              </div>

              <div className="flex flex-col gap-4.5 font-semibold text-xs sm:text-sm">
                {activeData.aiAnalytics.mostAskedQuestions && activeData.aiAnalytics.mostAskedQuestions.length > 0 ? (
                  activeData.aiAnalytics.mostAskedQuestions.slice(0, 5).map((q, idx) => {
                    const maxCount = activeData.aiAnalytics.mostAskedQuestions[0].count || 1;
                    const percentage = Math.min((q.count / maxCount) * 100, 100);
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span className="truncate pr-3 font-medium">"{q.question}"</span>
                          <span className="text-primary font-bold">{q.count} consults</span>
                        </div>
                        <div className="w-full bg-gray-50 dark:bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-150">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-center text-xs text-gray-400 py-6">No search query stats logged yet.</span>
                )}
              </div>
            </div>

            {/* Most Recommended Salons */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 font-serif">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-50" />
                  <span>Top Gemini Recommended Salons</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Salons suggested most by our custom RAG engine.</p>
              </div>

              <div className="flex flex-col gap-4.5 font-semibold text-xs sm:text-sm">
                {activeData.aiAnalytics.mostRecommendedSalons && activeData.aiAnalytics.mostRecommendedSalons.length > 0 ? (
                  activeData.aiAnalytics.mostRecommendedSalons.slice(0, 5).map((s, idx) => {
                    const maxCount = activeData.aiAnalytics.mostRecommendedSalons[0].count || 1;
                    const percentage = Math.min((s.count / maxCount) * 100, 100);
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{s.salonName}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold">{s.count} times</span>
                        </div>
                        <div className="w-full bg-gray-50 dark:bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-150">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-center text-xs text-gray-400 py-6">No recommendation records saved yet.</span>
                )}
              </div>
            </div>

          </div>

          {/* Salon booking log performance list table */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 font-serif">
                <Landmark className="w-5.5 h-5.5 text-primary" />
                <span>Marketplace Spaces Performance</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Verified bookings counter and estimated counter revenue logs.</p>
            </div>

           <div className="overflow-x-auto text-xs sm:text-sm font-semibold">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-750 text-gray-400 dark:text-gray-500">
                    <th className="py-3 font-bold">Salon Name</th>
                    <th className="py-3 font-bold">Owner Name</th>
                    <th className="py-3 font-bold text-center">Total Bookings</th>
                    <th className="py-3 font-bold text-center">Upcoming</th>
                    <th className="py-3 font-bold text-center">Completed</th>
                    <th className="py-3 font-bold text-center">Rejected</th>
                    <th className="py-3 font-bold text-center">Visitors</th>
                    <th className="py-3 font-bold text-center">Rating</th>
                    <th className="py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-gray-800 dark:text-gray-300 font-medium">
                  {activeData.salonPerformance.map((salon) => (
                    <tr key={salon.salonId} className="hover:bg-pink-50/10 dark:hover:bg-gray-900/10">
                      <td className="py-3.5">
                        <button
                          onClick={() => setInspectedSalon(salon)}
                          className="hover:text-primary hover:underline font-extrabold text-left cursor-pointer text-xs sm:text-sm"
                        >
                          {salon.name}
                        </button>
                      </td>
                      <td className="py-3.5 text-xs text-gray-500">{salon.ownerName}</td>
                      <td className="py-3.5 text-center font-bold text-gray-900 dark:text-white">{salon.totalBookings}</td>
                      <td className="py-3.5 text-center text-gray-550">{salon.upcomingBookings}</td>
                      <td className="py-3.5 text-center text-emerald-600 dark:text-emerald-450">{salon.completedBookings}</td>
                      <td className="py-3.5 text-center text-rose-500">{salon.rejectedBookings}</td>
                      <td className="py-3.5 text-center text-gray-400">{salon.visitors}</td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center gap-1 font-bold justify-center">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{salon.rating}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteSalon(salon.salonId, salon.name)}
                          disabled={deleteSalonMutation.isPending}
                          className="p-1.5 bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                          title="Delete Salon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & SALONS CONTROL */}
      {activeTab === 'users-salons' && (
        <div className="flex flex-col gap-8">
          {/* Section 1: Users Administration */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 font-serif">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Marketplace Users Management</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Suspend, activate, or permanently remove customer and salon owner accounts.</p>
              </div>
              
              {/* User search box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {isUsersLoading ? (
              <div className="text-center py-8 text-gray-500 text-xs">Loading marketplace users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">No users found matching query.</div>
            ) : (
              <div className="overflow-x-auto text-xs sm:text-sm font-semibold">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-750 text-gray-400 dark:text-gray-500">
                      <th className="py-3 font-bold">User Name</th>
                      <th className="py-3 font-bold">Email Address</th>
                      <th className="py-3 font-bold">Account Role</th>
                      <th className="py-3 font-bold">Status Badge</th>
                      <th className="py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-gray-800 dark:text-gray-300 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/10">
                        <td className="py-3.5 text-gray-900 dark:text-white font-bold">{u.name}</td>
                        <td className="py-3.5 text-gray-500 font-normal">{u.email}</td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'OWNER'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5">
                          {u.suspended ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                              <Ban className="w-3 h-3" /> Suspended
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                              <CheckCircle className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserSuspension(u.id, !!u.suspended)}
                            disabled={u.role === 'ADMIN'}
                            className={`p-1.5 rounded-lg border text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              u.suspended
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                            }`}
                            title={u.suspended ? "Unsuspend User" : "Suspend User"}
                          >
                            {u.suspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.role === 'ADMIN'}
                            className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Salons Administration */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 font-serif">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Marketplace Salons Management</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Verify listings, approve setup parameters, or suspend offending salon branches.</p>
              </div>
              
              {/* Salon search box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search by salon name, area..."
                  value={salonSearch}
                  onChange={(e) => setSalonSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {isSalonsLoading ? (
              <div className="text-center py-8 text-gray-500 text-xs">Loading salon list...</div>
            ) : filteredSalons.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">No salons registered or matching keyword search.</div>
            ) : (
              <div className="overflow-x-auto text-xs sm:text-sm font-semibold">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-750 text-gray-400 dark:text-gray-500">
                      <th className="py-3 font-bold">Salon Studio</th>
                      <th className="py-3 font-bold">Area Location</th>
                      <th className="py-3 font-bold">Verification Tag</th>
                      <th className="py-3 font-bold">Market Status</th>
                      <th className="py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-gray-800 dark:text-gray-300 font-medium">
                    {filteredSalons.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/10">
                        <td className="py-3.5">
                          <div className="flex flex-col">
                            <span className="font-serif font-extrabold text-gray-900 dark:text-white">{s.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {s.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{s.area || s.location}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          {s.isVerified ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                              <ShieldCheck className="w-3 h-3" /> Verified Salon
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                              <AlertCircle className="w-3 h-3" /> Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
                            s.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.status === 'SUSPENDED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {s.status || 'APPROVED'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleSalonVerification(s.id, !!s.isVerified)}
                            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer flex items-center gap-1 ${
                              s.isVerified
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {s.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          
                          <button
                            onClick={() => handleToggleSalonSuspension(s.id, s.status)}
                            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer flex items-center gap-1 ${
                              s.status === 'SUSPENDED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            {s.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING MONITOR */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 font-serif">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Marketplace Booking Audit Monitor</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Audit scheduling details, modify states, and track appointments marketplace-wide.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Filter status dropdown */}
              <div className="relative">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary appearance-none pr-8 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Search input */}
              <div className="relative flex-1 sm:w-64 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Ref Code, Salon, Client..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {isBookingsLoading ? (
            <div className="text-center py-8 text-gray-500 text-xs">Loading master booking register...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">No matching bookings recorded.</div>
          ) : (
            <div className="overflow-x-auto text-xs sm:text-sm font-semibold">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-750 text-gray-400 dark:text-gray-500">
                    <th className="py-3 font-bold">Booking Ref</th>
                    <th className="py-3 font-bold">Client / Customer</th>
                    <th className="py-3 font-bold">Salon Studio</th>
                    <th className="py-3 font-bold">Schedule Time</th>
                    <th className="py-3 font-bold">Services & Price</th>
                    <th className="py-3 font-bold">State</th>
                    <th className="py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-gray-800 dark:text-gray-300 font-medium">
                  {filteredBookings.map((b) => {
                    let serviceArray: any[] = [];
                    if (typeof b.services === 'string') {
                      try { serviceArray = JSON.parse(b.services); } catch (e) { serviceArray = [b.services]; }
                    } else if (Array.isArray(b.services)) {
                      serviceArray = b.services;
                    }

                    return (
                      <tr key={b.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-900/10">
                        <td className="py-3.5 text-gray-900 dark:text-white font-mono font-bold">{b.id}</td>
                        <td className="py-3.5">
                          <div className="flex flex-col">
                            <span className="text-gray-900 dark:text-white font-bold">{b.user?.name || 'Walk-in Client'}</span>
                            <span className="text-[10px] text-gray-400 font-normal mt-0.5">{b.user?.email || `ID: ${b.userId || 'N/A'}`}</span>
                          </div>
                        </td>
                        <td className="py-3.5 font-serif font-extrabold text-gray-900 dark:text-white">{b.salon?.name || 'Registered Salon'}</td>
                        <td className="py-3.5">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-gray-900 dark:text-white font-bold">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{b.date}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{b.time}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-normal line-clamp-1 max-w-[180px]" title={serviceArray.map(s => s.name || s).join(', ')}>
                              {serviceArray.map(s => s.name || s).join(', ')}
                            </span>
                            <span className="text-primary font-black mt-0.5">₹{b.totalPrice}</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${
                            b.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.status === 'CANCELLED' || b.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : b.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {b.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1 text-[11px] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-max ml-auto block"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Bookings Inspector Modal */}
      <AnimatePresence>
        {inspectedSalon && (() => {
          const salonInspectBookings = (allBookings || []).filter(b => b.salonId === inspectedSalon.salonId || b.salonId === inspectedSalon.id);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setInspectedSalon(null)}
                className="fixed inset-0 bg-black"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl relative z-10 border border-gray-100 dark:border-gray-750 shadow-2xl p-6 sm:p-8 flex flex-col gap-5 text-xs font-semibold"
              >
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-750 pb-4">
                  <div>
                    <h3 className="font-serif font-extrabold text-lg text-gray-955 dark:text-white">
                      Bookings Inspector: {inspectedSalon.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Viewing all past & upcoming appointments for this establishment.
                    </p>
                  </div>
                  <button
                    onClick={() => setInspectedSalon(null)}
                    className="p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="max-h-[350px] overflow-y-auto pr-1 no-scrollbar flex flex-col gap-3">
                  {salonInspectBookings.length > 0 ? (
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-750 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                            <th className="py-2">Client Details</th>
                            <th className="py-2">Time Slot</th>
                            <th className="py-2">Services Booked</th>
                            <th className="py-2">Price</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-[11px] text-gray-700 dark:text-gray-305 font-medium">
                          {salonInspectBookings.map((b: any) => {
                            let serviceArray: any[] = [];
                            if (typeof b.services === 'string') {
                              try { serviceArray = JSON.parse(b.services); } catch (e) {}
                            } else if (Array.isArray(b.services)) {
                              serviceArray = b.services;
                            }

                            return (
                              <tr key={b.id} className="hover:bg-gray-50/20 dark:hover:bg-gray-900/10">
                                <td className="py-3">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-gray-900 dark:text-white">{b.user?.name || 'Walk-in Client'}</span>
                                    <span className="text-[10px] text-gray-400 font-normal">{b.user?.email || 'No Email'}</span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-gray-850 dark:text-gray-200">{b.date}</span>
                                    <span className="text-[10px] text-gray-400 font-semibold">{b.time}</span>
                                  </div>
                                </td>
                                <td className="py-3 max-w-[200px] truncate" title={serviceArray.map(s => s.name || s).join(', ')}>
                                  {serviceArray.map(s => s.name || s).join(', ')}
                                </td>
                                <td className="py-3 font-extrabold text-primary">₹{b.totalPrice}</td>
                                <td className="py-3">
                                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                    b.status === 'COMPLETED'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : b.status === 'CANCELLED' || b.status === 'REJECTED'
                                      ? 'bg-rose-50 text-rose-700'
                                      : b.status === 'PENDING'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-blue-50 text-blue-700'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">No booking logs found for this salon.</p>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
