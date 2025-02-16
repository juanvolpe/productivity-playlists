'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function ScrollToTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const shouldShow = window.scrollY > 0;
      setShowScrollTop(shouldShow);
    };

    // Initial check
    checkScroll();

    // Add scroll listener
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: showScrollTop ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
      onClick={scrollToTop}
      className={`
        fixed bottom-4 right-4 
        bg-white hover:bg-gray-50
        text-gray-600 hover:text-gray-800
        rounded-full
        shadow-sm 
        z-[9999] 
        flex items-center justify-center 
        w-10 h-10
        border border-gray-200
        transition-colors
        ${showScrollTop ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}
      `}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5" 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </motion.button>
  );
} 