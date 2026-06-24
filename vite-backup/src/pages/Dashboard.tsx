import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Heart, User, LogOut, AlertTriangle, CalendarRange, CheckCircle } from 'lucide-react';
import { useApp, type Booking } from '../context/AppContext';
import { salonsData } from '../data/salons';
import { SalonCard } from '../components/SalonCard';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout, bookings, cancelBooking, rescheduleBooking, wishlist, addToast } = useApp();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'profile'>('bookings');
  
  // Modals state
  const [targetReschedule, setTargetReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  
  const [targetCancelId, setTargetCancelId] = useState<string | null>(null);

  // Profile fields state
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');

  // Sync tab with search parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'saved') setActiveTab('saved');
    else if (tab === 'profile') setActiveTab('profile');
    else setActiveTab('bookings');
  }, [searchParams]);

  // Sync profile values when user state resolves
  useEffect(() => {
    if (user) {
      setProfName(user.name);
      setProfEmail(user.email);
      setProfPhone(user.phone);
    } else {
      // Redirect to login if user not authenticated
      addToast('Please login to access the dashboard', 'warning');
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  // Filter lists
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'past' || b.status === 'cancelled');

  // Filter wishlisted salons
  const savedSalons = salonsData.filter(s => wishlist.includes(s.id));

  // Change tab handler
  const handleTabChange = (tab: 'bookings' | 'saved' | 'profile') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Perform Reschedule submission
  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReschedule) return;
    if (!rescheduleDate || !rescheduleTime) {
      addToast('Please pick a date and time slot', 'warning');
      return;
    }

    // Verify date is not in past
    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(rescheduleDate) < today) {
      addToast('Rescheduled date cannot be in the past!', 'error');
      return;
    }

    rescheduleBooking(targetReschedule.bookingId, rescheduleDate, rescheduleTime);
    setTargetReschedule(null);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  // Perform Cancellation
  const handleConfirmCancel = () => {
    if (!targetCancelId) return;
    cancelBooking(targetCancelId);
    setTargetCancelId(null);
  };

  // Save profile updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profEmail.trim() || !profPhone.trim()) {
      addToast('Please enter all profile fields', 'warning');
      return;
    }
    // Update state simulation
    addToast('Profile updated successfully!', 'success');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      
      {/* Dashboard Welcome Header */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm border border-pink-100"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white mb-0.5">
              Hello, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage appointments, review receipts, and update your favorites.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 dark:text-rose-400 dark:border-rose-900/60 dark:hover:bg-rose-950/20 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors focus:outline-none flex-shrink-0 active:scale-95"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Split layout: Sidebar nav & main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 flex flex-row lg:flex-col bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-2xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar w-full">
          {[
            { id: 'bookings', label: 'My Appointments', icon: Calendar },
            { id: 'saved', label: 'Saved Salons', icon: Heart },
            { id: 'profile', label: 'My Profile', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm transition-colors focus:outline-none flex-shrink-0 w-auto lg:w-full text-left ${
                  isSelected 
                    ? 'bg-pink-50 dark:bg-pink-950/30 text-primary' 
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
        <main className="lg:col-span-9 flex flex-col gap-6 w-full">
          
          {/* APPOINTMENTS TAB */}
          {activeTab === 'bookings' && (
            <div className="flex flex-col gap-8">
              
              {/* Upcoming section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  Upcoming Appointments ({upcomingBookings.length})
                </h2>
                
                {upcomingBookings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {upcomingBookings.map((b) => (
                      <div 
                        key={b.id}
                        className="bg-white dark:bg-gray-800 border border-gray-150/70 dark:border-gray-700/60 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between gap-5"
                      >
                        <div className="flex gap-4">
                          <img src={b.salonImage} alt={b.salonName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                          <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
                            <h3 className="font-extrabold text-gray-950 dark:text-white text-base sm:text-lg leading-snug">
                              {b.salonName}
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-semibold">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{b.date}</span>
                              <span className="text-gray-300 dark:text-gray-700">&bull;</span>
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{b.time}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-gray-400 dark:text-gray-450 leading-tight">
                              <MapPin className="w-4 h-4 text-gray-350 flex-shrink-0 mt-0.5" />
                              <span className="truncate max-w-[250px]">{b.salonAddress}</span>
                            </div>
                            
                            {/* Service names */}
                            <div className="text-[11px] font-bold text-gray-500 bg-gray-50 dark:bg-gray-900/60 px-2 py-1 rounded w-max mt-1">
                              Services: {b.services.map(s => s.name).join(', ')}
                            </div>
                          </div>
                        </div>

                        {/* Invoice & Actions Column */}
                        <div className="flex sm:flex-col justify-between items-end gap-3 sm:border-l sm:border-gray-100 sm:dark:border-gray-700/50 sm:pl-5 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Payable Total</div>
                            <div className="font-extrabold text-lg text-primary">₹{b.totalPrice}</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setTargetReschedule(b);
                                setRescheduleDate(b.date);
                                setRescheduleTime(b.time);
                              }}
                              className="border border-gray-200 dark:border-gray-750 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors focus:outline-none"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => setTargetCancelId(b.bookingId)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors focus:outline-none"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm text-center flex flex-col items-center gap-3">
                    <CalendarRange className="w-10 h-10 text-gray-400" />
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white">No Upcoming Appointments</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-normal">
                      Need a makeover? Browse our Jaipur database and schedule an appointment instantly.
                    </p>
                    <button
                      onClick={() => navigate('/browse')}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl mt-2 transition-colors focus:outline-none"
                    >
                      Book Salon Now
                    </button>
                  </div>
                )}
              </div>

              {/* Past history logs section */}
              <div className="flex flex-col gap-4 border-t border-gray-150 dark:border-gray-800/80 pt-6">
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  Past History & Logs ({pastBookings.length})
                </h2>
                
                {pastBookings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3.5 opacity-80">
                    {pastBookings.map((b) => (
                      <div 
                        key={b.id}
                        className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold"
                      >
                        <div className="flex items-center gap-3.5">
                          <img src={b.salonImage} alt={b.salonName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          <div>
                            <h4 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base leading-tight">
                              {b.salonName}
                            </h4>
                            <div className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                              <span>Date: {b.date}</span>
                              <span>&bull;</span>
                              <span>Total: ₹{b.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          {b.status === 'past' ? (
                            <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : (
                            <span className="bg-gray-100 dark:bg-gray-900 text-gray-550 dark:text-gray-400 font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-800/80 flex items-center gap-1">
                              Cancelled
                            </span>
                          )}
                          <Link 
                            to={`/salon/${b.salonId}`}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-250 hover:text-primary px-3 py-1 rounded-md text-[11px]"
                          >
                            Rebook
                          </Link>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-400 py-4 font-semibold">
                    No past transactions logged.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'saved' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                Saved Salons ({savedSalons.length})
              </h2>

              {savedSalons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedSalons.map((salon) => (
                    <SalonCard key={salon.id} salon={salon} />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm text-center flex flex-col items-center gap-3">
                  <Heart className="w-10 h-10 text-gray-300 fill-gray-100" />
                  <h4 className="font-extrabold text-base text-gray-900 dark:text-white">Your Wishlist is Empty</h4>
                  <p className="text-xs text-gray-550 dark:text-gray-400 max-w-xs leading-normal">
                    Save salons you love so you can quickly browse their services and book them in the future.
                  </p>
                  <button
                    onClick={() => navigate('/browse')}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl mt-2 transition-colors focus:outline-none"
                  >
                    Browse Jaipur Salons
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">Profile Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keep your personal coordinate information and mobile contacts updated.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-450 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-450 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profEmail}
                    onChange={(e) => setProfEmail(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-455 dark:text-gray-400 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 duration-200 focus:outline-none"
                  >
                    Save Modifications
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
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setTargetReschedule(null)}
              className="fixed inset-0 bg-black z-45"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/4 max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-3xl z-50 p-6 sm:p-8 flex flex-col gap-5 border border-gray-100 dark:border-gray-700 shadow-2xl"
            >
              <div className="text-center">
                <h3 className="font-extrabold text-lg text-gray-950 dark:text-white flex items-center gap-1.5 justify-center">
                  <CalendarRange className="w-5 h-5 text-primary" /> Reschedule Appointment
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Adjust date and timeslot parameters for **{targetReschedule.salonName}**.
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
                    className="px-4 py-2 font-bold text-xs text-gray-500 hover:text-gray-750"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm"
                  >
                    Update Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancellation Warning Dialog */}
      <AnimatePresence>
        {targetCancelId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setTargetCancelId(null)}
              className="fixed inset-0 bg-black z-45"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-3xl z-50 p-6 sm:p-8 flex flex-col gap-5 border border-gray-100 dark:border-gray-750 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-500 p-3 rounded-full border border-rose-100 dark:border-rose-900/30">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-950 dark:text-white">Cancel Appointment?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px]">
                  Are you sure you want to cancel this booking? This action is immediate and free of charge, but cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setTargetCancelId(null)}
                  className="flex-1 border border-gray-200 dark:border-gray-700 py-2.5 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-850 hover:bg-gray-50/50"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
