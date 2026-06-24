import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Heart, ChevronRight, MessageSquare, Check } from 'lucide-react';
import { salonsData, type Salon, type Service } from '../data/salons';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export const SalonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist, addToast, user } = useApp();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Selected services for checkout
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  // Add review form state
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<Salon['reviews']>([]);

  useEffect(() => {
    const matched = salonsData.find(s => s.id === id);
    if (matched) {
      setSalon(matched);
      setActiveImage(matched.image);
      setReviewsList(matched.reviews);
    } else {
      // Fallback if id invalid
      navigate('/browse');
    }
  }, [id, navigate]);

  if (!salon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading salon details...
      </div>
    );
  }

  const isWishlisted = isInWishlist(salon.id);

  // Toggle service selection
  const handleToggleService = (srv: Service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.name === srv.name);
      if (exists) {
        return prev.filter(s => s.name !== srv.name);
      } else {
        return [...prev, srv];
      }
    });
  };

  const handleBookNow = () => {
    if (selectedServices.length === 0) {
      addToast('Please select at least one service to book', 'warning');
      return;
    }
    // Navigate to booking flow passing data in state
    navigate(`/booking-flow/${salon.id}`, { 
      state: { selectedServices } 
    });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      addToast('Please write some feedback comment', 'warning');
      return;
    }

    const reviewObj = {
      id: 'r-' + Math.random().toString(36).substring(2, 9),
      name: user ? user.name : 'Anonymous User',
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString().split('T')[0]
    };

    setReviewsList(prev => [reviewObj, ...prev]);
    addToast('Review submitted successfully! Thank you.', 'success');
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 pb-32">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-505 dark:text-gray-455">
        <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/')}>Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/browse')}>Browse</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 dark:text-white truncate">{salon.name}</span>
      </div>

      {/* Main Grid: Gallery & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Gallery Panel (Lines 1 to 5) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-80 sm:h-96 md:h-[450px] rounded-3xl overflow-hidden border border-gray-150/70 dark:border-gray-800 shadow-sm bg-gray-50"
          >
            <img 
              src={activeImage} 
              alt={salon.name} 
              className="w-full h-full object-cover transition-all duration-300"
            />
          </motion.div>
          
          {/* Thumbnails */}
          {salon.gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {salon.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 sm:w-24 h-16 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === img ? 'border-primary scale-95 shadow-sm' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm relative">
          
          {/* Favorites Heart */}
          <button
            onClick={() => toggleWishlist(salon.id)}
            className="absolute top-6 right-6 p-3 bg-pink-50 dark:bg-gray-900 hover:bg-pink-100 text-gray-500 hover:text-red-500 rounded-full transition-colors focus:outline-none"
          >
            <Heart className={`w-5.5 h-5.5 transition-transform duration-200 ${isWishlisted ? 'text-red-500 fill-red-500 scale-110' : ''}`} />
          </button>

          <div className="flex flex-col gap-2.5">
            <span className="bg-pink-100 dark:bg-pink-950/40 text-primary dark:text-pink-300 text-xs font-extrabold px-3 py-1 rounded-lg border border-pink-200/50 w-max uppercase tracking-wider">
              {salon.area}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white leading-tight pr-10">
              {salon.name}
            </h1>
            
            {/* Rating Details */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <span>{salon.rating}</span>
                <Star className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-gray-550 dark:text-gray-400 font-medium">
                ({salon.reviewsCount} verified reviews)
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700/60 pt-4">
            {salon.description}
          </p>

          {/* Quick contact / logistics specs */}
          <div className="flex flex-col gap-3.5 border-t border-gray-100 dark:border-gray-700/60 pt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{salon.address}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{salon.timing}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{salon.phone}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Services Table and Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Services Checklist Table (7 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">
              Services & Menu
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Select one or more services below to build your custom package.
            </p>
          </div>

          {/* Services list with categories headers */}
          <div className="flex flex-col gap-6 mt-2">
            {Array.from(new Set(salon.services.map(s => s.category))).map((category) => (
              <div key={category} className="flex flex-col gap-3">
                <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider border-b border-pink-100 dark:border-gray-700/60 pb-1.5 mt-2">
                  {category}
                </h3>
                <div className="flex flex-col gap-3">
                  {salon.services
                    .filter(s => s.category === category)
                    .map((srv, idx) => {
                      const isSelected = selectedServices.some(s => s.name === srv.name);
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleToggleService(srv)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-pink-50/50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/60 shadow-sm scale-[1.01]' 
                              : 'bg-white dark:bg-gray-850 hover:bg-gray-50/60 dark:hover:bg-gray-900/40 border-gray-100 dark:border-gray-800/80'
                          }`}
                        >
                          <div className="flex-1 flex gap-3 items-center pr-4">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                                {srv.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-450 mt-0.5">
                                Duration: {srv.duration} mins
                              </div>
                            </div>
                          </div>
                          <div className="font-extrabold text-gray-950 dark:text-white text-sm sm:text-base">
                            ₹{srv.price}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Map and Info Block (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Map placeholder */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Location Map</h3>
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/65 relative bg-pink-50/20 flex flex-col items-center justify-center p-4 text-center">
              {/* Fake aesthetic grid map background */}
              <div className="absolute inset-0 bg-cover opacity-60 dark:opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop&q=80)' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-500/10 dark:from-pink-900/10 dark:to-pink-900/20" />
              <div className="relative bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-md flex items-center justify-center flex-col gap-1 border border-pink-100/50">
                <MapPin className="w-6 h-6 text-primary animate-bounce" />
                <span className="text-[10px] font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider">{salon.name}</span>
              </div>
            </div>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary font-bold text-center hover:underline focus:outline-none"
            >
              Get Directions on Google Maps
            </a>
          </div>

          {/* Quick FAQ / Policies */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm flex flex-col gap-3">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Booking Policy</h3>
            <ul className="text-xs text-gray-550 dark:text-gray-400 space-y-2 list-disc list-inside">
              <li>Free cancellation up to 2 hours before the slot.</li>
              <li>Please arrive 10 minutes prior to your booking time.</li>
              <li>Payment will be collected at the salon counter.</li>
              <li>Sanitation & safety procedures are fully certified.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Review Section */}
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm flex flex-col gap-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span>Customer Reviews</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-450 mt-0.5">
            See what others say about their experience at {salon.name}.
          </p>
        </div>

        {/* Leave a review form */}
        <form onSubmit={handleAddReview} className="flex flex-col gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-200">Share Your Experience</h4>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Your Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  type="button"
                  key={starVal}
                  onClick={() => setNewReviewRating(starVal)}
                  className="focus:outline-none"
                >
                  <Star className={`w-6 h-6 ${
                    starVal <= newReviewRating 
                      ? 'text-amber-400 fill-amber-400' 
                      : 'text-gray-300 dark:text-gray-750'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <textarea
              required
              rows={3}
              placeholder="Tell us about the service, stylist expertise, and ambiance..."
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              className="flex-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg w-max shadow-sm active:scale-95 duration-200 self-end"
          >
            Post Review
          </button>
        </form>

        {/* Reviews Lists */}
        <div className="flex flex-col gap-4">
          {reviewsList.map((rev) => (
            <div 
              key={rev.id} 
              className="p-5 border-b border-gray-100 dark:border-gray-700/60 last:border-none flex flex-col gap-2.5"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100">
                    {rev.name}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-450 mt-0.5">
                    Reviewed on {rev.date}
                  </div>
                </div>
                <div className="flex gap-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/30">
                  <span>{rev.rating}</span>
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500 self-center" />
                </div>
              </div>
              <p className="text-sm text-gray-650 dark:text-gray-350 leading-relaxed">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Sticky Bottom Checkout Banner */}
      {selectedServices.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white dark:bg-gray-900 border-t border-gray-150 dark:border-gray-800/80 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] flex justify-between items-center max-w-7xl mx-auto"
        >
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              {selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'} selected
            </div>
            <div className="font-extrabold text-gray-950 dark:text-white text-lg sm:text-xl">
              ₹{totalPrice}
            </div>
          </div>
          <button
            onClick={handleBookNow}
            className="bg-primary hover:bg-primary-hover text-white font-bold text-sm sm:text-base px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 duration-200"
          >
            Book Appointment
          </button>
        </motion.div>
      )}

    </div>
  );
};
