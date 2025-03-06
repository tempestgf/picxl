'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize with user's preference or from localStorage if available
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
      // Use saved preference if available
      setDarkMode(savedTheme === 'true');
    } else {
      // Otherwise, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Add transition class for smoother theme changes
    const handleThemeChange = () => {
      document.documentElement.classList.add('transition');
      
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Remove transition class after animation completes
      window.setTimeout(() => {
        document.documentElement.classList.remove('transition');
      }, 300);
      
      // Save preference to localStorage
      localStorage.setItem('darkMode', darkMode);
    };
    
    // Use requestAnimationFrame for smoother transitions
    window.requestAnimationFrame(handleThemeChange);
  }, [darkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
