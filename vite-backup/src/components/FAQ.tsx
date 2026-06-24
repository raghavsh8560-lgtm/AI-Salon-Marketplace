import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-150 dark:border-gray-700/60 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-gray-800 dark:text-gray-100 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none"
      >
        <span className="text-base sm:text-lg">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 dark:text-gray-500"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pt-2 pb-1 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: 'How do I book an appointment on SalonAI?',
      answer: 'Simply search for your favorite salon, browse their services, select the services you need, and proceed to book. You can choose a date and available timeslot, verify the booking summary, and instantly schedule without any upfront payments!'
    },
    {
      question: 'Can I cancel or reschedule my appointment?',
      answer: 'Yes, absolutely! You can cancel or reschedule any of your upcoming appointments directly from your User Dashboard. Rescheduling allows you to select a new date and time slot instantly, and cancellations are fully free of charge.'
    },
    {
      question: 'Is the pricing transparent, or are there hidden fees?',
      answer: 'Pricing on SalonAI is 100% transparent. The price listed on each salon\'s profile is the exact price you pay at the salon after receiving your services. There are no convenience fees or hidden marketplace charges added during checkout.'
    },
    {
      question: 'How does the AI Beauty Assistant work?',
      answer: 'Our dedicated AI Beauty Assistant parses your natural queries (e.g. "Best bridal makeup under ₹2000 in Malviya Nagar") and matches them directly with our extensive dataset. It displays the matched salons inside the chat with instant booking triggers!'
    },
    {
      question: 'Are the salon ratings and reviews authentic?',
      answer: 'Yes. Only customers who have completed their appointments through SalonAI are eligible to submit reviews and rate the salons. This ensures all comments are genuine and verified experiences.'
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Have questions? We\'ve got answers to help you get the best salon experience.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/60">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};
