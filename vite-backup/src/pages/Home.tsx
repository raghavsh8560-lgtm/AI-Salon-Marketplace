import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Star, MapPin, Sparkle, Percent, Check } from 'lucide-react';
import { salonsData } from '../data/salons';
import { SalonCard } from '../components/SalonCard';
import { FAQSection } from '../components/FAQ';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();
  
  // Search state
  const [selectedArea, setSelectedArea] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ type: 'salon' | 'area' | 'service'; text: string }[]>([]);

  // Sample areas & services lists
  const areas = ['C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Raja Park', 'Mansarovar', 'Jagatpura'];
  const services = ['Bridal Makeup', 'Hair Spa', 'Hair Cut', 'Facial', 'Nail Art', 'Hair Color', 'Skin Care', 'Groom Packages'];

  // Categories list with backgrounds & tags
  const popularServices = [
    { name: 'Bridal Makeup', image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=150&auto=format&fit=crop&q=80', count: '12 Salons' },
    { name: 'Hair Spa', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80', count: '18 Salons' },
    { name: 'Hair Cut', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=80', count: '20 Salons' },
    { name: 'Facial', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=150&auto=format&fit=crop&q=80', count: '15 Salons' },
    { name: 'Nail Art', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&auto=format&fit=crop&q=80', count: '9 Salons' },
    { name: 'Hair Color', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=150&auto=format&fit=crop&q=80', count: '14 Salons' }
  ];

  // Pre-configured Trending Packages
  const trendingPackages = [
    {
      id: 'pkg-1',
      salonId: 'salon-1',
      salonName: 'La Belleza Salon & Spa',
      name: 'Bridal Glow Radiance Deluxe',
      services: [
        { name: 'Luxury Bridal Makeup & Styling', price: 8500 },
        { name: 'Hydra Facial Brightening Cure', price: 3499 },
        { name: 'Gel Extensions with Hand-painted Nail Art', price: 1799 }
      ],
      price: 9999,
      originalPrice: 13798,
      savings: '₹3,799 Savings',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'pkg-2',
      salonId: 'salon-3',
      salonName: 'The Pink City Salon',
      name: 'Weekend Stress Buster Ritual',
      services: [
        { name: 'Nourishing Herbal Hair Spa', price: 699 },
        { name: 'Fruit Glow Facial & Cleanup', price: 599 },
        { name: 'Basic Haircut & Trimming', price: 299 }
      ],
      price: 1199,
      originalPrice: 1597,
      savings: '25% OFF',
      image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'pkg-3',
      salonId: 'salon-2',
      salonName: 'Aura Unisex Salon',
      name: 'Groom Premium Makeover Duo',
      services: [
        { name: 'Ultimate Groom Premium Package', price: 3999 },
        { name: 'Keratin Nourishing Hair Spa', price: 1499 }
      ],
      price: 3899,
      originalPrice: 5498,
      savings: '₹1,599 Savings',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&auto=format&fit=crop&q=80'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "The booking process was seamless, and the styling was top-tier. Highly recommend La Belleza!",
      name: "Sujata Meena",
      role: "Bridal Client",
      rating: 5,
      area: "Malviya Nagar",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
    },
    {
      quote: "Found an amazing budget package at The Pink City Salon. Best hair spa and facial experience under 1500.",
      name: "Ridhi Sen",
      role: "Self-Care Enthusiast",
      rating: 5,
      area: "Vaishali Nagar",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    {
      quote: "The AI beauty assistant parsed my queries perfectly. Found a haircut slot near C-scheme in seconds.",
      name: "Vikram Goel",
      role: "Grooming Client",
      rating: 5,
      area: "C-Scheme",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    }
  ];

  // Get top rated (featured) salons
  const featuredSalons = salonsData
    .filter(s => s.featured)
    .slice(0, 3);

  // Generate suggestions based on query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const tempSuggestions: typeof suggestions = [];

    // Match salon names
    salonsData.forEach(s => {
      if (s.name.toLowerCase().includes(q)) {
        tempSuggestions.push({ type: 'salon', text: s.name });
      }
    });

    // Match services
    services.forEach(service => {
      if (service.toLowerCase().includes(q) && !tempSuggestions.some(s => s.text === service)) {
        tempSuggestions.push({ type: 'service', text: service });
      }
    });

    setSuggestions(tempSuggestions.slice(0, 5));
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = '/browse?';
    if (selectedArea) {
      url += `area=${encodeURIComponent(selectedArea)}&`;
    }
    if (searchQuery.trim()) {
      url += `search=${encodeURIComponent(searchQuery)}`;
    }
    navigate(url);
  };

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    if (suggestion.type === 'salon') {
      const matched = salonsData.find(s => s.name === suggestion.text);
      if (matched) navigate(`/salon/${matched.id}`);
    } else if (suggestion.type === 'service') {
      navigate(`/browse?service=${encodeURIComponent(suggestion.text)}`);
    }
  };

  const handlePackageBook = (pkg: typeof trendingPackages[0]) => {
    navigate(`/booking-flow/${pkg.salonId}`, {
      state: { selectedServices: pkg.services }
    });
    addToast(`Preloaded ${pkg.name} package into checkout!`, 'success');
  };

  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-20 bg-brand-bg transition-colors">
      
      {/* Hero Redesign Section */}
      <div className="relative bg-gradient-to-b from-pink-50/70 via-white to-pink-50/20 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 border-b border-pink-100/30 dark:border-gray-800/40 overflow-hidden py-16 sm:py-20 lg:py-24">
        
        {/* Soft Background circles */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-24 -ml-24 w-[500px] h-[500px] bg-purple-100/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text Column */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/20 text-primary dark:text-pink-300 px-4 py-1.5 rounded-full text-xs font-bold border border-pink-100/50 dark:border-pink-900/30 w-max"
            >
              <Sparkle className="w-3.5 h-3.5 fill-primary text-primary" />
              <span>Jaipur\'s Premium Self-Care Directory</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold text-gray-950 dark:text-white leading-[1.1] tracking-tight"
            >
              Find Your Perfect <br />
              <span className="bg-gradient-to-r from-primary via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Beauty Experience
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-sm sm:text-base md:text-lg text-gray-650 dark:text-gray-400 max-w-xl leading-relaxed"
            >
              Discover and book Jaipur\'s finest makeup artists, hair designers, organic skin clinics, and wellness packages instantly.
            </motion.p>

            {/* Unified Location & Service Pill Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="w-full max-w-2xl mt-4 relative"
            >
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 p-2.5 rounded-3xl sm:rounded-full border border-pink-100/60 dark:border-gray-700 shadow-md relative">
                
                {/* Location Select Area */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 min-w-[130px]">
                  <MapPin className="w-4.5 h-4.5 text-primary" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer border-none w-full"
                  >
                    <option value="">All Areas</option>
                    {areas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* Service Input Area */}
                <div className="flex-grow flex items-center px-4 py-2 gap-2">
                  <Search className="w-4.5 h-4.5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search hair cut, facial, bridal art..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                    className="w-full bg-transparent border-none text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none font-medium"
                  />
                </div>

                {/* Main Action CTA Button */}
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm px-6.5 py-3.5 rounded-2xl sm:rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 duration-200"
                >
                  Search Salons
                </button>
              </form>

              {/* suggestions list */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden text-left z-20"
                  >
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(sug)}
                        className="w-full px-5 py-3 hover:bg-pink-50/30 dark:hover:bg-gray-700/50 flex items-center justify-between border-b border-gray-50 dark:border-gray-700/50 last:border-none text-xs sm:text-sm font-semibold transition-colors focus:outline-none"
                      >
                        <span className="text-gray-800 dark:text-gray-200">{sug.text}</span>
                        <span className="text-[10px] uppercase font-extrabold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded border border-pink-100/30">
                          {sug.type}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* AI Assistant suggestion bar directly below search pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="flex items-center flex-wrap gap-2 text-xs bg-white/60 dark:bg-gray-900/60 p-2.5 rounded-2xl border border-pink-50 dark:border-gray-800/80 shadow-sm"
            >
              <span className="flex items-center gap-1 font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5" /> Ask AI:
              </span>
              <button
                onClick={() => navigate('/ai-assistant?q=Best bridal makeup under ₹2000 in Malviya Nagar')}
                className="text-gray-655 dark:text-gray-350 hover:text-primary transition-colors text-left"
              >
                "Best bridal makeup under ₹2000 in Malviya Nagar" &rarr;
              </button>
            </motion.div>

            {/* Trust metrics columns above folds */}
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 mt-6 w-full max-w-xl text-center">
              {[
                { label: 'Rating in Jaipur', val: '4.8 ★' },
                { label: 'Certified Artists', val: '100%' },
                { label: 'Partner Salons', val: '20+' }
              ].map((m, idx) => (
                <div key={idx} className="bg-white/80 dark:bg-gray-900/80 p-3 sm:p-4.5 rounded-2xl border border-pink-100/40 dark:border-gray-800 shadow-sm flex flex-col gap-0.5 sm:gap-1">
                  <div className="font-extrabold text-lg sm:text-2xl text-primary font-serif">{m.val}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">{m.label}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Hero Image Column (Pinterest Grid) */}
          <div className="hidden lg:col-span-5 lg:grid grid-cols-2 gap-4 relative">
            
            {/* Visual flower leaf accent */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-pink-100 rounded-full blur-xl opacity-80" />
            
            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="h-56 rounded-3xl overflow-hidden border-2 border-white shadow-md"
              >
                <img 
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80" 
                  alt="Spa Experience" 
                  className="w-full h-full object-cover" 
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-72 rounded-3xl overflow-hidden border-2 border-white shadow-md"
              >
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80" 
                  alt="Styling session" 
                  className="w-full h-full object-cover" 
                />
              </motion.div>
            </div>
            
            <div className="flex flex-col gap-4 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="h-72 rounded-3xl overflow-hidden border-2 border-white shadow-md"
              >
                <img 
                  src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&auto=format&fit=crop&q=80" 
                  alt="Makeup Artistry" 
                  className="w-full h-full object-cover" 
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="h-56 rounded-3xl overflow-hidden border-2 border-white shadow-md"
              >
                <img 
                  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&auto=format&fit=crop&q=80" 
                  alt="Nail Art Lounge" 
                  className="w-full h-full object-cover" 
                />
              </motion.div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-20 sm:gap-28">
        
        {/* Popular Services categories Section */}
        <section className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-950 dark:text-white">
              Explore Popular Services
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-2 max-w-md mx-auto">
              Choose from customized treatments curated for your self-care routines.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 justify-center">
            {popularServices.map((cat, idx) => (
              <Link
                key={idx}
                to={`/browse?service=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-3 text-center focus:outline-none"
              >
                {/* Circular image avatar */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-3 border-white dark:border-gray-800 shadow-md group-hover:scale-105 group-hover:border-primary transition-all duration-300">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-pink-500/5 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm text-gray-900 dark:text-gray-200 group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                    {cat.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Salons Section */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-950 dark:text-white">
                Featured Beauty Spaces
              </h2>
              <p className="text-gray-550 dark:text-gray-400 text-sm mt-1">
                Highly recommended wellness spaces in prime locations.
              </p>
            </div>
            <Link 
              to="/browse"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              <span>Explore Jaipur Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredSalons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        </section>

        {/* Trending Packages Section */}
        <section className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-950 dark:text-white">
              Trending Beauty Packages
            </h2>
            <p className="text-gray-550 dark:text-gray-400 text-sm mt-2 max-w-md mx-auto">
              Pre-curated service combos designed to save time and give maximum results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingPackages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-pink-100/60 dark:border-gray-800/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 w-full relative">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 fill-white" />
                      <span>{pkg.savings}</span>
                    </div>
                  </div>
                  <div className="p-5.5 flex flex-col gap-3">
                    <div>
                      <div className="text-[10px] text-primary dark:text-pink-300 font-extrabold uppercase tracking-wide">{pkg.salonName}</div>
                      <h4 className="font-serif font-extrabold text-lg text-gray-900 dark:text-white mt-1 leading-snug">{pkg.name}</h4>
                    </div>
                    
                    {/* Services list in package */}
                    <div className="flex flex-col gap-1.5 mt-2 border-t border-gray-50 dark:border-gray-700/60 pt-3">
                      {pkg.services.map((s, idx) => (
                        <div key={idx} className="flex gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5.5 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-50 dark:border-gray-750 flex items-center justify-between rounded-b-3xl">
                  <div>
                    <span className="text-[10px] text-gray-400 line-through block leading-none">₹{pkg.originalPrice}</span>
                    <span className="text-xl font-black text-gray-950 dark:text-white">₹{pkg.price}</span>
                  </div>
                  <button
                    onClick={() => handlePackageBook(pkg)}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 duration-200"
                  >
                    Instantly Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Beauty Assistant Section Redesign */}
        <section className="bg-gradient-to-br from-pink-500/5 to-purple-500/10 dark:from-pink-900/10 dark:to-purple-950/15 rounded-3xl p-8 sm:p-12 border border-pink-100/50 dark:border-gray-800/80 grid grid-cols-1 md:grid-cols-12 gap-8 items-center rose-shadow">
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className="bg-white/80 dark:bg-gray-900 p-2 rounded-2xl flex items-center justify-center border border-pink-100 shadow-sm w-max">
              <Sparkles className="w-5 h-5 text-primary fill-pink-100 dark:fill-pink-900" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-gray-950 dark:text-white leading-tight">
              Personalized Consultation, <br />
              Powered by AI
            </h2>
            <p className="text-gray-650 dark:text-gray-400 text-sm max-w-md leading-relaxed font-semibold">
              Ask our virtual helper for tailored salon recommendations based on budget levels, special makeup packages, or locations.
            </p>
            <Link
              to="/ai-assistant"
              className="bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95 duration-200 flex items-center gap-1.5 focus:outline-none"
            >
              <span>Consult AI Assistant</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>

          {/* AI Chat Bubble Graphic Column */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Mock Chat bubbles */}
            <div className="bg-white/70 dark:bg-gray-900/80 backdrop-blur-sm p-4.5 rounded-2xl border border-pink-50 dark:border-gray-800 shadow-sm text-xs font-semibold text-gray-750 dark:text-gray-250 flex flex-col gap-3">
              <div className="flex gap-2 items-start self-start">
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">AI</div>
                <div className="bg-pink-50/50 dark:bg-gray-850 p-2.5 rounded-2xl border border-pink-100/35">
                  How can I help you sparkle today? ✨
                </div>
              </div>
              <div className="flex gap-2 items-start self-end flex-row-reverse">
                <div className="h-6 w-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-[10px] font-black">Me</div>
                <div className="bg-primary text-white p-2.5 rounded-2xl">
                  Best rated bridal studio under ₹2000 in Malviya Nagar
                </div>
              </div>
              <div className="flex gap-2 items-start self-start border-t border-gray-50 dark:border-gray-800 pt-2">
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">AI</div>
                <div className="bg-pink-50/50 dark:bg-gray-850 p-2.5 rounded-2xl border border-pink-100/35">
                  Checking catalogs... 🌸 I recommend **The Pink City Salon** in Malviya Nagar (₹1,899, rated 4.5 ★).
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="flex flex-col gap-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-950 dark:text-white">
              How It Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Book your self-care slot in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative">
            
            {/* Visual Guidelines layout background for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-pink-100 dark:bg-gray-800 pointer-events-none z-0" />

            {[
              { step: '1', title: 'Explore & Search', desc: 'Browse our directory filter options by area, rating, price thresholds, or beauty service category.' },
              { step: '2', title: 'Customize Package', desc: 'Select individual menu items or choose from trending packages matching your beauty budget.' },
              { step: '3', title: 'Secure Instant Booking', desc: 'Choose a target date and hourly timeslot. No prepayments: check out and pay directly at the counter.' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4 relative z-10 p-4">
                <div className="h-14 w-14 rounded-full bg-primary text-white font-serif font-extrabold text-xl flex items-center justify-center shadow-md border-4 border-white dark:border-gray-800">
                  {item.step}
                </div>
                <h4 className="font-serif font-extrabold text-lg text-gray-900 dark:text-white">{item.title}</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[260px]">{item.desc}</p>
              </div>
            ))}

          </div>
        </section>

        {/* Customer Testimonials Section */}
        <section className="flex flex-col gap-8 bg-pink-50/10 dark:bg-gray-900/10 rounded-3xl p-8 sm:p-12 border border-pink-100/30 dark:border-gray-800/40">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-950 dark:text-white">
              Loved by Jaipur\'s Clients
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Real reviews from verified completed client appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            {testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/40 dark:border-gray-700/60 shadow-sm flex flex-col justify-between gap-5"
              >
                <div className="flex flex-col gap-3">
                  {/* Rating Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-655 dark:text-gray-350 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-50 dark:border-gray-700/60">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="font-extrabold text-xs text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">{t.role} &bull; {t.area}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Accordion */}
        <FAQSection />

      </div>

    </div>
  );
};
