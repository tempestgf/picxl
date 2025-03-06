"use client";

import { useState, useEffect } from 'react';

export const useScroll = (ref) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll event handler
  const handleScroll = () => {
    if (!ref.current) return;
    
    // Show back-to-top button logic
    setShowBackToTop(ref.current.scrollTop > 300);
    
    // Calculate scroll progress percentage
    const scrollHeight = ref.current.scrollHeight - ref.current.clientHeight;
    const scrolled = (ref.current.scrollTop / scrollHeight) * 100;
    setScrollProgress(scrolled);
  };

  // Scroll back to top
  const scrollToTop = () => {
    ref.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, [ref]);

  return {
    showBackToTop,
    scrollProgress,
    scrollToTop
  };
};
