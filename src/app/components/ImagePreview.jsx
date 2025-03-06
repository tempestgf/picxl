"use client";
import { useState } from 'react';
import { FiRotateCw, FiMaximize2, FiTrash2, FiFileText, FiCheck, FiXCircle } from "react-icons/fi";

export default function ImagePreview({
  imagePreview,
  imageFile,
  imageOrientation,
  processStatus,
  clearImage,
  rotateImage,
  isMobile
}) {
  const [showFullPreview, setShowFullPreview] = useState(false);
  
  if (!imagePreview) return null;
  
  return (
    <>
      <div className="w-full">
        {/* Image container */}
        <div className="relative group">
          <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 bg-gray-50 dark:bg-gray-900">
            <img
              src={imagePreview}
              alt="Vista previa del ticket"
              className="w-full max-h-[300px] sm:max-h-[400px] object-contain"
              style={{ transform: `rotate(${imageOrientation}deg)` }}
              onClick={() => setShowFullPreview(true)}
            />
            
            {/* Toolbar optimizado para tacto */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); rotateImage(); }}
                className="p-2.5 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
                title="Rotar imagen"
              >
                <FiRotateCw className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowFullPreview(true); }}
                className="p-2.5 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
                title="Ver a pantalla completa"
              >
                <FiMaximize2 className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); clearImage(); }}
                className="p-2.5 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 transition-colors active:scale-95"
                title="Eliminar imagen"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
            
            {/* Upload success indicator */}
            {processStatus === "upload-success" && (
              <div className="absolute top-2 right-2 bg-green-500 dark:bg-green-600 text-white p-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
                <FiCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Imagen cargada</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2 truncate px-2">
          <FiFileText className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{imageFile?.name || "Imagen capturada"}</span>
        </div>
      </div>
      
      {/* Full-screen image preview modal */}
      {showFullPreview && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowFullPreview(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setShowFullPreview(false)}
              aria-label="Cerrar vista previa"
            >
              <FiXCircle className="w-8 h-8" />
            </button>
            
            <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg shadow-2xl overflow-hidden">
              <img
                src={imagePreview}
                alt="Vista ampliada del ticket"
                className="max-w-full max-h-[80vh] object-contain mx-auto"
                style={{ transform: `rotate(${imageOrientation}deg)` }}
              />
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  rotateImage();
                }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                aria-label="Rotar imagen"
              >
                <FiRotateCw className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                  setShowFullPreview(false);
                }}
                className="bg-white/20 hover:bg-red-600/70 text-white rounded-full p-3 transition-colors"
                aria-label="Eliminar imagen"
              >
                <FiTrash2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
