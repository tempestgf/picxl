"use client";
import { FiCamera, FiUpload, FiAlertCircle } from "react-icons/fi";

export default function UploadArea({
  imagePreview,
  isDragging,
  uploadProgress,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleCapturePhoto,
  handleSelectFile,
  errorDetails,
  isMobile,
  children
}) {
  return (
    <div 
      className={`relative rounded-2xl border-2 ${isDragging 
        ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
        : "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 active:bg-red-200 hover:bg-red-200 dark:hover:bg-gray-750"}
      ${imagePreview ? "h-auto p-2 sm:p-3" : "h-52 sm:h-64 p-4 sm:p-8"} transition-all duration-300 ease-in-out touch-manipulation`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={isMobile && !imagePreview ? handleCapturePhoto : undefined}
    >
      {/* Progress bar */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-700 z-10 overflow-hidden rounded-t-2xl">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {/* Empty state optimizado para móvil */}
      {!imagePreview ? (
        <div className="h-full flex flex-col items-center justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-red-500/10 to-red-600/20 dark:from-red-500/20 dark:to-red-600/30 flex items-center justify-center shadow-inner">
            {isMobile ? (
              <FiCamera className="w-7 h-7 text-red-500 dark:text-red-400" />
            ) : (
              <FiUpload className="w-7 h-7 text-red-500 dark:text-red-400" />
            )}
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-white mb-2 text-center">
            {isMobile ? 'Toca para usar la cámara' : 'Arrastra una imagen o selecciona una opción'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-center max-w-md px-2">
            {isMobile 
              ? 'Asegura que el ticket esté bien iluminado y lo más plano posible' 
              : 'Para mejores resultados, asegúrate que el ticket esté bien iluminado y toda la información sea legible'}
          </p>
          
          {/* Botones adaptados para tacto móvil */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            {!isMobile && (
              <button
                onClick={handleSelectFile}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 