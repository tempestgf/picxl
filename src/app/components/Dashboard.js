import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import TicketUploader from "./TicketUploader";
import TicketViewer from "./TicketViewer";
import StatsView from "./StatsView";

export default function Dashboard({ 
  user, 
  tickets, 
  statsView, 
  viewMode, 
  onImageClick,
  onDeleteTicket,
  onUploadComplete
}) {
  const [uploadVisible, setUploadVisible] = useState(true);

  // Calculate stats for tickets
  const ticketStats = {
    total: tickets.length,
    individual: tickets.filter(t => t.ticketType === 'individual').length,
    collective: tickets.filter(t => t.ticketType === 'colectivo').length,
    totalAmount: tickets.reduce((sum, t) => {
      let amount = 0;
      if (t.total) {
        if (typeof t.total === 'string') {
          amount = parseFloat(t.total.replace(/[€$,]/g, '')) || 0;
        } else if (typeof t.total === 'number') {
          amount = t.total;
        }
      }
      return sum + amount;
    }, 0).toFixed(2)
  };

  const handleUploadComplete = () => {
    onUploadComplete();
    // Auto-hide uploader after success to focus on results
    setUploadVisible(false);
    // Show it again after a delay with animation
    setTimeout(() => setUploadVisible(true), 500);
  };

  return (
    <div className="space-y-8">
      {/* Stats View */}
      {statsView && <StatsView ticketStats={ticketStats} tickets={tickets} />}
      
      {/* Upload section with animation */}
      {!statsView && (
        <div className={`transition-all duration-500 transform ${uploadVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <TicketUploader onUploadComplete={handleUploadComplete} />
        </div>
      )}
      
      {/* Tickets display section */}
      {!statsView && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FiUpload className="text-red-500" />
              Tickets procesados
              {tickets.length > 0 && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs px-2 py-0.5 rounded-full">
                  {tickets.length}
                </span>
              )}
            </h3>
          </div>
          
          <TicketViewer
            tickets={tickets}
            excelLink="/api/exportExcel"
            onImageClick={onImageClick}
            onDeleteTicket={onDeleteTicket}
            isAdmin={user?.isAdmin}
            viewMode={viewMode}
          />
        </div>
      )}
    </div>
  );
}
