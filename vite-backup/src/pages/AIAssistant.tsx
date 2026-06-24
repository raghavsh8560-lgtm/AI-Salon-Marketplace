import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Sparkles, User, HelpCircle, Star, ArrowRight, CornerDownRight } from 'lucide-react';
import { salonsData, type Salon, type Service } from '../data/salons';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  salons?: {
    salon: Salon;
    matchedService?: Service;
  }[];
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested Prompts
  const suggestedPrompts = [
    'Best bridal makeup salon under ₹2000 in Malviya Nagar',
    'Cheapest hair spa near Vaishali Nagar',
    'Best rated salon for facial in C-Scheme',
    'Bridal package recommendations'
  ];

  // Auto-scroll to bottom of chats
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial welcome message and query string handling
  useEffect(() => {
    const welcomeId = 'welcome-1';
    setMessages([
      {
        id: welcomeId,
        sender: 'ai',
        text: 'Hello! I am your SalonAI Beauty Assistant. 🌸 I can help you find, compare, and instantly book the perfect beauty salons in Jaipur.\n\nTell me what you are looking for! You can specify services, budget thresholds, or locations.',
        timestamp: new Date()
      }
    ]);

    const q = searchParams.get('q');
    if (q) {
      setTimeout(() => {
        executeAISearch(q);
      }, 400);
    }
  }, [searchParams]);

  // Client-side Natural Language Parser
  const executeAISearch = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Append user message
    const userMsg: Message = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Trigger Typing state
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsTyping(false);

    // Parsing variables
    const qLower = queryText.toLowerCase();
    
    // 1. Detect category keyword
    let categoryKeyword: string = '';
    if (qLower.includes('bridal') || qLower.includes('makeup') || qLower.includes('wedding')) {
      categoryKeyword = 'Bridal Makeup';
    } else if (qLower.includes('spa') || qLower.includes('massage')) {
      categoryKeyword = 'Hair Spa';
    } else if (qLower.includes('haircut') || qLower.includes('hair cut') || qLower.includes('trim')) {
      categoryKeyword = 'Hair Cut';
    } else if (qLower.includes('facial') || qLower.includes('cleanup') || qLower.includes('face clean')) {
      categoryKeyword = 'Facial';
    } else if (qLower.includes('nail') || qLower.includes('nail art') || qLower.includes('extension')) {
      categoryKeyword = 'Nail Art';
    } else if (qLower.includes('color') || qLower.includes('dye') || qLower.includes('ombre') || qLower.includes('highlight')) {
      categoryKeyword = 'Hair Color';
    } else if (qLower.includes('skin') || qLower.includes('body polish') || qLower.includes('scrub')) {
      categoryKeyword = 'Skin Care';
    } else if (qLower.includes('groom') || qLower.includes('package') || qLower.includes('shave')) {
      categoryKeyword = 'Groom Packages';
    }

    // 2. Detect location area
    const areas = ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Raja Park', 'Jagatpura', 'C-Scheme'];
    let matchedArea = '';
    for (const area of areas) {
      if (qLower.includes(area.toLowerCase())) {
        matchedArea = area;
        break;
      }
    }

    // 3. Detect Price constraint (e.g. "under 2000" or "under Rs 1000")
    let maxPrice = Infinity;
    const priceRegex = /(?:under|below|less than|within|rs\.?|₹)\s*(\d+)/i;
    const match = qLower.match(priceRegex);
    if (match && match[1]) {
      maxPrice = parseInt(match[1], 10);
    }

    // Filter salons dataset
    let matches: { salon: Salon; matchedService?: Service }[] = [];

    salonsData.forEach(salon => {
      // Area match constraint
      if (matchedArea && salon.area !== matchedArea) return;

      // Filter services
      let matchServices = salon.services;
      if (categoryKeyword) {
        matchServices = matchServices.filter(s => s.category === categoryKeyword);
      }

      // Price constraint
      matchServices = matchServices.filter(s => s.price <= maxPrice);

      if (matchServices.length > 0) {
        // Sort matching services by price ascending to find the best candidate
        matchServices.sort((a, b) => a.price - b.price);
        matches.push({
          salon,
          matchedService: matchServices[0]
        });
      }
    });

    // Sort matching results: higher ratings first
    matches.sort((a, b) => b.salon.rating - a.salon.rating);

    // AI answer construction
    let aiText = '';
    let foundSalons: typeof matches = [];

    if (matches.length > 0) {
      foundSalons = matches.slice(0, 4); // limit to 4 results
      aiText = `Based on your request, I found these matching options${matchedArea ? ` in ${matchedArea}` : ''}${maxPrice !== Infinity ? ` under ₹${maxPrice}` : ''}:`;
    } else {
      // Fallback: recommend popular salons
      aiText = `I couldn't find a perfect match matching that exact pricing or service filter. However, here are some of our top-rated salons in Jaipur that you might like:`;
      const fallbackSalons = salonsData.slice(0, 2);
      foundSalons = fallbackSalons.map(s => ({ salon: s, matchedService: s.services[0] }));
    }

    const aiMsg: Message = {
      id: 'ai-' + Math.random().toString(36).substring(2, 9),
      sender: 'ai',
      text: aiText,
      salons: foundSalons,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      executeAISearch(inputVal);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)] flex flex-col gap-5">
      
      {/* Header Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-150/70 dark:border-gray-700/60 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-primary to-pink-500 text-white p-2.5 rounded-xl shadow flex items-center justify-center">
            <Sparkles className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-950 dark:text-white leading-tight">
              AI Beauty Assistant
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Personalized salon suggestions via natural language processing.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages(prev => [prev[0]]); // reset to welcome
            addToast('Chat history cleared', 'info');
          }}
          className="text-xs font-bold text-gray-400 hover:text-primary hover:underline focus:outline-none"
        >
          Reset Chat
        </button>
      </div>

      {/* Main chat window container */}
      <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-150/70 dark:border-gray-700/60 rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Chat bubbles list */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar">
          
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3.5 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                  isAI 
                    ? 'bg-gradient-to-r from-primary to-pink-500 shadow-sm' 
                    : 'bg-gray-450 dark:bg-gray-650'
                }`}>
                  {isAI ? <Sparkles className="w-4.5 h-4.5 fill-white" /> : <User className="w-4 h-4" />}
                </div>

                <div className="flex flex-col gap-3">
                  {/* Bubble body */}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isAI 
                      ? 'bg-pink-50/30 dark:bg-gray-900 border border-pink-100/50 dark:border-gray-805 text-gray-900 dark:text-gray-100' 
                      : 'bg-primary text-white font-medium'
                  }`}>
                    {/* Preserve line breaks */}
                    {msg.text.split('\n').map((para, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{para}</p>
                    ))}
                  </div>

                  {/* Rendered Matched Salon Cards directly inside AI answer bubble */}
                  {isAI && msg.salons && msg.salons.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {msg.salons.map(({ salon, matchedService }) => (
                        <div 
                          key={salon.id}
                          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 shadow-sm flex flex-col gap-3 justify-between hover:shadow transition-shadow"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-extrabold text-gray-950 dark:text-white text-xs sm:text-sm hover:text-primary truncate">
                                <Link to={`/salon/${salon.id}`}>{salon.name}</Link>
                              </h4>
                              <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                                <span>{salon.rating}</span>
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-450 uppercase font-bold">{salon.area}</span>
                          </div>

                          {/* Matched Service pricing */}
                          {matchedService && (
                            <div className="bg-pink-50/40 dark:bg-gray-850 p-2 rounded-lg border border-pink-100/40 dark:border-gray-800 flex flex-col gap-0.5">
                              <span className="text-[10px] text-gray-450 font-bold leading-none">Matched Offer:</span>
                              <div className="flex justify-between items-center text-xs mt-1">
                                <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[120px]">{matchedService.name}</span>
                                <span className="font-extrabold text-primary">₹{matchedService.price}</span>
                              </div>
                            </div>
                          )}

                          {/* Action button */}
                          <Link
                            to={`/booking-flow/${salon.id}`}
                            state={{ selectedServices: matchedService ? [matchedService] : [salon.services[0]] }}
                            className="bg-primary hover:bg-primary-hover text-white text-center py-2 rounded-lg text-xs font-bold transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-1 focus:outline-none"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3.5 self-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center text-white">
                  <Sparkles className="w-4.5 h-4.5 fill-white text-white" />
                </div>
                <div className="bg-pink-50/30 dark:bg-gray-900 border border-pink-100/50 dark:border-gray-805 p-4 rounded-2xl flex items-center gap-1">
                  <span className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt tags */}
        {messages.length === 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-150 dark:border-gray-805 flex flex-col gap-2.5">
            <span className="text-[11px] font-extrabold text-gray-450 uppercase tracking-wide flex items-center gap-1">
              <HelpCircle className="w-4.5 h-4.5 text-primary" /> Suggested Queries:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => executeAISearch(p)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 hover:border-pink-300 dark:border-gray-750 dark:hover:border-pink-900/60 hover:text-primary text-gray-700 dark:text-gray-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm focus:outline-none flex items-center gap-1.5"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-gray-400" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat input box */}
        <form onSubmit={handleSend} className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-150 dark:border-gray-805 flex gap-2.5">
          <input
            type="text"
            placeholder="Search matching salons: e.g. cheapest haircut in C-Scheme..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white p-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center flex-shrink-0 active:scale-95 focus:outline-none"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>

      </div>

    </div>
  );
};
