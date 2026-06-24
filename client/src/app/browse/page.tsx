'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, Search, X, Check, ArrowRight, Eye, ShieldAlert, Award, Star, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SalonCard, type Salon } from '../../components/SalonCard';
import { SalonCardSkeleton } from '../../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useApp();

  // Search parameters
  const qArea = searchParams.get('area') || '';
  const qService = searchParams.get('service') || '';
  const qSearch = searchParams.get('search') || '';

  // States
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>(''); // 'under-500' | '500-1000' | '1000-2000' | '2000-plus' | ''
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('top-rated');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isHybridSearchActive, setIsHybridSearchActive] = useState(false);

  // Advanced Filters
  const [city, setCity] = useState('Jaipur');
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 means Any
  const [openNow, setOpenNow] = useState(false);
  const [hasOffers, setHasOffers] = useState(false);

  // Distance Calculator based on area to match SalonCard
  const getSalonDistance = (area: string) => {
    switch (area) {
      case 'C-Scheme': return 0.8;
      case 'Raja Park': return 2.1;
      case 'Vaishali Nagar': return 4.2;
      case 'Malviya Nagar': return 4.9;
      case 'Mansarovar': return 5.8;
      case 'Jagatpura': return 7.2;
      default: return 1.5;
    }
  };

  // Check if salon has active offers
  const hasSalonOffers = (salon: any) => {
    return ['salon-1', 'salon-2', 'salon-3', 'salon-4', 'salon-7', 'salon-10'].includes(salon.id) || 
      (salon.packages && salon.packages.length > 0) || 
      (salon.offers && salon.offers.length > 0);
  };

  // Check if salon is open right now
  const isSalonOpenNow = (openingHours: string) => {
    if (!openingHours) return true;
    try {
      const parts = openingHours.split('-');
      if (parts.length !== 2) return true;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const parseTime = (timeStr: string) => {
        const clean = timeStr.trim().toLowerCase();
        const isPm = clean.includes('pm');
        const isAm = clean.includes('am');
        const timeParts = clean.replace(/(am|pm)/, '').trim().split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
        if (isPm && hours < 12) hours += 12;
        if (isAm && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      const startMinutes = parseTime(parts[0]);
      const endMinutes = parseTime(parts[1]);
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } catch (e) {
      return true;
    }
  };

  // Comparison State
  const [comparedSalons, setComparedSalons] = useState<Salon[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Set search text state from URL query
  useEffect(() => {
    if (qSearch) {
      setSearchQuery(qSearch);
      setIsHybridSearchActive(true);
    } else {
      setIsHybridSearchActive(false);
    }
  }, [qSearch]);

  // Synchronize filter selections with URL parameters
  useEffect(() => {
    if (qArea) setSelectedAreas([qArea]);
    if (qService) setSelectedServices([qService]);
  }, [qArea, qService]);

  // Fetch salons
  const { data: allSalons = [], isLoading: isLoadingAll } = useQuery<Salon[]>({
    queryKey: ['salons-browse-all'],
    queryFn: () => apiFetch('/salons'),
  });

  // Fetch search results if hybrid search query is active
  const { data: searchSalons = [], isLoading: isLoadingSearch } = useQuery<any[]>({
    queryKey: ['salons-search', qSearch],
    queryFn: () => apiFetch(`/salons/search?q=${encodeURIComponent(qSearch)}`),
    enabled: !!qSearch,
  });

  const isLoading = isLoadingAll || (!!qSearch && isLoadingSearch);

  // Base list of salons to perform metadata filters on
  const baseSalonsList = useMemo(() => {
    if (qSearch && searchSalons.length > 0) {
      // Hybrid search returns items wrapped with ranking metrics or directly
      // Let's check format: some hybrid searches return { salon, score, matches }
      return searchSalons.map(item => item.salon ? item.salon : item);
    }
    return allSalons;
  }, [qSearch, searchSalons, allSalons]);

  // Options lists
  const areas = ['C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Raja Park', 'Mansarovar', 'Jagatpura'];
  const services = ['Bridal Makeup', 'Hair Spa', 'Hair Cut', 'Facial', 'Nail Art', 'Hair Color', 'Skin Care', 'Groom Packages'];
  const genders = ['FEMALE', 'MALE', 'UNISEX'];

  const handleAreaChange = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleServiceChange = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGenders(prev =>
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
  };

  const handleClearFilters = () => {
    setSelectedAreas([]);
    setSelectedServices([]);
    setSelectedGenders([]);
    setPriceRange('');
    setMinRating(0);
    setSearchQuery('');
    setCity('Jaipur');
    setMaxDistance(0);
    setOpenNow(false);
    setHasOffers(false);
    router.push('/browse');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/browse');
    }
  };

  // Local filtering logic over fetched dataset
  const filteredSalons = useMemo(() => {
    let result = [...baseSalonsList];

    // Filter by city
    if (city && city !== 'All') {
      result = result.filter(s => {
        const salonLocation = s.location || '';
        return salonLocation.toLowerCase().includes(city.toLowerCase());
      });
    }

    // Filter by search text locally if hybrid search isn't being used
    if (searchQuery.trim() && !qSearch) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        (s.services && s.services.some((sv: any) => sv.name.toLowerCase().includes(q) || sv.category.toLowerCase().includes(q)))
      );
    }

    // Filter by areas
    if (selectedAreas.length > 0) {
      result = result.filter(s => selectedAreas.includes(s.area));
    }

    // Filter by services
    if (selectedServices.length > 0) {
      result = result.filter(s =>
        s.services && s.services.some((sv: any) => selectedServices.includes(sv.category))
      );
    }

    // Filter by gender categories
    if (selectedGenders.length > 0) {
      result = result.filter(s => selectedGenders.includes(s.genderCategory));
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter(s => s.rating >= minRating);
    }

    // Filter by starting price
    if (priceRange) {
      result = result.filter(s => {
        const startingPrice = s.services && s.services.length > 0
          ? Math.min(...s.services.map((sv: any) => sv.price))
          : 0;
        if (priceRange === 'under-500') return startingPrice < 500;
        if (priceRange === '500-1000') return startingPrice >= 500 && startingPrice <= 1000;
        if (priceRange === '1000-2000') return startingPrice >= 1000 && startingPrice <= 2000;
        if (priceRange === '2000-plus') return startingPrice > 2000;
        return true;
      });
    }

    // Filter by distance
    if (maxDistance > 0) {
      result = result.filter(s => getSalonDistance(s.area) <= maxDistance);
    }

    // Filter by open now
    if (openNow) {
      result = result.filter(s => isSalonOpenNow(s.openingHours));
    }

    // Filter by active offers
    if (hasOffers) {
      result = result.filter(s => hasSalonOffers(s));
    }

    // Sorting logic (does not override scores from hybrid search unless specified by user)
    if (sortBy === 'top-rated') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const pA = a.services && a.services.length > 0 ? Math.min(...a.services.map((sv: any) => sv.price)) : 99999;
        const pB = b.services && b.services.length > 0 ? Math.min(...b.services.map((sv: any) => sv.price)) : 99999;
        return pA - pB;
      });
    } else if (sortBy === 'reviews-high') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else if (sortBy === 'most-booked') {
      // Sort by reviews count as proxy for total bookings
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else if (sortBy === 'nearest') {
      result.sort((a, b) => getSalonDistance(a.area) - getSalonDistance(b.area));
    }

    return result;
  }, [baseSalonsList, selectedAreas, selectedServices, selectedGenders, priceRange, minRating, sortBy, searchQuery, qSearch, city, maxDistance, openNow, hasOffers]);

  // Comparison Handlers
  const handleToggleCompare = (salon: Salon) => {
    const isAlreadyAdded = comparedSalons.some(s => s.id === salon.id);
    if (isAlreadyAdded) {
      setComparedSalons(prev => prev.filter(s => s.id !== salon.id));
      addToast(`${salon.name} removed from comparison.`, 'info');
    } else {
      if (comparedSalons.length >= 3) {
        addToast('You can compare a maximum of 3 salons at a time.', 'warning');
        return;
      }
      setComparedSalons(prev => [...prev, salon]);
      addToast(`${salon.name} added for side-by-side comparison! 📊`, 'success');
    }
  };

  const clearComparedList = () => {
    setComparedSalons([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 relative min-h-screen pb-32">
      
      {/* 1. Header Banner & Search Box */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mb-1">
            Browse Salons
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {isHybridSearchActive 
              ? `AI Semantic Search matches for "${qSearch}": Showing ${filteredSalons.length} results`
              : `Showing ${filteredSalons.length} beauty salons in Jaipur`
            }
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-2xl px-4 py-2.5 text-sm w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search salon, area, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full text-gray-800 dark:text-gray-100"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center justify-center gap-2 border border-pink-100 dark:border-gray-700 px-4 py-3 rounded-2xl font-bold text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 2. Side-by-side Grid: Sidebar Filter + Cards */}
      <div className="flex gap-8 relative items-start">
              {/* Desktop Sidebar Filters */}
        <aside className="hidden md:flex flex-col gap-6 w-68 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm sticky top-24 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
              <SlidersHorizontal className="w-4.5 h-4.5 text-primary" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* City Selection */}
          <div className="flex flex-col gap-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-250">
              City Selection
            </h4>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full"
            >
              <option value="Jaipur">Jaipur (Active)</option>
              <option value="Delhi">Delhi (Demo)</option>
              <option value="Mumbai">Mumbai (Demo)</option>
            </select>
          </div>

          {/* Area Checkboxes */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-250">
              Location Area
            </h4>
            <div className="flex flex-col gap-2.5">
              {areas.map(area => (
                <label key={area} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-355 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area)}
                    onChange={() => handleAreaChange(area)}
                    className="accent-primary h-4 w-4 rounded border-gray-300"
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Distance Filter */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-250">
              Distance Range
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-gray-750 dark:text-gray-350">
              {[
                { label: 'Any distance', value: 0 },
                { label: 'Within 2 km', value: 2 },
                { label: 'Within 5 km', value: 5 },
                { label: 'Within 10 km', value: 10 }
              ].map(item => (
                <label key={item.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="distanceFilter"
                    checked={maxDistance === item.value}
                    onChange={() => setMaxDistance(item.value)}
                    className="accent-primary h-4 w-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-250">
              Target Audience
            </h4>
            <div className="flex flex-col gap-2.5">
              {genders.map(g => (
                <label key={g} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-355 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGenders.includes(g)}
                    onChange={() => handleGenderChange(g)}
                    className="accent-primary h-4 w-4 rounded border-gray-300"
                  />
                  <span>{g === 'MALE' ? 'Male Only' : g === 'FEMALE' ? 'Female Only' : 'Unisex'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-255">
              Service Types
            </h4>
            <div className="flex flex-col gap-2.5">
              {services.map(srv => (
                <label key={srv} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(srv)}
                    onChange={() => handleServiceChange(srv)}
                    className="accent-primary h-4 w-4 rounded border-gray-300"
                  />
                  <span>{srv}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Starting Price Category */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">
              Budget / Pricing
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-gray-750 dark:text-gray-350">
              {[
                { label: 'Any Price', value: '' },
                { label: 'Under ₹500', value: 'under-500' },
                { label: '₹500 - ₹1000', value: '500-1000' },
                { label: '₹1000 - ₹2000', value: '1000-2000' },
                { label: '₹2000+', value: '2000-plus' }
              ].map(item => (
                <label key={item.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="priceFilter"
                    checked={priceRange === item.value}
                    onChange={() => setPriceRange(item.value)}
                    className="accent-primary h-4 w-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">
              Minimum Rating
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-gray-750 dark:text-gray-350">
              {[
                { label: 'All Ratings', value: 0 },
                { label: '4.5+ ★', value: 4.5 },
                { label: '4.0+ ★', value: 4.0 },
                { label: '3.0+ ★', value: 3.0 }
              ].map(item => (
                <label key={item.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={minRating === item.value}
                    onChange={() => setMinRating(item.value)}
                    className="accent-primary h-4 w-4"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Refinements */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-255">
              Refinements
            </h4>
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-750 dark:text-gray-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openNow}
                  onChange={(e) => setOpenNow(e.target.checked)}
                  className="accent-primary h-4 w-4 rounded border-gray-300"
                />
                <span>Open Now</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-750 dark:text-gray-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasOffers}
                  onChange={(e) => setHasOffers(e.target.checked)}
                  className="accent-primary h-4 w-4 rounded border-gray-300"
                />
                <span>With Active Discounts</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Listings Display Column */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Sorting panel */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4.5 rounded-2xl border border-pink-100/50 dark:border-gray-700/60 shadow-sm">
            <span className="text-xs font-bold text-gray-550 dark:text-gray-400">
              Sort salons by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer border-none"
            >
              <option value="top-rated">Top Rated (Default)</option>
              <option value="price-low">Starting Price (Low to High)</option>
              <option value="reviews-high">Reviews Count (High to Low)</option>
              <option value="most-booked">Most Booked</option>
              <option value="nearest">Nearest to Me</option>
            </select>
          </div>

          {/* Salon cards stack */}
          {isLoading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map(i => (
                <SalonCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredSalons.length > 0 ? (
            <div className="flex flex-col gap-6">
              <AnimatePresence mode="popLayout">
                {filteredSalons.map((salon) => (
                  <motion.div
                    key={salon.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SalonCard
                      salon={salon}
                      onCompareToggle={() => handleToggleCompare(salon)}
                      isCompared={comparedSalons.some(s => s.id === salon.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-pink-100/40 p-12 text-center flex flex-col items-center gap-4 shadow-sm">
              <div className="bg-pink-50 dark:bg-pink-950/20 text-primary p-4.5 rounded-full">
                <Filter className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">No Salons Match</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm max-w-sm">
                Try widening your sidebar checkboxes, lowering rating constraints, or resetting your filter stack.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl mt-2 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. Floating Bottom Salon Comparison System Drawer */}
      <AnimatePresence>
        {comparedSalons.length > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-pink-150 dark:border-gray-800 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] py-4 px-6 md:px-8 max-w-7xl mx-auto rounded-t-3xl"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-left">
                  <div className="text-[10px] text-gray-450 dark:text-gray-500 uppercase tracking-widest font-extrabold">Salon Comparison</div>
                  <div className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm">
                    {comparedSalons.length} of 3 spaces selected
                  </div>
                </div>
                
                {/* Chosen Salons Thumbnails */}
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  {comparedSalons.map(salon => (
                    <div key={salon.id} className="relative group flex items-center">
                      <img
                        src={salon.coverImage}
                        alt={salon.name}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-pink-100"
                      />
                      <button
                        onClick={() => handleToggleCompare(salon)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="hidden md:inline-block ml-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[90px]">
                        {salon.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={clearComparedList}
                  className="text-xs font-bold text-gray-500 hover:text-gray-750 dark:text-gray-400 py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  Clear Selection
                </button>
                <button
                  onClick={() => {
                    if (comparedSalons.length < 2) {
                      addToast('Select at least 2 salons to launch comparison.', 'warning');
                      return;
                    }
                    setShowComparisonModal(true);
                  }}
                  disabled={comparedSalons.length < 2}
                  className={`font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                    comparedSalons.length >= 2
                      ? 'bg-primary hover:bg-primary-hover text-white active:scale-95'
                      : 'bg-gray-150 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>Compare Side-by-Side</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Full screen / drawer comparison matrix popup */}
      <AnimatePresence>
        {showComparisonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComparisonModal(false)}
              className="fixed inset-0 bg-black"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl shadow-2xl relative z-10 border border-pink-100/50 dark:border-gray-800 max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-primary" />
                    <span>Salon Comparison System</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-450">Side-by-side analysis of pricing, services, and beauty specialists.</p>
                </div>
                <button
                  onClick={() => setShowComparisonModal(false)}
                  className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparison Matrix Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="py-4 font-bold text-gray-400 dark:text-gray-550 w-1/4">Salon Specs</th>
                      {comparedSalons.map(s => (
                        <th key={s.id} className="py-4 px-4 w-1/4">
                          <div className="flex flex-col gap-2">
                            <img
                              src={s.coverImage}
                              alt={s.name}
                              className="w-full h-28 object-cover rounded-2xl border border-pink-50"
                            />
                            <div className="font-serif font-extrabold text-gray-900 dark:text-white text-base leading-tight">
                              {s.name}
                            </div>
                          </div>
                        </th>
                      ))}
                      {/* Fill empty headers if only 2 salons compared */}
                      {comparedSalons.length === 2 && <th className="w-1/4" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-gray-700 dark:text-gray-350">
                    
                    {/* Rating row */}
                    <tr>
                      <td className="py-3.5 font-extrabold text-gray-500">Rating & Reviews</td>
                      {comparedSalons.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                            <span>{s.rating}</span>
                            <span className="text-gray-400 font-semibold text-xs">({s.reviewsCount} reviews)</span>
                          </div>
                        </td>
                      ))}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                    {/* Price category row */}
                    <tr>
                      <td className="py-3.5 font-extrabold text-gray-500">Price Segment</td>
                      {comparedSalons.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-bold">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                            s.pricingCategory === 'LUXURY' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : s.pricingCategory === 'MID'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {s.pricingCategory}
                          </span>
                        </td>
                      ))}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                    {/* Starting price */}
                    <tr>
                      <td className="py-3.5 font-extrabold text-gray-500">Starting price</td>
                      {comparedSalons.map(s => {
                        const startPrice = s.services && s.services.length > 0
                          ? Math.min(...s.services.map(sv => sv.price))
                          : 0;
                        return (
                          <td key={s.id} className="py-3.5 px-4 font-extrabold text-primary text-base">
                            ₹{startPrice}
                          </td>
                        );
                      })}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                    {/* Neighborhood Area */}
                    <tr>
                      <td className="py-3.5 font-extrabold text-gray-500">Location Area</td>
                      {comparedSalons.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                          {s.area}
                        </td>
                      ))}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                    {/* Specialties */}
                    <tr>
                      <td className="py-3.5 font-extrabold text-gray-500">Specialties</td>
                      {comparedSalons.map(s => (
                        <td key={s.id} className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {s.expertise ? s.expertise.map((exp, idx) => (
                              <span key={idx} className="bg-pink-50/50 dark:bg-pink-950/20 text-primary dark:text-pink-300 text-[10px] font-bold px-2 py-0.5 rounded border border-pink-100/35">
                                {exp}
                              </span>
                            )) : 'Grooming'}
                          </div>
                        </td>
                      ))}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                    {/* Gender Segment */}
                    <tr>
                      <td className="py-3.5 font-extrabold text-gray-500">Target Segment</td>
                      {comparedSalons.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-bold text-xs">
                          {s.genderCategory === 'MALE' ? 'Male Only' : s.genderCategory === 'FEMALE' ? 'Female Only' : 'Unisex'}
                        </td>
                      ))}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                    {/* Professional Specialists count */}
                    <tr>
                      <td className="py-3.5 font-extrabold text-gray-500">Team Size</td>
                      {comparedSalons.map(s => (
                        <td key={s.id} className="py-3.5 px-4 font-medium">
                          {s.professionals ? s.professionals.length : 1} Experts listed
                        </td>
                      ))}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                    {/* Amenities list */}
                    <tr>
                      <td className="py-3.5 font-extrabold text-gray-500">Amenities</td>
                      {comparedSalons.map(s => (
                        <td key={s.id} className="py-3.5 px-4 text-xs font-semibold">
                          {s.amenities ? s.amenities.join(', ') : 'WiFi, AC'}
                        </td>
                      ))}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                    {/* CTA Actions */}
                    <tr>
                      <td className="py-4" />
                      {comparedSalons.map(s => (
                        <td key={s.id} className="py-4 px-4">
                          <button
                            onClick={() => {
                              setShowComparisonModal(false);
                              router.push(`/salon/${s.id}`);
                            }}
                            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow w-full text-center cursor-pointer"
                          >
                            Book Salon
                          </button>
                        </td>
                      ))}
                      {comparedSalons.length === 2 && <td />}
                    </tr>

                  </tbody>
                </table>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Mobile slide-in drawers filters */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-white dark:bg-gray-900 h-full p-6 flex flex-col gap-6 relative z-10 shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="font-extrabold text-lg text-gray-900 dark:text-white">Mobile Filters</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile City Selection */}
              <div className="flex flex-col gap-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">City Selection</h4>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none w-full"
                >
                  <option value="Jaipur">Jaipur (Active)</option>
                  <option value="Delhi">Delhi (Demo)</option>
                  <option value="Mumbai">Mumbai (Demo)</option>
                </select>
              </div>

              {/* Mobile Area checkboxes */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">Location Area</h4>
                <div className="grid grid-cols-2 gap-3">
                  {areas.map(area => (
                    <label key={area} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedAreas.includes(area)}
                        onChange={() => handleAreaChange(area)}
                        className="accent-primary h-4.5 w-4.5 rounded"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Distance Filter */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">
                  Distance Range
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-700 dark:text-gray-305">
                  {[
                    { label: 'Any distance', value: 0 },
                    { label: 'Within 2 km', value: 2 },
                    { label: 'Within 5 km', value: 5 },
                    { label: 'Within 10 km', value: 10 }
                  ].map(item => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="distanceFilterMobile"
                        checked={maxDistance === item.value}
                        onChange={() => setMaxDistance(item.value)}
                        className="accent-primary h-4 w-4"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Genders checkboxes */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">Target Audience</h4>
                <div className="flex flex-col gap-2.5">
                  {genders.map(g => (
                    <label key={g} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(g)}
                        onChange={() => handleGenderChange(g)}
                        className="accent-primary h-4.5 w-4.5 rounded"
                      />
                      <span>{g === 'MALE' ? 'Male Only' : g === 'FEMALE' ? 'Female Only' : 'Unisex'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Service Checkboxes */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">Service Types</h4>
                <div className="grid grid-cols-2 gap-3">
                  {services.map(srv => (
                    <label key={srv} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-350">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(srv)}
                        onChange={() => handleServiceChange(srv)}
                        className="accent-primary h-4.5 w-4.5 rounded"
                      />
                      <span>{srv}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">Pricing Starting</h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {[
                    { label: 'Any Price', value: '' },
                    { label: 'Under ₹500', value: 'under-500' },
                    { label: '₹500 - ₹1000', value: '500-1000' },
                    { label: '₹1000 - ₹2000', value: '1000-2000' },
                    { label: '₹2000+', value: '2000-plus' }
                  ].map(item => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceFilterMobile"
                        checked={priceRange === item.value}
                        onChange={() => setPriceRange(item.value)}
                        className="accent-primary h-4 w-4"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Refinements */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-gray-900 dark:text-gray-200">Refinements</h4>
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openNow}
                      onChange={(e) => setOpenNow(e.target.checked)}
                      className="accent-primary h-4.5 w-4.5 rounded"
                    />
                    <span>Open Now</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOffers}
                      onChange={(e) => setHasOffers(e.target.checked)}
                      className="accent-primary h-4.5 w-4.5 rounded"
                    />
                    <span>With Active Discounts</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-2xl font-bold text-xs shadow-md"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="w-full border border-pink-100 text-primary py-3.5 rounded-2xl font-bold text-xs"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function Browse() {
  return (
    <React.Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-500 font-semibold text-sm">Loading salon marketplace catalog...</p>
      </div>
    }>
      <BrowseContent />
    </React.Suspense>
  );
}
