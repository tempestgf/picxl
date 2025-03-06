"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTickets } from "../hooks/useTickets";
import { useScroll } from "../hooks/useScroll";

// Import components
import Header from "../components/Header";
import Footer from "../components/Footer";
import InfoBanner from "../components/InfoBanner";
import StatsView from "../components/StatsView";
import ActionsBar from "../components/ActionsBar";
import TicketsDisplay from "../components/TicketsDisplay";
import LoadingScreen from "../components/LoadingScreen";
import AuthenticationForm from "./components/AuthenticationForm";
import Modal from "./components/Modal";

export default function Home() {
  // Get user and theme from contexts
  const { user, loading: userLoading } = useUser();
  const { darkMode } = useTheme();
  
  // State variables
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showInfo, setShowInfo] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [statsView, setStatsView] = useState(false);
  
  // Refs
  const mainRef = useRef(null);
  
  // Custom hooks
  const { tickets, refreshing, fetchTickets, handleDeleteTicket, getTicketStats } = useTickets();
  const { showBackToTop, scrollProgress, scrollToTop } = useScroll(mainRef);

  // Update the HTML class when darkMode changes
  useEffect(() => {
    // This is an extra check to ensure the theme is correctly applied
    // even if the ThemeContext handling fails somehow
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleUploadComplete = () => {
    fetchTickets();
    // Auto-hide uploader after success to focus on results
    setUploadVisible(false);
    // Show it again after a delay with animation
    setTimeout(() => setUploadVisible(true), 500);
  };

  // Add a small delay to show the app with a nice transition
  useEffect(() => {
    setTimeout(() => setAppReady(true), 300);
  }, []);

  if (userLoading) {
    return <LoadingScreen />;
  }

  // Calculate stats for tickets
  const ticketStats = getTicketStats();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${appReady ? 'opacity-100' : 'opacity-0'} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      {/* Progress bar at the top of the page */}
      <div 
        className="fixed top-0 left-0 z-50 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-600" 
        style={{ width: `${scrollProgress}%`, transition: 'width 0.3s ease-out' }}
      ></div>

      {/* Header */}
      <Header
        statsView={statsView}
        setStatsView={setStatsView}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Info banner - shows additional app info */}
      <InfoBanner 
        showInfo={showInfo && user} 
        setShowInfo={setShowInfo} 
        ticketStats={ticketStats} 
      />

      <main 
        ref={mainRef}
        className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto transition-colors duration-300 bg-gray-50 dark:bg-gray-900"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-7xl mx-auto">
          {!user ? (
            // Authentication form for non-authenticated users
            <div className="flex justify-center items-center min-h-[80vh]">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
                <AuthenticationForm onAuthSuccess={user => window.location.reload()} />
              </div>
            </div>
          ) : (
            // Content for authenticated users
            <div className="space-y-8">
              {/* Stats View */}
              {statsView && <StatsView tickets={tickets} ticketStats={ticketStats} />}
              
              {/* Tickets Display */}
              {!statsView && (
                <TicketsDisplay
                  tickets={tickets}
                  uploadVisible={uploadVisible}
                  onUploadComplete={handleUploadComplete}
                  onDeleteTicket={handleDeleteTicket}
                  onImageClick={(url) => setSelectedImage(url)}
                  isAdmin={user?.isAdmin}
                  viewMode={viewMode}
                  darkMode={darkMode} // Pass down the darkMode state
                />
              )}
              
              {/* Actions bar */}
              <ActionsBar
                fetchTickets={fetchTickets}
                refreshing={refreshing}
                showBackToTop={showBackToTop}
                scrollToTop={scrollToTop}
                darkMode={darkMode} // Pass down the darkMode state
              />
            </div>
          )}
        </div>
      </main>

      {/* Image preview modal */}
      {selectedImage && (
        <Modal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          darkMode={darkMode} // Pass the darkMode state to the modal
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
