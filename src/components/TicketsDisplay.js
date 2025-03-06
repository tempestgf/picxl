"use client";

import { FiUpload } from 'react-icons/fi';
import TicketUploader from '../app/components/TicketUploader';
import TicketViewer from '../app/components/TicketViewer';

export default function TicketsDisplay({
  tickets,
  uploadVisible,
  onUploadComplete,
  onDeleteTicket,
  onImageClick,
  isAdmin,
  viewMode,
}) {
  return (
    <>
      {/* Upload section with animation */}
      <div className={`transition-all duration-500 transform ${uploadVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <TicketUploader onUploadComplete={onUploadComplete} />
      </div>
      
      {/* Tickets display section */}
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
          isAdmin={isAdmin}
          viewMode={viewMode}
        />
      </div>
    </>
  );
}
