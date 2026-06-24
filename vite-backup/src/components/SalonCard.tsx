import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, Percent, Navigation } from 'lucide-react';
import type { Salon } from '../data/salons';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

interface SalonCardProps {
  salon: Salon;
}

export const SalonCard: React.FC<SalonCardProps> = ({ salon }) => {
  const { isInWishlist, toggleWishlist } = useApp();
  const isWishlisted = isInWishlist(salon.id);

  // Find starting price
  const startingPrice = salon.services.length > 0 
    ? Math.min(...salon.services.map(s => s.price)) 
    : 0;

  // Extract unique categories for tagging
  const categories = Array.from(new Set(salon.services.map(s => s.category))).slice(0, 3);

  // Calculated distance based on area
  const getDistance = (area: string) => {
    switch (area) {
      case 'C-Scheme': return '0.8 km';
      case 'Raja Park': return '2.1 km';
      case 'Vaishali Nagar': return '4.2 km';
      case 'Malviya Nagar': return '4.9 km';
      case 'Mansarovar': return '5.8 km';
      case 'Jagatpura': return '7.2 km';
      default: return '1.5 km';
    }
  };

  // Pre-configured custom offer lines
  const getOffer = (id: string) => {
    switch (id) {
      case 'salon-1': return 'Free Skin Consultation on Bridal Makeups';
      case 'salon-2': return '10% OFF on Groom Packages';
      case 'salon-3': return 'Hair Spa Special at just ₹499';
      case 'salon-4': return '15% OFF on Global Hair Coloring';
      case 'salon-7': return 'Complimentary Beard Trim with Haircut';
      case 'salon-10': return '20% OFF on Creative Stylist Sessions';
      default: return '10% OFF on select beauty services';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-850 rounded-3xl overflow-hidden border border-pink-100/60 dark:border-gray-800/80 rose-shadow hover:shadow-[0_15px_35px_-5px_rgba(255,94,126,0.15)] transition-all flex flex-col sm:flex-row h-full relative"
    >
      {/* Wishlist Button absolute top right on image */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(salon.id);
        }}
        className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm rounded-full shadow-sm text-gray-400 hover:text-primary transition-colors focus:outline-none"
        aria-label="Save to Wishlist"
      >
        <Heart 
          className={`w-4.5 h-4.5 transition-transform duration-250 ${isWishlisted ? 'text-primary fill-primary scale-110' : ''}`} 
        />
      </button>

      {/* Image Block */}
      <div className="w-full sm:w-48 md:w-56 lg:w-60 h-48 sm:h-auto min-h-[190px] relative overflow-hidden flex-shrink-0">
        <img 
          src={salon.image} 
          alt={salon.name} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {/* Neighborhood Overlay */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-primary dark:text-pink-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-pink-50">
          {salon.area}
        </div>
      </div>

      {/* Content Block */}
      <div className="flex-1 p-5.5 flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          {/* Header Line */}
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-serif font-bold text-gray-950 dark:text-gray-100 text-lg sm:text-xl leading-snug hover:text-primary dark:hover:text-primary transition-colors">
              <Link to={`/salon/${salon.id}`}>{salon.name}</Link>
            </h3>
            <div className="flex items-center gap-0.5 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex-shrink-0">
              <span>{salon.rating}</span>
              <Star className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Rating Summary & Distance Info */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span>({salon.reviewsCount} reviews)</span>
            <span>&bull;</span>
            <span className="flex items-center gap-0.5 text-primary/80 dark:text-pink-400">
              <Navigation className="w-3 h-3 fill-primary/10" />
              {getDistance(salon.area)}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-center gap-1 text-gray-550 dark:text-gray-400 text-xs mt-1">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">{salon.address}</span>
          </div>

          {/* Offer Tagline */}
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50/40 dark:bg-amber-950/20 px-2.5 py-1.5 rounded-xl border border-amber-100/50 dark:border-amber-900/20 w-max mt-2">
            <Percent className="w-3.5 h-3.5 text-amber-500" />
            <span>{getOffer(salon.id)}</span>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {categories.map((cat, idx) => (
              <span 
                key={idx} 
                className="bg-pink-50/50 dark:bg-pink-950/20 text-primary dark:text-pink-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-pink-100/30 dark:border-pink-900/30"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing and Action Block */}
        <div className="flex justify-between items-center pt-3.5 border-t border-gray-100 dark:border-gray-800/80 mt-auto">
          <div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-extrabold">Starting from</div>
            <div className="font-extrabold text-gray-950 dark:text-white text-lg">
              ₹{startingPrice}
            </div>
          </div>
          <Link 
            to={`/salon/${salon.id}`}
            className="bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95 duration-200"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
