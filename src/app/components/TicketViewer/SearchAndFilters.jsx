import { FaSearch, FaFilter, FaCalendarAlt, FaSyncAlt } from "react-icons/fa";

export function SearchAndFilters({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showFilters,
  setShowFilters
}) {
  return (
    <div className="relative z-10 flex flex-col space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por ID, empresa, fecha o importe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full py-3.5 pl-11 pr-4 text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            &times;
          </button>
        )}
      </div>
      
      <div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
        >
          <FaFilter className={`transition-transform duration-300 ${showFilters ? 'rotate-180 text-red-500' : ''}`} />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
        
        {showFilters && (
          <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md animate-fade-in space-y-6">
            {/* Filter content */}
            {/* ... Add the rest of the filter content ... */}
          </div>
        )}
      </div>
    </div>
  );
}
