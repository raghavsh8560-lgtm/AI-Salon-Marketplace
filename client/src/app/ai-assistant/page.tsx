'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles, MessageSquare, Plus, Trash2, Send, ChevronRight,
  User, Settings, X, RefreshCw, Star, MapPin, DollarSign,
  HelpCircle, Heart, Bookmark, ArrowRight, ShieldAlert, ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getAuthToken } from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedSalons?: any[];
  recommendedProducts?: any[];
  createdAt?: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

function AIAssistantContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, addToast, updateUserAssessment, wishlist } = useApp();

  const queryParamQ = searchParams.get('q') || '';

  // Active chat session states
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [activeSessionTitle, setActiveSessionTitle] = useState<string>('New Consultation');
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Recommendations sidebars states
  const [liveSalons, setLiveSalons] = useState<any[]>([]);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);

  // Profile Assessment Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Responsive mobile tab
  const [mobileTab, setMobileTab] = useState<'chat' | 'history' | 'marketplace'>('chat');

  // Questionnaire local values
  const [skinType, setSkinType] = useState('Combination');
  const [skinTone, setSkinTone] = useState('Medium');
  const [skinConcerns, setSkinConcerns] = useState('None');
  const [hairType, setHairType] = useState('Normal');
  const [hairLength, setHairLength] = useState('Medium');
  const [hairGoals, setHairGoals] = useState('Hydration');
  const [hairConcerns, setHairConcerns] = useState('None');
  const [budgetRange, setBudgetRange] = useState('MID');
  const [occasion, setOccasion] = useState('Daily Care');
  const [preferences, setPreferences] = useState('None');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea helper
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputQuery]);

  // Sync profile values when user context loads
  useEffect(() => {
    if (user) {
      setSkinType(user.skinType || 'Combination');
      setSkinTone(user.skinTone || 'Medium');
      setSkinConcerns(user.skinConcerns || 'None');
      setHairType(user.hairType || 'Normal');
      setHairLength(user.hairLength || 'Medium');
      setHairGoals(user.hairGoals || 'Hydration');
      setHairConcerns(user.hairConcerns || 'None');
      setBudgetRange(user.budgetRange || 'MID');
      setOccasion(user.occasion || 'Daily Care');
      setPreferences(user.preferences || 'None');
    }
  }, [user]);

  // Scroll to bottom helper disabled to prevent automatic page dragging
  const scrollToBottom = () => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // scrollToBottom();
  }, [messages, streamingText]);

  // Fetch all salons to display user favorites in Left Sidebar
  const { data: allSalons = [] } = useQuery<any[]>({
    queryKey: ['all-salons'],
    queryFn: () => apiFetch('/salons'),
  });

  const favoriteSalonsList = allSalons.filter(s => wishlist.includes(s.id));

  // Fetch chat sessions
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: () => apiFetch('/chat/sessions'),
    enabled: !!user,
  });

  // Load a session and update dynamic sidebars from the last AI response
  const loadSession = async (sessionId: string) => {
    if (!user) return;
    try {
      const data = await apiFetch(`/chat/sessions/${sessionId}`);
      setActiveSessionId(sessionId);
      setActiveSessionTitle(data.title);
      setMessages(data.messages || []);
      setStreamingText('');

      // Extract last AI recommendations
      const aiMsgs = (data.messages || []).filter((m: any) => m.sender === 'ai');
      if (aiMsgs.length > 0) {
        const lastAi = aiMsgs[aiMsgs.length - 1];
        setLiveSalons(lastAi.recommendedSalons || []);
        setLiveProducts(lastAi.recommendedProducts || []);
      } else {
        setLiveSalons([]);
        setLiveProducts([]);
      }
    } catch (err) {
      addToast('Failed to load chat thread.', 'error');
    }
  };

  // Start a new thread
  const startNewChat = () => {
    setActiveSessionId('');
    setActiveSessionTitle('New Consultation');
    setMessages([]);
    setStreamingText('');
    setLiveSalons([]);
    setLiveProducts([]);
  };

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiFetch(`/chat/sessions/${sessionId}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      addToast('Consultation thread deleted.', 'info');
      if (activeSessionId === variables || activeSessionId === '') startNewChat();
    }
  });

  // Process suggestion cards
  useEffect(() => {
    if (queryParamQ && user && messages.length === 0 && !isStreaming) {
      setInputQuery(queryParamQ);
    }
  }, [queryParamQ, user]);

  // Send query streaming handler
  const handleSendMessage = async (queryOverride?: string) => {
    const queryToSend = queryOverride || inputQuery;
    if (!queryToSend.trim()) return;

    if (!user) {
      addToast('Please sign in to begin an AI beauty consultation.', 'warning');
      router.push('/auth?redirect=/ai-assistant');
      return;
    }

    const token = getAuthToken();
    setInputQuery('');

    // Prepend user bubble
    const userMsg: Message = { sender: 'user', text: queryToSend };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingText('');

    try {
      const response = await fetch('https://ai-salon-marketplace.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: queryToSend,
          sessionId: activeSessionId || undefined,
          sessionTitle: activeSessionId ? undefined : queryToSend.slice(0, 30)
        })
      });

      if (!response.ok) {
        throw new Error('Connection to Gemini RAG server failed.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let recommendedSalons: any[] = [];
      let recommendedProducts: any[] = [];

      if (!reader) throw new Error('Stream reader not available.');

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Save the last element because it might be incomplete
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.sessionId && !activeSessionId) {
                setActiveSessionId(data.sessionId);
                setActiveSessionTitle(data.sessionTitle);
                queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
              }

              if (data.chunk) {
                fullText += data.chunk;
                setStreamingText(fullText);
              }

              if (data.recommendedSalons) {
                recommendedSalons = data.recommendedSalons;
              }
              if (data.recommendedProducts) {
                recommendedProducts = data.recommendedProducts;
              }
            } catch (err) {
              // skip parsing errors
            }
          }
        }
      }

      // Process any remaining text in the buffer
      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ')) {
          const dataStr = trimmedLine.slice(6).trim();
          if (dataStr !== '[DONE]') {
            try {
              const data = JSON.parse(dataStr);
              if (data.chunk) {
                fullText += data.chunk;
                setStreamingText(fullText);
              }
              if (data.recommendedSalons) {
                recommendedSalons = data.recommendedSalons;
              }
              if (data.recommendedProducts) {
                recommendedProducts = data.recommendedProducts;
              }
            } catch (err) {
              // ignore
            }
          }
        }
      }

      // Add finalized model message to history
      const modelMsg: Message = {
        sender: 'ai',
        text: fullText,
        recommendedSalons,
        recommendedProducts
      };

      setMessages(prev => [...prev, modelMsg]);
      setStreamingText('');
      setLiveSalons(recommendedSalons);
      setLiveProducts(recommendedProducts);
      setIsStreaming(false);

      // Re-fetch sessions to sync titles
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });

    } catch (err: any) {
      addToast(err.message || 'Error connecting to RAG service.', 'error');
      setIsStreaming(false);
      setStreamingText('');
    }
  };

  // Submit profile settings
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserAssessment({
        skinType,
        skinTone,
        skinConcerns,
        hairType,
        hairLength,
        hairGoals,
        hairConcerns,
        budgetRange,
        occasion,
        preferences,
      });
      setShowProfileModal(false);
      addToast('Personal Care Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to save assessment profile.', 'error');
    }
  };

  // Helper to extract follow up items from message text
  const extractFollowUps = (text: string) => {
    const lines = text.split('\n');
    const bullets = lines.filter(line => line.trim().startsWith('• ') || line.trim().startsWith('•'));
    // Filter followups (must have key suggestions, e.g. Book, Compare, Find, Recommend, or question format)
    const followUps = bullets.filter(b => {
      const lower = b.toLowerCase();
      return lower.includes('compare') || lower.includes('book') || lower.includes('find') || lower.includes('recommend') || lower.includes('routine') || lower.includes('what') || lower.includes('how');
    });
    return followUps.map(b => b.replace(/^[•\s\-\*]+/g, '').trim()).slice(0, 3);
  };

  // Render text content without the follow-up suggestions which will be rendered as interactive pills at the bottom
  const renderCleanMessageContent = (text: string) => {
    const lines = text.split('\n');

    // Filter out ending follow-up lines starting with "• " or similar, so they don't print twice
    const cleanLines = lines.filter(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('• ')) {
        const lower = trimmed.toLowerCase();
        return !(lower.includes('compare') || lower.includes('book') || lower.includes('find') || lower.includes('recommend') || lower.includes('routine') || lower.includes('what') || lower.includes('how'));
      }
      return true;
    });

    return cleanLines.map((line, idx) => {
      if (line.trim() === '') return <div key={idx} className="h-2" />;

      if (line.startsWith('## ') || line.startsWith('### ') || (line.startsWith('**') && line.endsWith('**'))) {
        const cleanHeader = line.replace(/##|###|\*\*/g, '').trim();
        return (
          <h4 key={idx} className="font-serif font-extrabold text-sm sm:text-base text-primary uppercase tracking-wide mt-4 border-b border-pink-100/50 dark:border-gray-800 pb-1.5 w-full">
            {cleanHeader}
          </h4>
        );
      }

      if (line.startsWith('* ') || line.startsWith('- ')) {
        const cleanText = line.slice(2).trim();
        return (
          <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 ml-5 list-disc mt-1.5 leading-relaxed font-medium">
            {parseBoldText(cleanText)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs sm:text-sm text-gray-655 dark:text-gray-305 leading-relaxed mt-2.5 font-medium">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  // Helper to parse double asterisks
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-black text-gray-950 dark:text-white bg-pink-50/50 dark:bg-gray-800 px-1 rounded">{part}</strong>;
      }
      return part;
    });
  };

  // Key stats from live services
  const costEstimate = (() => {
    if (liveSalons.length === 0) return '';
    const prices: number[] = [];
    liveSalons.forEach(s => {
      (s.matchedServices || []).forEach((srv: any) => {
        if (srv.price) prices.push(srv.price);
      });
    });
    if (prices.length === 0) return '';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  })();

  const allProfessionals = (() => {
    const profs: any[] = [];
    const ids = new Set();
    liveSalons.forEach(s => {
      (s.professionals || []).forEach((p: any) => {
        if (!ids.has(p.id)) {
          ids.add(p.id);
          profs.push({ ...p, salonName: s.name });
        }
      });
    });
    return profs;
  })();

  const activeFollowUps = messages.length > 0 && messages[messages.length - 1].sender === 'ai'
    ? extractFollowUps(messages[messages.length - 1].text)
    : [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 min-h-[85vh]">

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-gray-50 dark:bg-gray-900/60 p-1.5 rounded-2xl border border-gray-150 dark:border-gray-800 w-full mb-1 flex-shrink-0 select-none">
        <button
          type="button"
          onClick={() => setMobileTab('history')}
          className={`flex-1 py-2.5 text-center font-bold text-xs rounded-xl transition-all cursor-pointer ${mobileTab === 'history'
            ? 'bg-white dark:bg-gray-800 text-primary shadow-sm border border-gray-100 dark:border-gray-700'
            : 'text-gray-500 dark:text-gray-400'
            }`}
        >
          History
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2.5 text-center font-bold text-xs rounded-xl transition-all cursor-pointer ${mobileTab === 'chat'
            ? 'bg-white dark:bg-gray-800 text-primary shadow-sm border border-gray-100 dark:border-gray-700'
            : 'text-gray-500 dark:text-gray-400'
            }`}
        >
          Consultation
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('marketplace')}
          className={`flex-1 py-2.5 text-center font-bold text-xs rounded-xl transition-all cursor-pointer ${mobileTab === 'marketplace'
            ? 'bg-white dark:bg-gray-800 text-primary shadow-sm border border-gray-100 dark:border-gray-700'
            : 'text-gray-500 dark:text-gray-400'
            }`}
        >
          Marketplace Info
        </button>
      </div>

      {/* COLUMN 1: LEFT SIDEBAR - CHAT HISTORY & PROFILE TRIGGER (Width: 300px) */}
      <aside className={`w-full lg:w-[300px] flex-shrink-0 flex-col gap-5 max-h-[82vh] lg:sticky lg:top-24 ${mobileTab === 'history' ? 'flex' : 'hidden lg:flex'}`}>

        {/* Profile Card & Settings */}
        <div className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl p-4.5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || <User className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <div className="font-extrabold text-sm text-gray-950 dark:text-white truncate">{user?.name || 'Guest User'}</div>
              <div className="text-[10px] text-gray-400 font-medium truncate">{user?.email || 'Demo Profile Mode'}</div>
            </div>
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full bg-pink-50 hover:bg-pink-100 dark:bg-gray-900/60 dark:hover:bg-gray-900 text-primary dark:text-pink-300 border border-pink-100/40 text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-between transition-colors shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Personal Care Profile</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Previous consultations thread history */}
        <div className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl p-5 flex flex-col gap-4 shadow-sm flex-grow overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest pl-1">Consultations</span>
            <button
              onClick={startNewChat}
              className="bg-primary hover:bg-primary-hover text-white p-2 rounded-xl transition-all shadow active:scale-95 cursor-pointer"
              title="New Consultation"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 flex-grow overflow-y-auto pr-1 no-scrollbar min-h-[120px]">
            {isLoadingSessions ? (
              <div className="flex flex-col gap-2 pt-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-9 bg-gray-50 dark:bg-gray-900 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !user ? (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pl-1 pt-2">Sign in to view persistent logs.</p>
            ) : sessions.length === 0 ? (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pl-1 pt-2">No past consultations found.</p>
            ) : (
              sessions.map((s) => {
                const isActive = activeSessionId === s.id;
                return (
                  <div
                    key={s.id}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${isActive
                      ? 'bg-pink-50/30 border-pink-200 text-primary dark:bg-pink-955/25 dark:border-pink-900'
                      : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    onClick={() => loadSession(s.id)}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSessionMutation.mutate(s.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Favorite Salons List */}
        <div className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl p-5 flex flex-col gap-3 shadow-sm max-h-[250px] overflow-y-auto no-scrollbar">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest pl-1">Saved Favorites</span>

          <div className="flex flex-col gap-2">
            {!user ? (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pl-1">Sign in to save salons.</p>
            ) : favoriteSalonsList.length === 0 ? (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pl-1">No favorite salons saved.</p>
            ) : (
              favoriteSalonsList.map((salon) => (
                <a
                  href={`/salon/${salon.id}`}
                  key={salon.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-350 transition-colors"
                >
                  <img
                    src={salon.coverImage}
                    alt={salon.name}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="truncate">
                    <div className="text-gray-900 dark:text-white truncate font-bold leading-tight">{salon.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span>{salon.rating} &bull; {salon.area}</span>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

      </aside>

      {/* COLUMN 2: CENTER PANEL - MAIN AI CONVERSATION AREA */}
      <main className={`flex-1 flex-col bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl shadow-sm max-h-[82vh] overflow-hidden ${mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>

        {/* Chat Area Header */}
        <div className="bg-pink-50/20 dark:bg-gray-900/60 p-4 border-b border-pink-100/40 dark:border-gray-750 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold relative shadow-sm">
              <Sparkles className="w-4.5 h-4.5 fill-pink-100 text-pink-100" />
            </div>
            <div>
              <div className="font-serif font-extrabold text-sm sm:text-base text-gray-950 dark:text-white">Gemini Beauty Consultant</div>
              <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Jaipur Marketplace RAG Active</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] bg-pink-100 dark:bg-pink-950/40 text-primary dark:text-pink-300 border border-pink-200/50 px-2.5 py-1 rounded-full uppercase tracking-widest font-extrabold">
            {activeSessionTitle}
          </span>
        </div>

        {/* Messages list */}
        <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-6 no-scrollbar">

          {/* Welcome and presets when chat is empty */}
          {messages.length === 0 && !streamingText && (
            <div className="my-auto flex flex-col items-center text-center gap-5 py-8 max-w-xl mx-auto">
              <div className="h-14 w-14 bg-pink-50 dark:bg-pink-955/20 text-primary rounded-full flex items-center justify-center border border-pink-100/40">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-xl text-gray-950 dark:text-white">Expert Beauty & Salon Advisory</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Chat with our Gemini-powered specialist to diagnose concerns, receive home care advice, and query real marketplace recommendations from our Jaipur salon database.
                </p>
              </div>

              {/* Suggestions prompt buttons */}
              <div className="flex flex-col gap-2.5 w-full mt-4 text-xs sm:text-sm font-semibold">
                {[
                  { text: 'I have oily skin.', icon: '🧴' },
                  { text: 'My hair is extremely frizzy.', icon: '💇‍♀️' },
                  { text: 'Suggest bridal makeup packages.', icon: '👰' },
                  { text: 'Best treatments for acne scars.', icon: '✨' },
                  { text: 'Recommend salons for keratin treatment.', icon: '💈' }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(preset.text)}
                    className="w-full p-3.5 bg-gray-50 hover:bg-pink-50/20 dark:bg-gray-900 dark:hover:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-2xl text-left text-gray-700 dark:text-gray-300 hover:text-primary transition-all flex items-center justify-between cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span>{preset.icon}</span>
                      <span className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-255">{preset.text}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat bubbles */}
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div key={idx} className={`flex gap-3.5 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>

                {/* Avatar */}
                <div className={`h-8.5 w-8.5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black ${isUser ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-primary text-white shadow-sm'
                  }`}>
                  {isUser ? <User className="w-4.5 h-4.5" /> : 'AI'}
                </div>

                {/* Bubble box */}
                <div className={`p-4 rounded-3xl leading-relaxed ${isUser
                  ? 'bg-primary text-white rounded-tr-none text-xs sm:text-sm'
                  : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-150/70 dark:border-gray-800/80 rounded-tl-none text-gray-800 dark:text-gray-200 text-xs sm:text-sm w-full'
                  }`}>
                  {isUser ? <p className="font-semibold">{m.text}</p> : renderCleanMessageContent(m.text)}
                </div>
              </div>
            );
          })}

          {/* Live streaming text display */}
          {streamingText && (
            <div className="flex gap-3.5 max-w-[85%] self-start animate-fade-in">
              <div className="h-8.5 w-8.5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-sm flex-shrink-0">AI</div>
              <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-150/70 dark:border-gray-800/80 rounded-tl-none text-gray-800 dark:text-gray-200 text-xs sm:text-sm leading-relaxed w-full">
                {renderCleanMessageContent(streamingText)}
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary animate-pulse ml-1" />
              </div>
            </div>
          )}

          {/* Interactive Follow-up suggestion pills */}
          {!isStreaming && activeFollowUps.length > 0 && (
            <div className="flex flex-col gap-2.5 mt-2 pl-12">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Suggested follow-ups</span>
              <div className="flex flex-wrap gap-2">
                {activeFollowUps.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(text)}
                    className="px-3.5 py-2 border border-pink-200 dark:border-pink-900 text-primary dark:text-pink-300 hover:bg-pink-50/30 dark:hover:bg-pink-955/20 text-xs rounded-full font-bold shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Autoexpanding Textarea chat input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/60">
          <div className="flex gap-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-2xl p-2.5 items-end shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask me about skin care, hair care, treatments, or salon recommendations..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isStreaming}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-grow bg-transparent border-none text-xs sm:text-sm focus:outline-none text-gray-800 dark:text-gray-100 disabled:opacity-50 no-scrollbar py-1.5 px-2.5 resize-none max-h-44 font-medium"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isStreaming || !inputQuery.trim()}
              className="bg-primary hover:bg-primary-hover disabled:bg-gray-250 text-white rounded-xl p-2.5 shadow-md flex items-center justify-center aspect-square transition-all active:scale-95 duration-200 cursor-pointer disabled:opacity-40"
            >
              {isStreaming ? (
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>

      </main>

      {/* COLUMN 3: RIGHT SIDEBAR - DYNAMIC RECOMMENDATIONS (Width: 300px) */}
      <aside className={`w-full lg:w-[300px] flex-shrink-0 flex-col gap-5 max-h-[82vh] overflow-y-auto no-scrollbar lg:sticky lg:top-24 ${mobileTab === 'marketplace' ? 'flex' : 'hidden lg:flex'}`}>

        {/* Dynamic header */}
        <div className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-gray-950 dark:text-white font-serif font-extrabold text-sm sm:text-base border-b border-gray-100 dark:border-gray-700 pb-2.5">
            <Sparkles className="w-4.5 h-4.5 text-primary fill-pink-50" />
            <span>Marketplace Context</span>
          </div>

          {/* Dynamic empty state */}
          {liveSalons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-full text-gray-400 border border-gray-100 dark:border-gray-800">
                <HelpCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-gray-750 dark:text-gray-300">No active recommendation context</div>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                  Start typing a beauty concern or salon criteria to query matching spaces, prices, and services live.
                </p>
              </div>
            </div>
          )}

          {/* Cost Estimates card */}
          {liveSalons.length > 0 && costEstimate && (
            <div className="bg-gradient-to-r from-pink-500/5 to-purple-500/5 border border-pink-100/30 p-3.5 rounded-2xl flex flex-col gap-1">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-extrabold">Estimated Treatment Costs</span>
              <div className="text-lg font-black text-primary">{costEstimate}</div>
            </div>
          )}

          {/* Recommended Treatments summary */}
          {liveSalons.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-extrabold">Recommended Treatments</span>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(liveSalons.flatMap(s => (s.matchedServices || []).map((srv: any) => srv.name)))).map((tName: any, idx) => (
                  <span key={idx} className="bg-pink-50/40 border border-pink-100 dark:bg-pink-955/20 dark:border-pink-900 text-primary dark:text-pink-300 text-[10px] font-bold px-2 py-1 rounded-lg">
                    {tName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommended Salons section */}
        {liveSalons.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest pl-1">Matching Salons ({liveSalons.length})</span>

            {liveSalons.map((salon) => (
              <div
                key={salon.id}
                className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl p-4.5 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-serif font-extrabold text-sm text-gray-950 dark:text-white leading-tight">
                      <a href={`/salon/${salon.id}`} className="hover:text-primary transition-colors">{salon.name}</a>
                    </h4>
                    <span className="flex-shrink-0 text-[10px] font-bold bg-pink-50 text-primary dark:bg-pink-955/30 dark:text-pink-300 px-2 py-0.5 rounded-lg border border-pink-100/30">
                      {salon.pricingCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1 font-semibold">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{salon.rating || '4.5'}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{salon.area}</span>
                    </span>
                  </div>
                </div>

                {/* Reasons recommended list */}
                {salon.reasons && salon.reasons.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-150/40 dark:border-gray-800/80 flex flex-col gap-1.5">
                    <span className="text-[9px] text-primary dark:text-pink-300 uppercase tracking-widest font-extrabold">Recommended because:</span>
                    <ul className="flex flex-col gap-1">
                      {salon.reasons.map((r: string, index: number) => (
                        <li key={index} className="text-[10px] text-gray-600 dark:text-gray-350 leading-normal font-semibold flex items-start gap-1">
                          <span className="text-primary flex-shrink-0 mt-0.5">&bull;</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Services/Matched treatments */}
                {salon.matchedServices && salon.matchedServices.length > 0 && (
                  <div className="flex flex-col gap-1.5 border-t border-gray-50 dark:border-gray-700/60 pt-2 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-extrabold block">Bookable Treatments</span>
                    {salon.matchedServices.map((s: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-pink-50/15 p-1.5 rounded-lg border border-pink-50/20 font-medium">
                        <span className="truncate pr-2">{s.name}</span>
                        <span className="text-primary font-bold">₹{s.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <a
                  href={`/salon/${salon.id}`}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-center text-[10px] font-bold py-2 rounded-xl mt-1.5 shadow-sm active:scale-95 transition-all"
                >
                  Book Appointment
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Products section */}
        {liveProducts.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest pl-1">Retrieved Skincare & Haircare ({liveProducts.length})</span>

            {liveProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl p-4 flex gap-3.5 shadow-sm"
              >
                {/* Product Image placeholder / icon */}
                <div className="h-12 w-12 bg-pink-50 dark:bg-gray-900/60 text-primary border border-pink-100/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div className="truncate flex flex-col justify-between py-0.5 flex-grow">
                  <div>
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block leading-none">{prod.brand}</span>
                    <h5 className="text-xs text-gray-950 dark:text-white font-extrabold truncate mt-1 leading-tight">{prod.name}</h5>
                    <p className="text-[9px] text-gray-400 truncate mt-0.5">{prod.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-black text-primary">₹{prod.price}</span>
                    <button
                      onClick={() => addToast(`Saved product ${prod.name} to preferences!`, 'success')}
                      className="text-[9px] font-extrabold text-primary hover:underline"
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Professionals section */}
        {liveSalons.length > 0 && allProfessionals.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest pl-1">Specialist Stylists</span>

            <div className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/60 rounded-3xl p-4 shadow-sm flex flex-col gap-3">
              {allProfessionals.map((prof) => (
                <div key={prof.id} className="flex items-center gap-3 text-xs font-semibold">
                  <img
                    src={prof.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={prof.name}
                    className="w-10 h-10 rounded-full object-cover border border-pink-100/30 flex-shrink-0"
                  />
                  <div className="truncate flex-grow">
                    <div className="text-gray-950 dark:text-white font-bold leading-tight truncate">{prof.name}</div>
                    <div className="text-[10px] text-primary dark:text-pink-300 mt-0.5 truncate">{prof.specialization}</div>
                    <div className="text-[8px] text-gray-400 mt-0.5 truncate">At {prof.salonName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </aside>

      {/* 4. USER PROFILE ASSESSMENT MODAL */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl shadow-2xl relative z-10 border border-pink-100/50 dark:border-gray-800 max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-serif font-extrabold text-lg sm:text-xl text-gray-950 dark:text-white flex items-center gap-1.5">
                  <Settings className="w-5.5 h-5.5 text-primary" />
                  <span>Personal Care Profile</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="bg-gray-50 dark:bg-gray-850 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Questionnaire Form */}
              <form onSubmit={handleSaveAssessment} className="flex flex-col gap-5 text-xs sm:text-sm font-semibold">

                {/* 1. Hair Assessment */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs uppercase tracking-wider font-extrabold text-primary border-l-2 border-primary pl-2">Hair Assessment</h4>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500">Hair Type</label>
                      <select value={hairType} onChange={e => setHairType(e.target.value)} className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-800 dark:text-gray-200">
                        <option value="Normal">Normal</option>
                        <option value="Dry">Dry / Frizzy</option>
                        <option value="Oily">Oily Scalp</option>
                        <option value="Curly">Curly / Coily</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500">Hair Length</label>
                      <select value={hairLength} onChange={e => setHairLength(e.target.value)} className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-800 dark:text-gray-200">
                        <option value="Short">Short</option>
                        <option value="Medium">Medium</option>
                        <option value="Long">Long</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500">Hair Goals</label>
                      <input type="text" value={hairGoals} onChange={e => setHairGoals(e.target.value)} placeholder="Hydration, anti-dandruff..." className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-850 dark:text-gray-200 focus:outline-none focus:border-primary" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500">Hair Concerns</label>
                      <input type="text" value={hairConcerns} onChange={e => setHairConcerns(e.target.value)} placeholder="Hairfall, split ends..." className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-855 dark:text-gray-200 focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                {/* 2. Skin Assessment */}
                <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs uppercase tracking-wider font-extrabold text-primary border-l-2 border-primary pl-2">Skin Assessment</h4>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500">Skin Type</label>
                      <select value={skinType} onChange={e => setSkinType(e.target.value)} className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-800 dark:text-gray-200">
                        <option value="Oily">Oily</option>
                        <option value="Dry">Dry</option>
                        <option value="Combination">Combination</option>
                        <option value="Sensitive">Sensitive</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500">Skin Tone</label>
                      <input type="text" value={skinTone} onChange={e => setSkinTone(e.target.value)} placeholder="Fair, Medium, Dark..." className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-855 dark:text-gray-200 focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-500">Skin Concerns</label>
                    <input type="text" value={skinConcerns} onChange={e => setSkinConcerns(e.target.value)} placeholder="Acne spots, tanning, wrinkles..." className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-855 dark:text-gray-200 focus:outline-none focus:border-primary" />
                  </div>
                </div>

                {/* 3. Lifestyle Assessment */}
                <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs uppercase tracking-wider font-extrabold text-primary border-l-2 border-primary pl-2">Lifestyle</h4>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500">Budget Constraint</label>
                      <select value={budgetRange} onChange={e => setBudgetRange(e.target.value)} className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-800 dark:text-gray-200">
                        <option value="BUDGET">Budget Friendly</option>
                        <option value="MID">Mid Range</option>
                        <option value="LUXURY">Premium / Luxury</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-500">Occasion</label>
                      <input type="text" value={occasion} onChange={e => setOccasion(e.target.value)} placeholder="Bridal makeup, daily checkup..." className="bg-gray-55 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-150 text-xs text-gray-855 dark:text-gray-200 focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2.5 border border-pink-100 text-primary text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow active:scale-95 duration-200 cursor-pointer"
                  >
                    Save Care Settings
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function AIAssistant() {
  return (
    <React.Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-500 font-semibold text-sm">Loading AI assistant...</p>
      </div>
    }>
      <AIAssistantContent />
    </React.Suspense>
  );
}
