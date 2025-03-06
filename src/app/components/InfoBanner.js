export default function InfoBanner({ ticketStats, showInfo, setShowInfo }) {
  if (!showInfo) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700 p-4 text-sm text-blue-800 dark:text-blue-200 relative animate-slide-down shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm">
            <span className="text-blue-500 font-semibold text-lg">{ticketStats.total}</span>
            <span className="text-xs text-blue-700 dark:text-blue-300">Tickets totales</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm">
            <div className="flex gap-2">
              <span className="text-blue-500 font-semibold text-lg">{ticketStats.individual}</span>
              <span className="text-sm text-blue-700 dark:text-blue-300">individuales</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-500 font-semibold text-lg">{ticketStats.collective}</span>
              <span className="text-sm text-blue-700 dark:text-blue-300">colectivos</span>
            </div>
          </div>
          <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm">
            <span className="text-blue-500 font-semibold text-lg">{ticketStats.totalAmount}€</span>
            <span className="text-xs text-blue-700 dark:text-blue-300">Importe total</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowInfo(false)}
          className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
        >
          ×
        </button>
      </div>
    </div>
  );
}
