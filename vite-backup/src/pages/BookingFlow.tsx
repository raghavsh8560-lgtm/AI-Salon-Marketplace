import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CheckCircle2, Ticket, FileText } from 'lucide-react';
import { salonsData, type Service } from '../data/salons';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const BookingFlow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addBooking, addToast } = useApp();

  // Find salon
  const salon = salonsData.find(s => s.id === id);

  // States
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(''); // e.g. "10:00 AM"
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Recover services passed from Salon Details
  useEffect(() => {
    if (location.state && (location.state as any).selectedServices) {
      setSelectedServices((location.state as any).selectedServices);
    } else if (salon) {
      // default: pre-select first service if nothing passed
      setSelectedServices([salon.services[0]]);
    }
  }, [location.state, salon]);

  if (!salon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        Salon data not found.
      </div>
    );
  }

  // Confetti effect when step 5 is triggered
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF4D6D', '#FFB3C1', '#FFF8FA', '#FF7096', '#FF85A1']
    });
  };

  const handleNextStep = () => {
    if (step === 1 && selectedServices.length === 0) {
      addToast('Please select at least one service', 'warning');
      return;
    }
    if (step === 2 && !selectedDate) {
      addToast('Please pick an appointment date', 'warning');
      return;
    }
    if (step === 3 && !selectedTime) {
      addToast('Please choose an operating timeslot', 'warning');
      return;
    }

    if (step === 4) {
      // Process and trigger checkout booking creation!
      const totalCost = selectedServices.reduce((sum, s) => sum + s.price, 0);
      const bId = addBooking({
        salonId: salon.id,
        salonName: salon.name,
        salonImage: salon.image,
        salonAddress: salon.address,
        services: selectedServices.map(s => ({ name: s.name, price: s.price })),
        date: selectedDate,
        time: selectedTime,
        totalPrice: Math.round(totalCost * 1.18) // Add GST/VAT
      });
      setConfirmedBookingId(bId);
      setStep(5);
      triggerConfetti();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      navigate(`/salon/${salon.id}`);
    }
  };

  // Generate slots
  const morningSlots = ['09:30 AM', '10:30 AM', '11:30 AM'];
  const afternoonSlots = ['12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'];
  const eveningSlots = ['04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'];

  // Custom Calendar Builder
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysCount = new Date(year, month + 1, 0).getDate();
    return { startDay, daysCount };
  };

  const { startDay, daysCount } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    // Don't go past current month
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

    // Block past dates
    const today = new Date();
    today.setHours(0,0,0,0);
    const dateSelected = new Date(year, currentMonth.getMonth(), day);
    
    if (dateSelected >= today) {
      setSelectedDate(formatted);
      addToast(`Selected Date: ${day} ${currentMonth.toLocaleString('default', { month: 'long' })}`, 'info');
    } else {
      addToast('Cannot book appointments for past dates!', 'error');
    }
  };

  // Calculate invoice
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const finalTotal = subtotal + gst;

  // Handle Receipt download simulation
  const handleDownloadReceipt = () => {
    const textContent = `
=========================================
          SALONAI APPOINTMENT RECEIPT
=========================================
Booking ID:     ${confirmedBookingId}
Status:         CONFIRMED (Payment at Salon)
Date & Time:    ${selectedDate} @ ${selectedTime}
-----------------------------------------
SALON DETAILS:
Name:           ${salon.name}
Address:        ${salon.address}
Phone:          ${salon.phone}
-----------------------------------------
SERVICES ORDERED:
${selectedServices.map(s => `${s.name.padEnd(40)} INR ${s.price}`).join('\n')}
-----------------------------------------
Subtotal:       INR ${subtotal}
GST (18%):      INR ${gst}
TOTAL AMOUNT:   INR ${finalTotal}
=========================================
Thank you for choosing SalonAI!
Show this receipt at the salon counter.
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

  const stepsLabels = ['Services', 'Date', 'Time', 'Confirm'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Back button and progress header */}
      {step < 5 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 dark:border-gray-800 pb-5">
          <button 
            onClick={handlePrevStep}
            className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-250 transition-colors focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-3 text-xs font-bold text-gray-400 dark:text-gray-550 w-full sm:w-auto">
            {stepsLabels.map((lbl, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-1.5">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] ${
                    step === idx + 1 
                      ? 'bg-primary text-white font-extrabold shadow-sm' 
                      : step > idx + 1 
                      ? 'bg-emerald-500 text-white font-extrabold'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={step === idx + 1 ? 'text-primary dark:text-pink-300' : ''}>{lbl}</span>
                </div>
                {idx < stepsLabels.length - 1 && <div className="h-0.5 w-4 bg-gray-200 dark:bg-gray-800" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main step pages rendering with animations */}
      <div className="bg-white dark:bg-gray-800 border border-gray-150/70 dark:border-gray-700/60 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">Confirm Selected Services</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add or remove services from your appointment roster before proceeding.</p>
            </div>
            
            <div className="flex flex-col gap-3.5">
              {salon.services.map((srv, idx) => {
                const isSelected = selectedServices.some(s => s.name === srv.name);
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedServices(prev => prev.filter(s => s.name !== srv.name));
                      } else {
                        setSelectedServices(prev => [...prev, srv]);
                      }
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-pink-50/50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/60 shadow-sm' 
                        : 'bg-white dark:bg-gray-850 border-gray-100 dark:border-gray-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white fill-primary" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200">{srv.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-450 mt-0.5">{srv.duration} mins</div>
                      </div>
                    </div>
                    <div className="font-extrabold text-gray-900 dark:text-white">₹{srv.price}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">Choose Appointment Date</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Select a convenient date from our active availability calendar.</p>
            </div>

            {/* Custom Calendar Card */}
            <div className="max-w-md mx-auto w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-150 dark:border-gray-800">
                <button 
                  onClick={prevMonth} 
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-850 rounded-lg text-gray-500 dark:text-gray-400 focus:outline-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-extrabold text-gray-850 dark:text-gray-150 text-sm uppercase tracking-wider">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={nextMonth} 
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-850 rounded-lg text-gray-500 dark:text-gray-400 focus:outline-none"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 dark:text-gray-550 mb-3 uppercase tracking-wide">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>

              {/* Grid Calendar */}
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold">
                {/* Empty cells for prefix days offset */}
                {Array.from({ length: startDay }).map((_, idx) => (
                  <span key={idx} />
                ))}
                {/* Days */}
                {Array.from({ length: daysCount }).map((_, idx) => {
                  const day = idx + 1;
                  const year = currentMonth.getFullYear();
                  const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(day).padStart(2, '0');
                  const targetFormatted = `${year}-${month}-${dayStr}`;

                  // Is Selected?
                  const isSelected = selectedDate === targetFormatted;

                  // Is today/future?
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const isPast = new Date(year, currentMonth.getMonth(), day) < today;

                  return (
                    <button
                      key={day}
                      onClick={() => selectDateHandler(day)}
                      disabled={isPast}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all focus:outline-none ${
                        isSelected 
                          ? 'bg-primary text-white font-extrabold shadow-md scale-105' 
                          : isPast 
                          ? 'text-gray-300 dark:text-gray-700 line-through cursor-not-allowed'
                          : 'text-gray-750 dark:text-gray-250 hover:bg-white dark:hover:bg-gray-850 hover:text-primary'
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

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                <span>Select Time Slot</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Appointments are scheduled in 1-hour sessions starting from 9:30 AM.</p>
            </div>

            <div className="flex flex-col gap-6">
              {[
                { label: 'Morning Sessions', list: morningSlots },
                { label: 'Afternoon Sessions', list: afternoonSlots },
                { label: 'Evening Sessions', list: eveningSlots }
              ].map((group, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{group.label}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {group.list.map(slot => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot);
                            addToast(`Selected Time: ${slot}`, 'info');
                          }}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition-all focus:outline-none ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-md scale-[1.02]' 
                              : 'bg-white dark:bg-gray-850 hover:bg-pink-50/20 hover:border-pink-300 border-gray-150 dark:border-gray-800/80 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">Confirm Booking & Invoice</h2>
              <p className="text-sm text-gray-500 dark:text-gray-450">Review summary logs. Payment will be collected at the salon counter.</p>
            </div>

            {/* Split panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
              
              {/* Salon & Summary details */}
              <div className="flex flex-col gap-5 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm">
                
                {/* Salon Cover */}
                <div className="flex gap-3.5 items-center">
                  <img src={salon.image} alt={salon.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <div className="font-extrabold text-gray-900 dark:text-white text-base">{salon.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-450 mt-0.5 leading-snug">{salon.address}</div>
                  </div>
                </div>

                <div className="h-px bg-gray-150 dark:bg-gray-800/60 my-1" />

                {/* Calendar summary */}
                <div className="flex flex-col gap-3 text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Date Selected:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Booking Slot:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedTime}</span>
                  </div>
                </div>

                <div className="h-px bg-gray-150 dark:bg-gray-800/60 my-1" />

                {/* Selected services lists */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-bold text-xs uppercase tracking-wide text-gray-450">Services Selected:</span>
                  <div className="flex flex-col gap-2">
                    {selectedServices.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700 dark:text-gray-350">{s.name}</span>
                        <span className="font-bold text-gray-850 dark:text-gray-150">₹{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Price summary invoice */}
              <div className="flex flex-col gap-4 p-5 border border-pink-100/60 dark:border-pink-900/40 rounded-2xl bg-pink-50/15 dark:bg-gray-950/20 justify-between">
                <div className="flex flex-col gap-3">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                    <Ticket className="w-4 h-4 text-primary" /> Invoice Breakdown
                  </h4>
                  
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">Subtotal</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">₹{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">GST / Taxes (18%)</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">₹{gst}</span>
                  </div>
                  
                  <div className="h-px bg-pink-100/60 dark:bg-gray-800/60 my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-base font-extrabold text-gray-900 dark:text-white">Payable Amount</span>
                    <span className="text-xl font-black text-primary">₹{finalTotal}</span>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-900/65 p-3 rounded-xl border border-pink-100/50 dark:border-gray-800/80 text-[11px] text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
                  No payment is processed now. You will pay directly at the salon counter after your service is completed.
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.35, type: 'spring' }} 
            className="flex flex-col items-center text-center gap-6 py-6"
          >
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-full text-emerald-500 border border-emerald-100/50">
              <CheckCircle2 className="w-16 h-16 fill-emerald-100 text-emerald-600 dark:fill-emerald-950 dark:text-emerald-400" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">Booking Confirmed!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                Your appointment at **{salon.name}** has been scheduled successfully.
              </p>
            </div>

            {/* Receipt Summary log box */}
            <div className="max-w-md w-full p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800/80 text-left text-sm flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 dark:text-gray-500 pb-2 border-b border-gray-150 dark:border-gray-800">
                <span>RECEIPT</span>
                <span>ID: {confirmedBookingId}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Salon:</span>
                <span className="font-bold text-gray-900 dark:text-white text-right">{salon.name}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Date & Time:</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedDate} @ {selectedTime}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Services:</span>
                <span className="font-bold text-gray-900 dark:text-white text-right truncate max-w-[200px]">
                  {selectedServices.map(s => s.name).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300 border-t border-gray-150 dark:border-gray-800 pt-2 font-extrabold text-base">
                <span>Total Amount:</span>
                <span className="text-primary">₹{finalTotal}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-750 px-5 py-3 rounded-xl font-bold text-sm text-gray-750 dark:text-gray-250 bg-white dark:bg-gray-850 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              >
                <FileText className="w-4.5 h-4.5 text-primary" />
                <span>Download Receipt</span>
              </button>
              <button
                onClick={() => navigate('/dashboard?tab=bookings')}
                className="bg-primary hover:bg-primary-hover text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 duration-200"
              >
                Go to My Bookings
              </button>
            </div>

          </motion.div>
        )}

        {/* Navigation CTAs for wizard steps */}
        {step < 5 && (
          <div className="flex justify-between items-center border-t border-gray-150 dark:border-gray-800 pt-5 mt-8">
            <button
              onClick={handlePrevStep}
              className="px-5 py-2.5 font-bold text-sm text-gray-650 dark:text-gray-350 hover:text-primary transition-colors focus:outline-none"
            >
              Back
            </button>
            <button
              onClick={handleNextStep}
              className="bg-primary hover:bg-primary-hover text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 duration-200 focus:outline-none"
            >
              {step === 4 ? 'Confirm & Book' : 'Continue'}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
