'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CheckCircle2, Ticket, FileText, User, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { apiFetch } from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Salon, type Service } from '../../components/SalonCard';

function BookingFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast, user } = useApp();

  const salonId = searchParams.get('salonId');

  // Redirect if salonId missing
  useEffect(() => {
    if (!salonId) {
      addToast('No salon selected for booking. Redirecting...', 'warning');
      router.push('/browse');
    }
  }, [salonId, router]);

  // Fetch salon details
  const { data: salon, isLoading } = useQuery<Salon>({
    queryKey: ['salon', salonId],
    queryFn: () => apiFetch(`/salons/${salonId}`),
    enabled: !!salonId,
  });

  // State
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(''); // e.g. "10:30 AM"
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(''); // empty means "Any Available"
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch slot occupancy & frozen status on date select
  const { data: slotStatus } = useQuery<{
    frozenSlots: { time: string; reason: string }[];
    occupancy: Record<string, number>;
  }>({
    queryKey: ['slotsOccupancy', salonId, selectedDate],
    queryFn: () => apiFetch(`/salons/${salonId}/slots-occupancy?date=${selectedDate}`),
    enabled: !!salonId && !!selectedDate,
  });

  // Recover services from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('salonai_selected_services');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSelectedServices(parsed);
        } catch (e) {
          console.warn('Failed to parse selected services', e);
        }
      }
    }
  }, [salon]);

  // Set default first service if selection is empty
  useEffect(() => {
    if (salon && selectedServices.length === 0) {
      setSelectedServices([salon.services[0]]);
    }
  }, [salon, selectedServices]);

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: (bookingData: any) => {
      return apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    },
    onSuccess: (data) => {
      setConfirmedBookingId(data.id);
      setStep(5);
      triggerConfetti();
      addToast('Appointment scheduled successfully!', 'success');
      // Clean up preloaded services
      if (typeof window !== 'undefined') {
        localStorage.removeItem('salonai_selected_services');
      }
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slotsOccupancy'] });
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to confirm booking. Try again.', 'error');
    }
  });

  if (isLoading || !salon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-550 font-semibold text-sm">Initializing appointment checkout...</p>
      </div>
    );
  }

  // Trigger Confetti Celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#FF5E7E', '#FFD3DC', '#FFFDFE', '#E5BA73', '#FF85A1']
    });
  };

  const handleNextStep = () => {
    if (!user) {
      addToast('Please login or register to book an appointment.', 'warning');
      router.push(`/auth?redirect=/booking?salonId=${salon.id}`);
      return;
    }

    if (step === 1 && selectedServices.length === 0) {
      addToast('Please select at least one service to continue.', 'warning');
      return;
    }
    if (step === 2 && !selectedDate) {
      addToast('Please select a booking date from the calendar.', 'warning');
      return;
    }
    if (step === 3 && !selectedTime) {
      addToast('Please choose an operating hour slot.', 'warning');
      return;
    }

    if (step === 4) {
      // Create final payload and call API
      const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
      const gst = Math.round(subtotal * 0.18);
      const finalTotal = subtotal + gst;

      bookingMutation.mutate({
        salonId: salon.id,
        date: selectedDate,
        time: selectedTime,
        services: selectedServices.map(s => ({ name: s.name, price: s.price, category: s.category })),
        totalPrice: finalTotal,
        professionalId: selectedProfessionalId || null,
      });
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      router.push(`/salon/${salon.id}`);
    }
  };

  // Operating timeslots
  const morningSlots = ['09:30 AM', '10:30 AM', '11:30 AM'];
  const afternoonSlots = ['12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'];
  const eveningSlots = ['04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'];

  // Calendar builder
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    return { startDay, daysCount };
  };

  const { startDay, daysCount } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    if (d >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
      setCurrentMonth(d);
    }
  };

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  const selectDateHandler = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formatted = `${year}-${month}-${dayStr}`;

    const today = new Date();
    today.setHours(0,0,0,0);
    const dateSelected = new Date(year, currentMonth.getMonth(), day);
    
    if (dateSelected >= today) {
      setSelectedDate(formatted);
      setSelectedTime(''); // Reset time selection on date change
      addToast(`Selected appointment date: ${day} ${currentMonth.toLocaleString('default', { month: 'long' })}`, 'info');
    } else {
      addToast('Cannot book appointments for past dates!', 'error');
    }
  };

  // Calculations
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const finalTotal = subtotal + gst;

  // Receipt Download Text File
  const handleDownloadReceipt = () => {
    const professionalName = selectedProfessionalId 
      ? salon?.professionals?.find(p => p.id === selectedProfessionalId)?.name || 'Chosen Specialist'
      : 'Any Available Specialist';

    const textContent = `
=========================================
          SALONAI APPOINTMENT RECEIPT
=========================================
Booking ID:     ${confirmedBookingId}
Status:         CONFIRMED (Payment at Salon Counter)
Date & Time:    ${selectedDate} @ ${selectedTime}
Stylist/Expert: ${professionalName}
-----------------------------------------
SALON DETAILS:
Name:           ${salon.name}
Address:        ${salon.address}
Phone:          ${salon.phone}
-----------------------------------------
SERVICES ORDERED:
${selectedServices.map(s => `${s.name.padEnd(35)} INR ${s.price}`).join('\n')}
-----------------------------------------
Subtotal:       INR ${subtotal}
GST (18%):      INR ${gst}
TOTAL AMOUNT:   INR ${finalTotal}
=========================================
Thank you for choosing SalonAI!
Please show this receipt at the counter.
=========================================
`;
    const element = document.createElement("a");
    const file = new Blob([textContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `receipt_${confirmedBookingId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Receipt downloaded successfully!', 'success');
  };

  const stepsLabels = ['Services', 'Date', 'Time & Team', 'Review', 'Confirmed'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Wizard Progress Headers */}
      {step < 5 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pink-100/50 dark:border-gray-800 pb-5">
          <button 
            onClick={handlePrevStep}
            className="flex items-center gap-1 text-xs sm:text-sm font-extrabold text-gray-500 hover:text-primary transition-colors focus:outline-none cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-400 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {stepsLabels.slice(0, 4).map((lbl, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${
                    step === idx + 1 
                      ? 'bg-primary text-white font-extrabold shadow-sm' 
                      : step > idx + 1 
                      ? 'bg-emerald-500 text-white font-extrabold'
                      : 'bg-gray-100 dark:bg-gray-850 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={step === idx + 1 ? 'text-primary dark:text-pink-300 font-extrabold' : 'font-medium'}>{lbl}</span>
                </div>
                {idx < 3 && <div className="h-0.5 w-4 bg-gray-200 dark:bg-gray-800" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main Wizard Card */}
      <div className="bg-white dark:bg-gray-800 border border-pink-100/40 dark:border-gray-700/60 rounded-3xl p-4 sm:p-8 shadow-sm">
        
        {/* Step 1: Services Confirm Checklist */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-955 dark:text-white">Confirm Selected Services</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Review, add, or remove services from your appointment roster before scheduling slots.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {salon.services.map((srv) => {
                const isSelected = selectedServices.some(s => s.id === srv.id);
                return (
                  <div 
                    key={srv.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedServices(prev => prev.filter(s => s.id !== srv.id));
                      } else {
                        setSelectedServices(prev => [...prev, srv]);
                      }
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-pink-50/40 dark:bg-pink-955/20 border-pink-200 dark:border-pink-900/50' 
                        : 'bg-white dark:bg-gray-850 border-gray-100 dark:border-gray-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-650'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4.5 h-4.5 text-white fill-primary" />}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">{srv.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-450 mt-0.5">{srv.duration} mins</div>
                      </div>
                    </div>
                    <div className="font-black text-gray-955 dark:text-white text-xs sm:text-sm">₹{srv.price}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Date Selector Calendar */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-955 dark:text-white">Choose Appointment Date</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Select a convenient day from our current availability calendar.</p>
            </div>

            {/* Custom Interactive Calendar */}
            <div className="max-w-md mx-auto w-full bg-gray-50 dark:bg-gray-905 border border-gray-150 dark:border-gray-800 rounded-3xl p-3 sm:p-5 shadow-sm">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-150 dark:border-gray-800">
                <button 
                  onClick={prevMonth} 
                  className="p-2 hover:bg-white dark:hover:bg-gray-850 rounded-xl text-gray-555 dark:text-gray-405 focus:outline-none cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-extrabold text-gray-850 dark:text-gray-200 text-xs sm:text-sm uppercase tracking-wider">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={nextMonth} 
                  className="p-2 hover:bg-white dark:hover:bg-gray-850 rounded-xl text-gray-555 dark:text-gray-405 focus:outline-none cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-gray-400 mb-3 uppercase tracking-wider">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>

              {/* Grid Days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm font-semibold">
                {Array.from({ length: startDay }).map((_, idx) => (
                  <span key={idx} />
                ))}
                {Array.from({ length: daysCount }).map((_, idx) => {
                  const day = idx + 1;
                  const year = currentMonth.getFullYear();
                  const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(day).padStart(2, '0');
                  const targetFormatted = `${year}-${month}-${dayStr}`;

                  const isSelected = selectedDate === targetFormatted;
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const isPast = new Date(year, currentMonth.getMonth(), day) < today;

                  return (
                    <button
                      key={day}
                      onClick={() => selectDateHandler(day)}
                      disabled={isPast}
                      className={`h-7 w-7 sm:h-9 sm:w-9 text-[10px] sm:text-xs rounded-lg sm:rounded-xl flex items-center justify-center transition-all focus:outline-none cursor-pointer ${
                        isSelected 
                          ? 'bg-primary text-white font-extrabold shadow-md scale-105' 
                          : isPast 
                          ? 'text-gray-300 dark:text-gray-700 line-through cursor-not-allowed'
                          : 'text-gray-750 dark:text-gray-250 hover:bg-white dark:hover:bg-gray-800 hover:text-primary'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Time Slot & Professional Selection */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">Select Time & Staff</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Choose operating hour slots and assign your favorite beauty specialist.</p>
            </div>

            {/* Time Slots Selection */}
            <div className="flex flex-col gap-5">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-gray-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Operating Timeslot</span>
              </h3>
              
              {[
                { label: 'Morning Sessions', list: morningSlots },
                { label: 'Afternoon Sessions', list: afternoonSlots },
                { label: 'Evening Sessions', list: eveningSlots }
              ].map((group, idx) => (
                <div key={idx} className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{group.label}</span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {group.list.map(slot => {
                      const isSelected = selectedTime === slot;
                      const frozenDetails = slotStatus?.frozenSlots?.find(f => f.time === slot);
                      const currentOccupancy = slotStatus?.occupancy?.[slot] || 0;
                      const isFull = currentOccupancy >= 2;
                      const isSlotDisabled = !!frozenDetails || isFull;

                      return (
                        <button
                          key={slot}
                          disabled={isSlotDisabled}
                          onClick={() => {
                            setSelectedTime(slot);
                          }}
                          className={`py-3 rounded-xl border text-xs font-bold transition-all focus:outline-none flex flex-col items-center justify-center gap-1 min-h-[60px] ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-sm scale-102' 
                              : isSlotDisabled
                              ? 'bg-gray-105 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60'
                              : 'bg-white dark:bg-gray-850 hover:bg-pink-50/20 hover:border-pink-300 border-gray-150 dark:border-gray-750 text-gray-800 dark:text-gray-200 cursor-pointer'
                          }`}
                        >
                          <span>{slot}</span>
                          {frozenDetails && (
                            <span className="text-[9px] text-red-500 font-extrabold block text-center max-w-[90px] truncate leading-none">
                              Frozen: {frozenDetails.reason}
                            </span>
                          )}
                          {!frozenDetails && isFull && (
                            <span className="text-[9px] text-amber-500 font-extrabold block text-center leading-none">
                              Slot Full
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Stylists Selection Grid */}
            <div className="flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-gray-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                <span>Assign a Specialist</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {/* Default: Any specialist */}
                <div 
                  onClick={() => setSelectedProfessionalId('')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedProfessionalId === '' 
                      ? 'bg-pink-50/30 dark:bg-pink-955/20 border-pink-300' 
                      : 'bg-white dark:bg-gray-850 border-gray-100 dark:border-gray-750 hover:bg-gray-50'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-950/40 text-primary flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">Any Available Specialist</div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Let SalonAI choose standard expert for you</div>
                  </div>
                </div>

                {/* Specific Professionals */}
                {salon.professionals && salon.professionals.map(prof => (
                  <div 
                    key={prof.id}
                    onClick={() => setSelectedProfessionalId(prof.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedProfessionalId === prof.id
                        ? 'bg-pink-50/30 dark:bg-pink-955/20 border-pink-300' 
                        : 'bg-white dark:bg-gray-850 border-gray-100 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={prof.profileImage}
                      alt={prof.name}
                      className="h-10 w-10 rounded-full object-cover border border-pink-50"
                    />
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">{prof.name}</div>
                      <div className="text-[10px] text-primary font-bold mt-0.5">{prof.specialization} &bull; {prof.yearsExperience} yrs exp</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* Step 4: Confirm Booking & Invoice Breakdown */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">Confirm Booking & Invoice</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-450">Review summary details before schedule creation. Payments are cash/UPI at salon counters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
              
              {/* Left Panel: Summary Details */}
              <div className="flex flex-col gap-5 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-150 dark:border-gray-800 text-xs sm:text-sm">
                
                {/* Salon Image + Name */}
                <div className="flex gap-3.5 items-center">
                  <img src={salon.coverImage} alt={salon.name} className="w-14 h-14 rounded-2xl object-cover" />
                  <div>
                    <div className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base">{salon.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">{salon.address}</div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

                {/* Logistics */}
                <div className="flex flex-col gap-3 text-gray-700 dark:text-gray-300 font-semibold text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>Selected Date:</span>
                    <span className="font-extrabold text-gray-950 dark:text-white ml-auto">{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Booking Timeslot:</span>
                    <span className="font-extrabold text-gray-950 dark:text-white ml-auto">{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>Assigned Specialist:</span>
                    <span className="font-extrabold text-gray-950 dark:text-white ml-auto">
                      {selectedProfessionalId 
                        ? salon?.professionals?.find(p => p.id === selectedProfessionalId)?.name 
                        : 'Any Available Specialist'
                      }
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

                {/* Selected services checklist */}
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-gray-450">Services Checked:</span>
                  <div className="flex flex-col gap-2">
                    {selectedServices.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-655 dark:text-gray-400 font-medium">{s.name}</span>
                        <span className="font-bold text-gray-900 dark:text-white">₹{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Panel: Invoice breakdown */}
              <div className="flex flex-col gap-4 p-5 border border-pink-100 dark:border-pink-900/40 rounded-3xl bg-pink-50/10 dark:bg-gray-950/20 justify-between">
                <div className="flex flex-col gap-3">
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-primary" /> 
                    <span>Invoice Breakdown</span>
                  </h4>
                  
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold">Subtotal Cost</span>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200">₹{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold">Taxes & GST (18%)</span>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200">₹{gst}</span>
                  </div>
                  
                  <div className="h-px bg-pink-150/40 dark:bg-gray-800 my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white font-serif">Total Payable</span>
                    <span className="text-lg font-black text-primary">₹{finalTotal}</span>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-900/50 p-3 rounded-2xl border border-pink-50 dark:border-gray-850 text-[10px] text-gray-500 dark:text-gray-450 leading-relaxed font-semibold mt-4">
                  Payment is NOT collected online. Rest easy and settle counter bills after your beauty makeover is fully completed.
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Step 5: Success booking overlay */}
        {step === 5 && (
          <motion.div 
            initial={{ scale: 0.96, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="flex flex-col items-center text-center gap-6 py-6"
          >
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-full text-emerald-500 border border-emerald-100">
              <CheckCircle2 className="w-14 h-14 fill-emerald-100 text-emerald-600 dark:fill-emerald-950 dark:text-emerald-400" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white leading-tight">Booking Confirmed!</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                Your appointment slot at **{salon.name}** is confirmed and logged in your profile.
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="max-w-md w-full p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 text-left text-xs sm:text-sm flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-800">
                <span>RECEIPT LOGS</span>
                <span>ID: {confirmedBookingId}</span>
              </div>
              <div className="flex justify-between text-gray-655 dark:text-gray-350 font-semibold">
                <span>Salon Destination:</span>
                <span className="font-extrabold text-gray-900 dark:text-white text-right">{salon.name}</span>
              </div>
              <div className="flex justify-between text-gray-655 dark:text-gray-355 font-semibold">
                <span>Date & Time:</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{selectedDate} at {selectedTime}</span>
              </div>
              <div className="flex justify-between text-gray-655 dark:text-gray-350 font-semibold">
                <span>Stylist:</span>
                <span className="font-extrabold text-gray-900 dark:text-white">
                  {selectedProfessionalId 
                    ? salon?.professionals?.find(p => p.id === selectedProfessionalId)?.name 
                    : 'Any Available Specialist'
                  }
                </span>
              </div>
              <div className="flex justify-between text-gray-655 dark:text-gray-350 font-semibold">
                <span>Services Selected:</span>
                <span className="font-extrabold text-gray-900 dark:text-white text-right truncate max-w-[200px]">
                  {selectedServices.map(s => s.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300 border-t border-gray-150 dark:border-gray-800 pt-2 font-extrabold text-base">
                <span>Payable Amount:</span>
                <span className="text-primary text-lg">₹{finalTotal}</span>
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center gap-1.5 border border-pink-100 hover:border-pink-300 dark:border-gray-700 px-5 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm text-gray-750 dark:text-gray-250 bg-white dark:bg-gray-850 transition-all cursor-pointer"
              >
                <FileText className="w-4.5 h-4.5 text-primary" />
                <span>Download Plain Receipt</span>
              </button>
              <button
                onClick={() => router.push('/dashboard?tab=bookings')}
                className="bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
              >
                Go to Profile Bookings
              </button>
            </div>

          </motion.div>
        )}

        {/* Wizard Controls */}
        {step < 5 && (
          <div className="flex justify-between items-center border-t border-gray-150 dark:border-gray-850 pt-5 mt-8">
            <button
              onClick={handlePrevStep}
              className="px-5 py-2.5 font-bold text-xs sm:text-sm text-gray-500 hover:text-primary transition-colors focus:outline-none cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={bookingMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-all active:scale-95 duration-200 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {bookingMutation.isPending 
                ? 'Processing...' 
                : step === 4 
                ? 'Confirm & Settle Counter' 
                : 'Continue'
              }
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function BookingFlow() {
  return (
    <React.Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-500 font-semibold text-sm">Loading booking system...</p>
      </div>
    }>
      <BookingFlowContent />
    </React.Suspense>
  );
}
