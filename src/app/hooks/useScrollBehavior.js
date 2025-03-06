"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollBehavior() {
  const mainRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll event handler
  const handleScroll = () => {
    if (!mainRef.current) return;
    
    // Show back-to-top button logic
    setShowBackToTop(mainRef.current.scrollTop > 300);
    
    // Calculate scroll progress percentage
    const scrollHeight = mainRef.current.scrollHeight - mainRef.current.clientHeight;
    const scrolled = (mainRef.current.scrollTop / scrollHeight) * 100;
    setScrollProgress(scrolled);
  };

  // Scroll back to top
  const scrollToTop = () => {
    mainRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Add event listener for scroll
  useEffect(() => {
    const currentMain = mainRef.current;
    if (currentMain) {
      currentMain.addEventListener('scroll', handleScroll);
      return () => currentMain.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return {
    mainRef,
    showBackToTop,
    scrollProgress,
    scrollToTop
  };
}
