import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import { salonsData } from '../data/salons';
import { SalonCard } from '../components/SalonCard';
import { SalonCardSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [loading, setLoading] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>(''); // 'under-500' | '500-1000' | '1000-2000' | '2000-plus' | ''
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('top-rated'); // 'top-rated' | 'price-low' | 'reviews-high'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Setup options from data structure
  const areas = ['C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Raja Park', 'Mansarovar', 'Jagatpura'];
  const services = ['Bridal Makeup', 'Hair Spa', 'Hair Cut', 'Facial', 'Nail Art', 'Hair Color', 'Skin Care', 'Groom Packages'];

  // Initialize filters from search parameters
  useEffect(() => {
    const qArea = searchParams.get('area');
    const qService = searchParams.get('service');
    const qSearch = searchParams.get('search');

    if (qArea) setSelectedAreas([qArea]);
    else setSelectedAreas([]);

    if (qService) setSelectedServices([qService]);
    else setSelectedServices([]);

    if (qSearch) setSearchQuery(qSearch);
    else setSearchQuery('');
  }, [searchParams]);

  // Simulate loading delay on filter toggle
  const triggerLoading = () => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  };

  // Trigger loading when any filter changes
  useEffect(() => {
    triggerLoading();
  }, [selectedAreas, selectedServices, priceRange, minRating, sortBy, searchQuery]);

  // Handle Area toggle
  const handleAreaChange = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  // Handle Service toggle
  const handleServiceChange = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedAreas([]);
    setSelectedServices([]);
    setPriceRange('');
    setMinRating(0);
    setSearchQuery('');
    setSearchParams({});
  };

  // Main filter / sorting logic
  const filteredSalons = useMemo(() => {
    let result = [...salonsData];

    // Filter by text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.services.some(sv => sv.name.toLowerCase().includes(q) || sv.category.toLowerCase().includes(q))
      );
    }

    // Filter by areas
    if (selectedAreas.length > 0) {
      result = result.filter(s => selectedAreas.includes(s.area));
    }

    // Filter by services
    if (selectedServices.length > 0) {
      result = result.filter(s => 
        s.services.some(sv => selectedServices.includes(sv.category))
      );
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter(s => s.rating >= minRating);
    }

    // Filter by starting price
    if (priceRange) {
      result = result.filter(s => {
        const startingPrice = Math.min(...s.services.map(sv => sv.price));
        if (priceRange === 'under-500') return startingPrice < 500;
        if (priceRange === '500-1000') return startingPrice >= 500 && startingPrice <= 1000;
        if (priceRange === '1000-2000') return startingPrice >= 1000 && startingPrice <= 2000;
        if (priceRange === '2000-plus') return startingPrice > 2000;
        return true;
      });
    }

    // Sorting logic
    if (sortBy === 'top-rated') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const pA = Math.min(...a.services.map(sv => sv.price));
        const pB = Math.min(...b.services.map(sv => sv.price));
        return pA - pB;
      });
    } else if (sortBy === 'reviews-high') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return result;
  }, [selectedAreas, selectedServices, priceRange, minRating, sortBy, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Top Banner and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white mb-1">
            Browse Salons
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredSalons.length} results matching your options
          </p>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
          {/* Quick Search */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Refine search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs sm:text-sm focus:outline-none w-full"
            />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-750 px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-750 dark:text-gray-250 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex gap-8 relative items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:flex flex-col gap-6 w-64 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm sticky top-24 max-h-[85vh] overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>Filter Panel</span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-primary hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* Area Checkboxes */}
          <div className="flex flex-col gap-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-200">
              Location Area
            </h4>
            <div className="flex flex-col gap-2.5">
              {areas.map(area => (
                <label key={area} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area)}
                    onChange={() => handleAreaChange(area)}
                    className="accent-primary h-4 w-4 rounded border-gray-350"
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Services Checkboxes */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60">
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-200">
              Services Offered
            </h4>
            <div className="flex flex-col gap-2.5">
              {services.map(srv => (
                <label key={srv} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(srv)}
                    onChange={() => handleServiceChange(srv)}
                    className="accent-primary h-4 w-4 rounded border-gray-350"
                  />
                  <span>{srv}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Starting Price Range */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60">
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-200">
              Starting Price
            </h4>
            <div className="flex flex-col gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
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

          {/* Rating filter */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60">
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-200">
              Minimum Rating
            </h4>
            <div className="flex flex-col gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
        </aside>

        {/* Listings Display Block */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Sorting panel */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm">
            <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer border-none"
            >
              <option value="top-rated">Top Rated (Default)</option>
              <option value="price-low">Lowest Price</option>
              <option value="reviews-high">Most Popular (Reviews)</option>
            </select>
          </div>

          {/* Cards Stack */}
          {loading ? (
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
                    <SalonCard salon={salon} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-750/70 p-12 text-center flex flex-col items-center gap-4 shadow-sm">
              <div className="bg-pink-50 dark:bg-pink-950/20 text-primary p-4 rounded-full">
                <Filter className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">No Salons Found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                Try widening your checkboxes, adjusting the pricing slider, or writing a different search query.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl mt-2 transition-colors focus:outline-none"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Drawer Slide-in filters */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black z-45"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-t-3xl z-50 p-6 flex flex-col gap-6 shadow-2xl border-t border-gray-100 dark:border-gray-750"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-150 dark:border-gray-700">
                <span className="font-extrabold text-lg text-gray-900 dark:text-white">Filters</span>
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Area */}
              <div className="flex flex-col gap-3">
                <h4 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-200">
                  Location Area
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {areas.map(area => (
                    <label key={area} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedAreas.includes(area)}
                        onChange={() => handleAreaChange(area)}
                        className="accent-primary h-4 w-4 rounded"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Service */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-150 dark:border-gray-700">
                <h4 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-200">
                  Services Offered
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {services.map(srv => (
                    <label key={srv} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(srv)}
                        onChange={() => handleServiceChange(srv)}
                        className="accent-primary h-4 w-4 rounded"
                      />
                      <span>{srv}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-150 dark:border-gray-700">
                <h4 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-200">
                  Starting Price
                </h4>
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

              {/* Rating */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gray-150 dark:border-gray-700">
                <h4 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-200">
                  Minimum Rating
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {[
                    { label: 'All Ratings', value: 0 },
                    { label: '4.5+ ★', value: 4.5 },
                    { label: '4.0+ ★', value: 4.0 },
                    { label: '3.0+ ★', value: 3.0 }
                  ].map(item => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ratingFilterMobile"
                        checked={minRating === item.value}
                        onChange={() => setMinRating(item.value)}
                        className="accent-primary h-4 w-4"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-sm font-bold mt-2 focus:outline-none"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
