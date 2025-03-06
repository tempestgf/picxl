"use client";
import { 
  FiFileText, 
  FiImage, 
  FiZap, 
  FiUploadCloud, 
  FiCheck, 
  FiLoader, 
  FiXCircle, 
  FiMap,
  FiCalendar, 
  FiDollarSign, 
  FiRefreshCw
} from "react-icons/fi";

export default function ProcessingPanel({ 
  imageFile,
  processStatus,
  processingStep,
  progress,
  uploadProgress,
  handleCapture,
  errorDetails,
  clearImage,
  setProcessStatus,
  setErrorDetails
}) {
  const processingSteps = [
    { label: "Preparación", icon: <FiFileText />, step: 0 },
    { label: "OCR", icon: <FiImage />, step: 1 },
    { label: "IA", icon: <FiZap />, step: 2 },
    { label: "Subida", icon: <FiUploadCloud />, step: 3 },
    { label: "Guardar", icon: <FiCheck />, step: 4 },
  ];

  return (
    <div className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center">
            <FiZap className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
          <span>Procesar imagen</span>
        </h3>
        
        {/* Processing steps visualization */}
        {processStatus === "processing" && (
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              {/* Steps indicators */}
              <div className="flex justify-between mt-2">
                {processingSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col items-center ${
                      index <= processingStep ? "opacity-100" : "opacity-40"
                    }`}
                    style={{ 
                      width: `${100 / processingSteps.length}%`,
                      transition: "opacity 300ms ease-in-out"
                    }}
                  >
                    <div 
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 ${
                        index < processingStep 
                          ? "bg-green-500 text-white" 
                          : index === processingStep 
                            ? "bg-blue-600 text-white animate-pulse" 
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {index < processingStep ? (
                        <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                          {step.icon}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs text-center text-gray-600 dark:text-gray-400 max-w-[60px] truncate">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Current processing status */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="font-medium text-blue-700 dark:text-blue-300 text-sm sm:text-base">Procesando...</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{progress}</p>
            </div>
          </div>
        )}
        
        {/* Success message */}
        {processStatus === "success" && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400" />
              </div>
              <span className="font-medium text-green-700 dark:text-green-300 text-sm sm:text-base">¡Completado!</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{progress}</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={clearImage}
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Procesar otro ticket
              </button>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {processStatus === "error" && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <FiXCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400" />
              </div>
              <span className="font-medium text-red-700 dark:text-red-300 text-sm sm:text-base">Error al procesar</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{errorDetails || progress}</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => {setProcessStatus("idle"); setErrorDetails(null);}}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Intentar nuevamente
              </button>
            </div>
          </div>
        )}
        
        {/* Information about extracted data */}
        <div className={`space-y-2 ${processStatus === "processing" || processStatus === "error" ? 'opacity-50 pointer-events-none' : ''}`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            El modelo de IA extraerá automáticamente información como:
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <FiMap className="w-3 h-3 text-red-500 dark:text-red-400" />
              </div>
              Nombre del establecimiento
            </li>
            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <FiCalendar className="w-3 h-3 text-red-500 dark:text-red-400" />
              </div>
              Fecha y hora
            </li>
            <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <FiDollarSign className="w-3 h-3 text-red-500 dark:text-red-400" />
              </div>
              Importe total
            </li>
          </ul>
        </div>
      </div>
      
      {/* Process button */}
      <button
        onClick={handleCapture}
        disabled={!imageFile || processStatus === "processing"}
        className={`w-full flex items-center justify-center gap-3 ${
          !imageFile 
            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400" 
            : processStatus === "processing"
              ? "bg-blue-600 dark:bg-blue-700 cursor-wait animate-pulse"
              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transform hover:-translate-y-1"
        } text-white px-6 py-4 rounded-xl shadow-lg font-medium transition-all duration-300`}
        aria-label="Procesar ticket"
      >
        {processStatus === "processing" ? (
          <>
            <FiLoader className="w-6 h-6 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <FiZap className="w-6 h-6" />
            <span>Procesar ticket</span>
          </>
        )}
      </button>
    </div>
  );
}
