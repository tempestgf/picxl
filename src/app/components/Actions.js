import { FiArrowUp, FiRefreshCw, FiDownload } from "react-icons/fi";

export default function Actions({ showBackToTop, onScrollToTop, onRefresh, refreshing }) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-20">
      {/* Back to top button, only shown when scrolled down */}
      {showBackToTop && (
        <button
          onClick={onScrollToTop}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-transform hover:scale-110 animate-fade-in"
          title="Volver arriba"
        >
          <FiArrowUp className="w-5 h-5" />
        </button>
      )}
      
      {/* Refresh button */}
      <button
        onClick={onRefresh}
        className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-lg transition-transform hover:scale-110 ${
          refreshing ? 'animate-spin-slow' : ''
        }`}
        disabled={refreshing}
        title="Actualizar tickets"
      >
        <FiRefreshCw className="w-5 h-5" />
      </button>
      
      {/* Export button */}
      <a
        href="/api/exportExcel"
        className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-transform hover:scale-110"
        title="Exportar a Excel"
      >
        <FiDownload className="w-5 h-5" />
      </a>
    </div>
  );
}
