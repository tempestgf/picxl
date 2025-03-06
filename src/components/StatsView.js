"use client";

import { FiBarChart2 } from 'react-icons/fi';

export default function StatsView({ tickets, ticketStats }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
        <FiBarChart2 className="text-red-500" />
        Estadísticas de Tickets
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 rounded-xl p-6 shadow-sm border border-red-100 dark:border-red-900/30 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-red-200 dark:bg-red-700/30 opacity-50"></div>
          <div className="relative">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total de tickets</p>
            <p className="text-4xl font-bold text-red-700 dark:text-red-300 mt-2">{ticketStats.total}</p>
            <p className="mt-4 text-xs text-red-600 dark:text-red-400">
              {ticketStats.total > 0 ? `Último: ${tickets[0]?.processedAt}` : 'No hay tickets'}
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-xl p-6 shadow-sm border border-blue-100 dark:border-blue-900/30 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-200 dark:bg-blue-700/30 opacity-50"></div>
          <div className="relative">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Tipos de ticket</p>
            <div className="flex justify-between items-center mt-2">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{ticketStats.individual}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Individual</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{ticketStats.collective}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Colectivo</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-xl p-6 shadow-sm border border-green-100 dark:border-green-900/30 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-green-200 dark:bg-green-700/30 opacity-50"></div>
          <div className="relative">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total gastado</p>
            <p className="text-4xl font-bold text-green-700 dark:text-green-300 mt-2">{ticketStats.totalAmount}€</p>
            <p className="mt-4 text-xs text-green-600 dark:text-green-400">
              Importe acumulado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
