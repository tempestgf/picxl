"use client";
import { FiMap, FiCalendar, FiDollarSign, FiFileText, FiCheck } from "react-icons/fi";

export default function ExtractedDataView({ extractedData }) {
  if (!extractedData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 dark:border-gray-700 animate-fade-in">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
        <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/60">
          <FiCheck className="text-green-500 dark:text-green-400 w-4 h-4" />
        </div>
        Información extraída
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
        {/* Data fields optimizados para móvil */}
        <div className="bg-gray-50 dark:bg-gray-900 p-2.5 sm:p-3 rounded-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400">Establecimiento</div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium truncate">
            <FiMap className="text-red-500 dark:text-red-400 flex-shrink-0" />
            <span className="truncate">{extractedData.merchant_name || "No detectado"}</span>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-2.5 sm:p-3 rounded-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400">Fecha y hora</div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
            <FiCalendar className="text-red-500 dark:text-red-400 flex-shrink-0" />
            {extractedData.date_time || "No detectada"}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-2.5 sm:p-3 rounded-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
            <FiDollarSign className="text-green-500 dark:text-green-400 flex-shrink-0" />
            {extractedData.total ? `${extractedData.total}€` : "No detectado"}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-2.5 sm:p-3 rounded-lg">
          <div className="text-xs text-gray-500 dark:text-gray-400">Tipo de ticket</div>
          <div className="flex items-center gap-2 text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">
            <FiFileText className="text-red-500 dark:text-red-400 flex-shrink-0" />
            {extractedData.ticketType === "individual" ? "Individual" : "Colectivo"}
          </div>
        </div>
      </div>
    </div>
  );
}
