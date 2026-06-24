'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, Clock, Phone, Heart, ChevronRight, MessageSquare, Check, ShieldCheck, User, Users, Calendar, Sparkles, Award } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Salon, type Service } from '../../../components/SalonCard';

export default function SalonDetails() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isInWishlist, toggleWishlist, addToast, user } = useApp();

  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Fetch salon details from backend
  const { data: salon, isLoading, error } = useQuery<Salon>({
    queryKey: ['salon', id],
    queryFn: () => apiFetch(`/salons/${id}`),
  });

  // Post review mutation
  const reviewMutation = useMutation({
    mutationFn: (newReview: { rating: number; comment: string }) => {
      return apiFetch(`/bookings/review`, {
        method: 'POST',
        body: JSON.stringify({
          salonId: id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon', id] });
      addToast('Review submitted successfully! Thank you for the feedback.', 'success');
      setNewReviewComment('');
      setNewReviewRating(5);
    },
    onError: () => {
      addToast('Failed to post review. Please try again.', 'error');
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (salon) {
      window.scrollTo(0, 0);
      setActiveImage(salon.coverImage || salon.gallery?.[0] || '');
    }
  }, [salon]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-500 font-semibold text-sm">Loading premium beauty salon details...</p>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Salon Not Found</h2>
        <p className="text-gray-500 mb-6 text-sm">The salon workspace might have moved or is offline.</p>
        <button
          onClick={() => router.push('/browse')}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(salon.id);

  // Toggle service selection
  const handleToggleService = (srv: Service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === srv.id);
      if (exists) {
        return prev.filter(s => s.id !== srv.id);
      } else {
        return [...prev, srv];
      }
    });
  };

  // Add package services to selection with a discount alert
  const handleSelectPackage = (pkg: any) => {
    // Find services by names matched in package
    const pkgServices = salon.services.filter(s => 
      pkg.services.some((ps: string) => s.name.toLowerCase() === ps.toLowerCase() || s.name.toLowerCase().includes(ps.toLowerCase()))
    );

    if (pkgServices.length > 0) {
      setSelectedServices(pkgServices);
      addToast(`Preloaded "${pkg.name}" package checklist! ✨`, 'success');
    } else {
      // If direct match fails, preload first available services
      setSelectedServices(salon.services.slice(0, 2));
      addToast(`Package preloaded into checklist!`, 'info');
    }
  };

  const handleBookNow = () => {
    if (selectedServices.length === 0) {
      addToast('Please select at least one service to book', 'warning');
      return;
    }
    
    // Store in localStorage for booking flow checkout page
    if (typeof window !== 'undefined') {
      localStorage.setItem('salonai_selected_services', JSON.stringify(selectedServices));
    }
    
    router.push(`/booking?salonId=${salon.id}`);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      addToast('Please write some feedback comment', 'warning');
      return;
    }
    reviewMutation.mutate({
      rating: newReviewRating,
      comment: newReviewComment,
    });
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 pb-32">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <span className="cursor-pointer hover:text-primary" onClick={() => router.push('/')}>Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="cursor-pointer hover:text-primary" onClick={() => router.push('/browse')}>Browse</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{salon.name}</span>
      </div>

      {/* Main Grid: Gallery & Brand Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-80 sm:h-96 md:h-[450px] rounded-3xl overflow-hidden border border-pink-100/50 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-gray-950"
          >
            <img 
              src={activeImage} 
              alt={salon.name} 
              className="w-full h-full object-cover transition-all duration-300"
            />
          </motion.div>
          
          {/* Thumbnails */}
          {salon.gallery && salon.gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {salon.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 sm:w-24 h-16 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    activeImage === img ? 'border-primary scale-95 shadow-sm' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Details Banner */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm relative">
          
          {/* Favorites Heart */}
          <button
            onClick={() => toggleWishlist(salon.id)}
            className="absolute top-6 right-6 p-3 bg-pink-50 dark:bg-gray-900/60 hover:bg-pink-100 text-gray-550 hover:text-red-500 rounded-full transition-colors focus:outline-none cursor-pointer"
          >
            <Heart className={`w-5 h-5 transition-transform duration-200 ${isWishlisted ? 'text-red-500 fill-red-500 scale-110' : ''}`} />
          </button>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-2">
              <span className="bg-pink-100 dark:bg-pink-950/40 text-primary dark:text-pink-300 text-[10px] font-extrabold px-3 py-1 rounded-lg border border-pink-200/50 w-max uppercase tracking-wider">
                {salon.area}
              </span>
              <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-lg border border-amber-200/30 w-max uppercase tracking-wider">
                {salon.genderCategory === 'MALE' ? 'Gentlemen' : salon.genderCategory === 'FEMALE' ? 'Ladies Only' : 'Unisex Space'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-gray-950 dark:text-white leading-tight pr-10">
              {salon.name}
            </h1>
            
            {/* Rating Details */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <span>{salon.rating}</span>
                <Star className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-gray-500 dark:text-gray-400 font-semibold">
                ({salon.reviewsCount} verified reviews)
              </span>
            </div>
          </div>

          {/* Luxury Brand Story Paragraph */}
          <div className="border-t border-pink-100/55 dark:border-gray-700/60 pt-4">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-primary mb-1">Brand Story</h4>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold italic">
              "{salon.brandStory || 'Bringing the gold-standards of cosmetology and customized wellness packages to the Pink City.'}"
            </p>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {salon.overview}
          </p>

          {/* Logistics specs */}
          <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-700/60 pt-4 text-xs sm:text-sm font-semibold text-gray-750 dark:text-gray-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{salon.address}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{salon.openingHours || '10:00 AM - 08:30 PM'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{salon.phone}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Specialties, Amenities, and Discount Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Specialties & Packages */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Specialties Section */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5.5 h-5.5 text-primary" />
                <span>Dedicated Specialties</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">What this space does best and is verified for.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {salon.expertise && salon.expertise.map((exp, idx) => (
                <div key={idx} className="p-4 bg-pink-50/25 dark:bg-pink-950/15 border border-pink-100/50 rounded-2xl flex flex-col gap-1 text-center">
                  <span className="text-primary font-serif font-black text-sm uppercase tracking-wide">{exp}</span>
                  <span className="text-[10px] text-gray-400 font-bold">Verified Excellence</span>
                </div>
              ))}
              {(!salon.expertise || salon.expertise.length === 0) && (
                ['Cosmetic Glow', 'Luxury Hair Styling', 'Wellness Therapy'].map((exp, idx) => (
                  <div key={idx} className="p-4 bg-pink-50/25 dark:bg-pink-950/15 border border-pink-100/50 rounded-2xl flex flex-col gap-1 text-center">
                    <span className="text-primary font-serif font-black text-sm uppercase tracking-wide">{exp}</span>
                    <span className="text-[10px] text-gray-400 font-bold">Verified Excellence</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Discounted Packages Section */}
          {salon.packages && salon.packages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-5">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5.5 h-5.5 text-amber-500" />
                  <span>Discounted Combinations & Packages</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Select a bundle to apply pre-curated combinations at up to 25% off.</p>
              </div>
              <div className="flex flex-col gap-4">
                {salon.packages.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className="p-5 border border-pink-200/50 dark:border-pink-900/40 bg-pink-50/10 dark:bg-gray-950/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-pink-300 transition-colors"
                  >
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-base leading-snug">{pkg.name}</h4>
                        <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">Bundle Deal</span>
                      </div>
                      <p className="text-xs text-gray-550 dark:text-gray-400">{pkg.description || 'Exclusive styling and treatment combo.'}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {pkg.services.map((ps: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold text-gray-500 dark:text-gray-450 bg-white dark:bg-gray-850 border border-gray-150 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" />
                            {ps}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 flex-shrink-0">
                      <div>
                        <span className="text-lg font-black text-gray-900 dark:text-white">₹{pkg.price}</span>
                        <span className="text-[10px] text-gray-400 block sm:text-right">Tax included</span>
                      </div>
                      <button
                        onClick={() => handleSelectPackage(pkg)}
                        className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Apply Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Checklist Section */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Check className="w-5.5 h-5.5 text-primary" />
                <span>Interactive Services Menu</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle checkboxes to construct your custom appointment package.</p>
            </div>

            {/* List with category headers */}
            <div className="flex flex-col gap-6">
              {Array.from(new Set(salon.services.map(s => s.category))).map((category) => (
                <div key={category} className="flex flex-col gap-3">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-pink-100/50 dark:border-gray-700/60 pb-1.5 mt-2">
                    {category}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {salon.services
                      .filter(s => s.category === category)
                      .map((srv) => {
                        const isSelected = selectedServices.some(s => s.id === srv.id);
                        return (
                          <div 
                            key={srv.id}
                            onClick={() => handleToggleService(srv)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-pink-50/40 dark:bg-pink-955/20 border-pink-300 dark:border-pink-900/60 shadow-sm scale-[1.01]' 
                                : 'bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-900/40 border-gray-100 dark:border-gray-750'
                            }`}
                          >
                            <div className="flex-1 flex gap-3 items-center pr-4">
                              <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center border transition-all ${
                                isSelected ? 'bg-primary border-primary text-white shadow-sm' : 'border-gray-300 dark:border-gray-650'
                              }`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                              <div>
                                <div className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                                  {srv.name}
                                </div>
                                <div className="text-[10px] text-gray-500 dark:text-gray-450 mt-0.5 flex items-center gap-1.5 font-semibold">
                                  <span>{srv.duration} mins</span>
                                  {srv.description && (
                                    <>
                                      <span>&bull;</span>
                                      <span className="truncate max-w-[200px] sm:max-w-sm font-medium">{srv.description}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="font-black text-gray-950 dark:text-white text-sm sm:text-base">
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

        </div>

        {/* Right Column: Stylists Grid & Policies */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Team / Stylists Grid */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-4">
            <h3 className="font-serif font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-5 h-5 text-primary" />
              <span>Certified Professionals</span>
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-450 mt-0.5">Choose your preferred specialist during checkout slots.</p>
            
            <div className="flex flex-col gap-4 mt-2">
              {salon.professionals && salon.professionals.map((prof) => (
                <div key={prof.id} className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl flex gap-3 items-center">
                  <img
                    src={prof.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={prof.name}
                    className="w-12 h-12 rounded-full object-cover border border-pink-100/50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{prof.name}</div>
                    <div className="text-[10px] text-primary font-bold">{prof.specialization} &bull; {prof.yearsExperience} yrs</div>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">{prof.bio || 'Expert bridal hair stylist.'}</p>
                  </div>
                </div>
              ))}
              {(!salon.professionals || salon.professionals.length === 0) && (
                <div className="p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl text-center text-xs text-gray-550 dark:text-gray-400">
                  Salon specialists catalog is being updated.
                </div>
              )}
            </div>
          </div>

          {/* Hygiene and Safety */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-4">
            <h3 className="font-serif font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Hygiene Standards</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
              {salon.hygieneStandards || '100% sterilized tools, single-use sheets, and certified sanitization protocols between guest slots.'}
            </p>
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/60 text-[10px] font-black uppercase tracking-wider p-2.5 rounded-xl text-center">
              Verified Marketplace Standard
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-4">
            <h3 className="font-serif font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-primary animate-bounce" />
              <span>Salon Coordinates</span>
            </h3>
            <div className="w-full h-40 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/65 relative bg-pink-50/20 flex flex-col items-center justify-center p-4 text-center">
              <div className="absolute inset-0 bg-cover opacity-60 dark:opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=350&auto=format&fit=crop&q=80)' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-500/10 dark:from-pink-900/10 dark:to-pink-900/20" />
              <div className="relative bg-white dark:bg-gray-900 p-2.5 rounded-2xl shadow-md flex items-center justify-center flex-col gap-1 border border-pink-100/50">
                <span className="text-[9px] font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider">{salon.name}</span>
              </div>
            </div>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary font-extrabold text-center hover:underline cursor-pointer"
            >
              Open Directions in Google Maps
            </a>
          </div>

        </div>

      </div>

      {/* Review Section */}
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm flex flex-col gap-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span>Marketplace Client Reviews</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-450 mt-0.5">
            Verified ratings left by guests after appointment check-ins.
          </p>
        </div>

        {/* Leave a review form */}
        <form onSubmit={handleAddReview} className="flex flex-col gap-4 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-200">Submit Your Experience</h4>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Rating Star:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  type="button"
                  key={starVal}
                  onClick={() => setNewReviewRating(starVal)}
                  className="focus:outline-none cursor-pointer"
                >
                  <Star className={`w-6 h-6 ${
                    starVal <= newReviewRating 
                      ? 'text-amber-400 fill-amber-400' 
                      : 'text-gray-300 dark:text-gray-700'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <textarea
              required
              rows={3}
              placeholder="Tell us about the stylist quality, service, hygiene, and boutique ambiance..."
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              className="flex-grow bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl p-3 text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            disabled={reviewMutation.isPending}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-xl w-max shadow-sm active:scale-95 duration-200 self-end cursor-pointer disabled:opacity-50"
          >
            {reviewMutation.isPending ? 'Posting Review...' : 'Submit Review'}
          </button>
        </form>

        {/* Reviews Lists */}
        <div className="flex flex-col gap-4">
          {salon.reviews && salon.reviews.length > 0 ? (
            salon.reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="p-5 border-b border-gray-100 dark:border-gray-700/65 last:border-none flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-gray-800 dark:text-gray-100">
                      {rev.name}
                    </div>
                    <div className="text-[10px] text-gray-450 mt-0.5 font-semibold">
                      Checked-in on {new Date(rev.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex gap-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <span>{rev.rating}</span>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 self-center" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-655 dark:text-gray-350 leading-relaxed font-medium">
                  {rev.comment}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-gray-400 py-6 font-semibold">
              Be the first to leave a verified review for this space! 🌸
            </div>
          )}
        </div>
      </section>

      {/* Floating Sticky Bottom Checkout Bar */}
      {selectedServices.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-pink-100/60 dark:border-gray-800 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] flex justify-between items-center max-w-7xl mx-auto rounded-t-3xl"
        >
          <div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-widest">
              {selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'} selected
            </div>
            <div className="font-black text-gray-950 dark:text-white text-lg sm:text-xl">
              ₹{totalPrice}
            </div>
          </div>
          
          <button
            onClick={handleBookNow}
            className="bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm px-4 sm:px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
          >
            <span className="hidden sm:inline">Schedule Appointment Slots</span>
            <span className="inline sm:hidden">Schedule Slots</span>
          </button>
        </motion.div>
      )}

    </div>
  );
}
