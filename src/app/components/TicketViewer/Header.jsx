import { FaTicketAlt, FaEuroSign } from "react-icons/fa";

export function Header({ ticketsCount, totalAmount }) {
  return (
    <div className="relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-red-500 to-red-700 dark:from-red-600 dark:to-red-800 p-3.5 rounded-xl shadow-lg transition-transform duration-300">
            <FaTicketAlt className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
              Visor de <span className="ml-2 text-red-600 dark:text-red-400">Tickets</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 max-w-sm">
              Gestiona tus tickets digitalizados con facilidad
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 animate-float">
            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center">
              <FaTicketAlt className="text-red-500 dark:text-red-400 text-xs" />
            </div>
            <span className="font-semibold">{ticketsCount}</span> tickets
          </div>
          <div className="text-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-green-800 dark:text-green-300 shadow-sm border border-green-100 dark:border-green-900 flex items-center gap-1.5 animate-pulse-soft">
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center">
              <FaEuroSign className="text-green-600 dark:text-green-400 text-xs" />
            </div>
            <span className="font-semibold">{totalAmount}€</span>
          </div>
        </div>
      </div>
    </div>
  );
}
