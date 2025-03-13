"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  FiUser, FiLogOut, FiMoon, FiSun, FiGrid, 
  FiList, FiInfo, FiSettings, FiBarChart2, FiHelpCircle,
  FiMenu, FiX 
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ 
  statsView, 
  setStatsView, 
  setShowInfo,
  showInfo, 
  viewMode, 
  setViewMode 
}) {
  const { user, handleSignOut } = useUser();
  const { darkMode, toggleDarkMode } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const [activeButton, setActiveButton] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Click outside settings handler
  const handleClickOutsideSettings = (event) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target)) {
      setSettingsOpen(false);
    }
  };

  // Click outside mobile menu handler
  const handleClickOutsideMobileMenu = (event) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideSettings);
    document.addEventListener('mousedown', handleClickOutsideMobileMenu);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSettings);
      document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
    };
  }, []);

  // Enhanced theme toggle with visual feedback
  const handleThemeToggle = () => {
    // Button press animation
    setActiveButton('theme');
    setTimeout(() => setActiveButton(null), 300);
    
    toggleDarkMode();
    setMobileMenuOpen(false);
  };

  // Enhanced stats toggle with visual feedback
  const handleStatsToggle = () => {
    setActiveButton('stats');
    setTimeout(() => setActiveButton(null), 300);
    
    setStatsView(!statsView);
    setMobileMenuOpen(false);
  };

  // Enhanced info toggle with visual feedback
  const handleInfoToggle = () => {
    setActiveButton('info');
    setTimeout(() => setActiveButton(null), 300);
    
    setShowInfo(!showInfo);
    setMobileMenuOpen(false);
  };

  // Enhanced settings toggle with visual feedback
  const handleSettingsToggle = () => {
    setActiveButton('settings');
    setTimeout(() => setActiveButton(null), 300);
    
    setSettingsOpen(!settingsOpen);
    setMobileMenuOpen(false);
  };

  // Enhanced sign out with visual feedback
  const handleSignOutClick = () => {
    setActiveButton('signout');
    setTimeout(() => {
      setActiveButton(null);
      handleSignOut();
    }, 300);
    setMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (settingsOpen) setSettingsOpen(false);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md py-3 px-4 sm:py-4 sm:px-5 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo and title */}
        <div className="flex items-center">
          <div className="flex items-center transition-transform hover:scale-105">
            <img
              src="/logo.gif"
              alt="Logo"
              className="h-7 w-auto sm:h-9 dark:invert"
            />
            <h1 className="ml-2 text-xl sm:text-2xl font-bold text-red-600 dark:text-red-500">
              PICXL
            </h1>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          onClick={handleMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
        
        {user ? (
          <>
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Action buttons with improved visual styling */}
              <div className="flex gap-2">
                <button 
                  onClick={handleStatsToggle}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    statsView 
                      ? 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-300 dark:ring-red-700' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  } ${activeButton === 'stats' ? 'transform scale-95' : ''}`}
                  title={statsView ? "Ver tickets" : "Ver estadísticas"}
                  aria-pressed={statsView}
                >
                  {statsView ? <FiGrid className="w-5 h-5" /> : <FiBarChart2 className="w-5 h-5" />}
                </button>
                <button 
                  onClick={handleInfoToggle}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    showInfo 
                      ? 'bg-blue-500 text-white hover:bg-blue-600 ring-2 ring-blue-300 dark:ring-blue-700' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  } ${activeButton === 'info' ? 'transform scale-95' : ''}`}
                  title="Información"
                  aria-pressed={showInfo}
                >
                  <FiInfo className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleThemeToggle} 
                  className={`p-2 rounded-md transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${activeButton === 'theme' ? 'transform scale-95' : ''}`}
                  title={darkMode ? "Modo claro" : "Modo oscuro"}
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  aria-pressed={darkMode}
                >
                  {darkMode ? 
                    <FiSun className="w-5 h-5" /> : 
                    <FiMoon className="w-5 h-5" />
                  }
                </button>
              </div>
              
              {/* Settings dropdown with improved styling */}
              <div className="relative">
                <button 
                  ref={settingsRef}
                  onClick={handleSettingsToggle}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    settingsOpen
                      ? 'bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-300 dark:ring-gray-600' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  } text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    activeButton === 'settings' ? 'transform scale-95' : ''
                  }`}
                  title="Configuración"
                  aria-expanded={settingsOpen}
                >
                  <FiSettings className={`w-5 h-5 ${settingsOpen ? 'rotate-45 transition-transform duration-300' : ''}`} />
                </button>
                
                {settingsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <div className="px-4 py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Configuración</p>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema oscuro</span>
                      <button 
                        onClick={handleThemeToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                          darkMode ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        role="switch"
                        aria-checked={darkMode}
                      >
                        <span 
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                            darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vista</span>
                      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1 shadow-inner">
                        <button 
                          onClick={() => setViewMode('grid')}
                          className={`p-1.5 rounded transition-all duration-150 ${
                            viewMode === 'grid'
                              ? 'bg-red-500 text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          aria-pressed={viewMode === 'grid'}
                        >
                          <FiGrid className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 rounded transition-all duration-150 ${
                            viewMode === 'list'
                              ? 'bg-red-500 text-white shadow-md'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          aria-pressed={viewMode === 'list'}
                        >
                          <FiList className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                      <button 
                        onClick={handleSignOutClick}
                        className={`flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 ${
                          activeButton === 'signout' ? 'bg-red-50 dark:bg-red-900/20' : ''
                        }`}
                      >
                        <FiLogOut className="mr-2.5 h-4 w-4" />
                        <span className="font-medium">Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User info with improved styling */}
              <div className="bg-white dark:bg-gray-800 rounded-md px-4 py-2 flex items-center space-x-2 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow">
                <div className="flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full p-1.5">
                  <FiUser className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {user.username}
                </span>
                {user.isAdmin && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded shadow-sm">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div 
                ref={mobileMenuRef}
                className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg p-4 flex flex-col space-y-3 md:hidden z-50 animate-slide-down"
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={handleStatsToggle}
                    className={`p-2 flex items-center justify-center rounded-md transition-all duration-200 ${
                      statsView 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    } w-full`}
                  >
                    {statsView ? <FiGrid className="w-5 h-5 mr-2" /> : <FiBarChart2 className="w-5 h-5 mr-2" />}
                    <span>{statsView ? "Ver tickets" : "Ver estadísticas"}</span>
                  </button>
                  
                  <button 
                    onClick={handleInfoToggle}
                    className={`p-2 flex items-center justify-center rounded-md transition-all duration-200 ${
                      showInfo 
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    } w-full`}
                  >
                    <FiInfo className="w-5 h-5 mr-2" />
                    <span>Información</span>
                  </button>
                  
                  <button 
                    onClick={handleThemeToggle} 
                    className={`p-2 flex items-center justify-center rounded-md transition-all duration-200 ${
                      darkMode
                        ? 'bg-gray-700 text-yellow-400'
                        : 'bg-gray-100 text-gray-700'
                    } w-full`}
                  >
                    {darkMode ? <FiSun className="w-5 h-5 mr-2" /> : <FiMoon className="w-5 h-5 mr-2" />}
                    <span>{darkMode ? "Modo claro" : "Modo oscuro"}</span>
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Vista</p>
                    <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 rounded-md p-1.5 shadow-inner">
                      <button 
                        onClick={() => handleViewModeChange('grid')}
                        className={`flex-1 p-2 rounded flex items-center justify-center transition-all duration-150 ${
                          viewMode === 'grid'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <FiGrid className="w-4 h-4 mr-2" />
                        <span>Cuadrícula</span>
                      </button>
                      <button 
                        onClick={() => handleViewModeChange('list')}
                        className={`flex-1 p-2 rounded flex items-center justify-center transition-all duration-150 ${
                          viewMode === 'list'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <FiList className="w-4 h-4 mr-2" />
                        <span>Lista</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between px-1 py-3 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full p-1.5">
                        <FiUser className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{user.username}</span>
                      {user.isAdmin && (
                        <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded shadow-sm">
                          Admin
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleSignOutClick}
                      className="text-sm text-red-600 flex items-center"
                    >
                      <FiLogOut className="mr-1 h-4 w-4" />
                      <span>Salir</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Non-authenticated desktop view */}
            <div className="hidden md:flex items-center space-x-3">
              <button 
                onClick={handleThemeToggle} 
                className={`p-2 rounded-md transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${activeButton === 'theme' ? 'transform scale-95' : ''}`}
                title={darkMode ? "Modo claro" : "Modo oscuro"}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? 
                  <FiSun className="w-5 h-5" /> : 
                  <FiMoon className="w-5 h-5" />
                }
              </button>
              <button 
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                <FiHelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Non-authenticated mobile menu */}
            {mobileMenuOpen && (
              <div 
                ref={mobileMenuRef}
                className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg p-4 flex flex-col space-y-3 md:hidden z-50 animate-slide-down"
              >
                <button 
                  onClick={handleThemeToggle} 
                  className={`p-2 flex items-center justify-center rounded-md transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-700 text-yellow-400'
                      : 'bg-gray-100 text-gray-700'
                  } w-full`}
                >
                  {darkMode ? <FiSun className="w-5 h-5 mr-2" /> : <FiMoon className="w-5 h-5 mr-2" />}
                  <span>{darkMode ? "Modo claro" : "Modo oscuro"}</span>
                </button>
                <button 
                  className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-full flex items-center justify-center"
                >
                  <FiHelpCircle className="w-5 h-5 mr-2" />
                  <span>Ayuda</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
