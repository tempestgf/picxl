"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiUser,
  FiLogOut,
  FiMoon,
  FiSun,
  FiGrid,
  FiList,
  FiInfo,
  FiSettings,
  FiBarChart2,
  FiHelpCircle
} from "react-icons/fi";

export default function Header({ 
  user, 
  onSignOut, 
  darkMode, 
  toggleDarkMode, 
  viewMode, 
  setViewMode,
  showInfo,
  setShowInfo,
  statsView,
  setStatsView
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // Click outside settings handler
  const handleClickOutsideSettings = (event) => {
    if (settingsRef.current && !settingsRef.current.contains(event.target)) {
      setSettingsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideSettings);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSettings);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg py-4 px-6 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <div className="relative group animate-float">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300"></div>
            <div className="relative rounded-full p-1 bg-white dark:bg-gray-800">
              <img
                src="/logo.svg"
                alt="Logo"
                className="h-10 w-auto dark:invert transition duration-300 transform group-hover:rotate-12"
              />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 tracking-wide text-shadow animate-fade-in">
            PICXL
          </h1>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="flex gap-2">
              <button 
                onClick={() => setStatsView(!statsView)}
                className={`p-2 rounded-md transition-all ${
                  statsView 
                    ? 'bg-red-500 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                title={statsView ? "Ver tickets" : "Ver estadísticas"}
              >
                {statsView ? <FiGrid className="w-5 h-5" /> : <FiBarChart2 className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-md transition-colors ${
                  showInfo 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Información"
              >
                <FiInfo className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform hover:scale-110"
                title={darkMode ? "Modo claro" : "Modo oscuro"}
              >
                {darkMode ? 
                  <FiSun className="w-5 h-5 text-yellow-400" /> : 
                  <FiMoon className="w-5 h-5 text-gray-600" />
                }
              </button>
            </div>
            
            <div className="relative">
              <button 
                ref={settingsRef}
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                title="Configuración"
              >
                <FiSettings className={`w-5 h-5 ${settingsOpen ? 'animate-spin-slow' : ''}`} />
              </button>
              
              {/* Settings dropdown */}
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 animate-slide-down border border-gray-100 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Configuración</p>
                  </div>
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Tema oscuro</span>
                    <button 
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Vista</span>
                    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1 rounded ${
                          viewMode === 'grid'
                            ? 'bg-red-500 text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <FiGrid className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1 rounded ${
                          viewMode === 'list'
                            ? 'bg-red-500 text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <FiList className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                    <button 
                      onClick={onSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiLogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full px-4 py-2 flex items-center space-x-2 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 to-red-400 opacity-70 blur-sm"></div>
                <div className="relative rounded-full p-1 bg-gray-100 dark:bg-gray-800">
                  <FiUser className="w-4 h-4 text-red-500" />
                </div>
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {user.username}
              </span>
              {user.isAdmin && (
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                  Admin
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform hover:scale-110"
              title={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? 
                <FiSun className="w-5 h-5 text-yellow-400" /> : 
                <FiMoon className="w-5 h-5 text-gray-600" />
              }
            </button>
            <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <FiHelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
