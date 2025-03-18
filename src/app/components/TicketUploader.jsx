"use client";
import { useState, useRef, useEffect } from "react";
import {
  FiUpload,
  FiCamera,
  FiCheck,
  FiLoader,
  FiFileText,
  FiXCircle,
  FiTrash2,
  FiInfo,
  FiAlertCircle,
  FiImage,
  FiClock,
  FiDollarSign,
  FiMap,
  FiCalendar,
  FiRotateCw,
  FiCrop,
  FiDownload,
  FiMaximize2,
  FiSmartphone,
  FiUploadCloud,
  FiZap,
  FiRefreshCw,
  FiChevronsDown,
  FiMinus,
  FiPlusCircle,
} from "react-icons/fi";

const GOOGLE_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// Función para convertir el formato "HH:mm dd/mm/yy" o "HH:mm dd/mm/yyyy" a un objeto Date válido
function parseCustomDate(dateStr) {
  console.log("parseCustomDate recibe:", dateStr);
  const regex = /(\d{1,2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
  const match = dateStr.match(regex);
  if (match) {
    let [ , hour, minute, day, month, year ] = match;
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);
    day = parseInt(day, 10);
    month = parseInt(month, 10) - 1;
    year = parseInt(year, 10);
    if (year < 100) {
      year += 2000;
    }
    return new Date(year, month, day, hour, minute);
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed)) {
    return parsed;
  }
  return new Date();
}

// Función para formatear un objeto Date al formato "DD-MM-YY HH:mm"
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export default function TicketUploader({ onUploadComplete }) {
  const [progress, setProgress] = useState("");
  const [processStatus, setProcessStatus] = useState("idle"); // "idle", "processing", "success", "error"
  const [ocrText, setOcrText] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ticketType, setTicketType] = useState("individual");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0); // Track the step of processing
  const [errorDetails, setErrorDetails] = useState(null);
  const [imageOrientation, setImageOrientation] = useState(0);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [mobileOrientation, setMobileOrientation] = useState('portrait');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const uploadAreaRef = useRef(null);

  // Check for mobile devices and orientation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setMobileOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      };
      
      checkMobile();
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setIsDarkMode(e.matches);
      
      window.addEventListener('resize', checkMobile);
      darkModeMediaQuery.addEventListener('change', handleChange);
      
      return () => {
        window.removeEventListener('resize', checkMobile);
        darkModeMediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  // Reset error state when a new file is loaded
  useEffect(() => {
    if (imageFile) {
      setErrorDetails(null);
      setProcessStatus("idle");
    }
  }, [imageFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorDetails("El archivo seleccionado no es una imagen. Por favor selecciona un archivo JPEG, PNG o HEIC.");
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadProgress(100); // Complete the upload progress animation
      
      // Show a quick success message for the upload
      setProcessStatus("upload-success");
      setTimeout(() => {
        if (processStatus === "upload-success") {
          setProcessStatus("idle");
        }
      }, 1500);

      // For mobile devices, automatically handle EXIF orientation
      if (isMobile && file) {
        handleImageOrientation(file);
      }
    }
  };

  // Función para corregir automáticamente la orientación de imágenes EXIF en móviles
  const handleImageOrientation = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crear un canvas para manipular la imagen si es necesario
        const canvas = document.createElement('canvas');
        
        // En dispositivos móviles, determinar si la imagen necesita rotación
        // basada en dimensiones (método simple)
        if (img.width < img.height) {
          // Imagen en vertical, probablemente correcta
          setImageOrientation(0);
        } else {
          // Imagen en horizontal, podría necesitar rotación en algunos dispositivos
          // Solo sugerimos rotación si estamos en modo retrato del dispositivo
          if (mobileOrientation === 'portrait') {
            setImageOrientation(90);
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleCapturePhoto = () => {
    cameraInputRef.current?.click();
  };

  const performGoogleOCR = async (file) => {
    setProcessingStep(1); // OCR processing step
    
    // Simulate progress
    let progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 30) clearInterval(progressInterval);
        return Math.min(30, prev + 1);
      });
    }, 50);
    
    try {
      // ...existing OCR code...
      
      // For simulation, let's assume OCR takes some time
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUploadProgress(40);
      clearInterval(progressInterval);
      
      // Actual OCR logic (using your existing code)
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
      
      const base64Image = dataUrl.split(",")[1];
      const payload = {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "TEXT_DETECTION", maxResults: 1 }],
          },
        ],
      };
      
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      
      const result = await response.json();
      if (!response.ok)
        throw new Error("Error en OCR: " + JSON.stringify(result));
      
      const textAnnotations = result.responses?.[0]?.textAnnotations;
      if (!textAnnotations || textAnnotations.length === 0)
        throw new Error("No se detectó texto en la imagen. Intenta con una foto más clara.");
      
      return textAnnotations[0].description;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  const callGeminiAPI = async (ocrText) => {
    const prompt = `
Ets un assistent que extreu camps de rebuts.
Et donaré el text OCR d'un rebut entre tres guions, i has de retornar EXCLUSIVAMENT un JSON amb aquests camps:
merchant_name, address, date_time, subtotal, tip, total.
**IMPORTANT:** El camp date_time DEUREÀ ESTAR en el format "HH:mm dd/mm/yy" (o "HH:mm dd/mm/yyyy").
Si algun camp no existeix, deixa'l en blanc.
Sempre agafa els valors de total en decimal.
Si no existeix total en el ocr agafa el valor que hi hagi normalment amb un simbol de euro €"
---
${ocrText}
---
    `.trim();
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();
    if (!response.ok)
      throw new Error("Error en Gemini: " + JSON.stringify(result));
    return result;
  };

  const extractDataFromGemini = (geminiResponse) => {
    try {
      const candidates = geminiResponse.candidates;
      if (candidates && candidates.length > 0) {
        let candidateText = candidates[0].content?.parts?.[0]?.text || "";
        candidateText = candidateText.trim();
        if (candidateText.startsWith("```json"))
          candidateText = candidateText.replace("```json", "").trim();
        if (candidateText.endsWith("```"))
          candidateText = candidateText.replace("```", "").trim();
        const start = candidateText.indexOf("{");
        const end = candidateText.lastIndexOf("}") + 1;
        if (start === -1 || end <= start) {
          console.error("No se encontró bloque JSON en la respuesta de Gemini.");
          return {};
        }
        return JSON.parse(candidateText.substring(start, end));
      }
      return {};
    } catch (error) {
      console.error("Error parseando JSON de Gemini", error);
      return {};
    }
  };

  const uploadImageToServer = async (file) => {
    setProcessingStep(3); // Upload step
    
    // Simulate progress
    let progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 80) clearInterval(progressInterval);
        return Math.min(80, prev + 2);
      });
    }, 50);
    
    try {
      // Actual upload code
      const formData = new FormData();
      formData.append("file", file);
      
      // Add timestamp to help with RLS policies that might require creation time
      formData.append("timestamp", new Date().toISOString());
      
      // Add ticket type context which might be needed for RLS
      formData.append("ticketType", ticketType);
      
      const res = await fetch("/api/uploadImage", {
        method: "POST",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(90);
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Error parsing response JSON:", parseError);
        throw new Error("Error procesando respuesta del servidor");
      }
      
      if (!res.ok) {
        console.error("Upload failed with status:", res.status);
        console.error("Upload error details:", data);
        const errorMsg = data?.error || "Error subiendo la imagen";
        throw new Error(errorMsg);
      }
      
      if (!data?.imageUrl) {
        console.error("Missing imageUrl in response:", data);
        throw new Error("La respuesta del servidor no contiene una URL de imagen");
      }
      
      return data.imageUrl;
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Image upload error:", error);
      
      // Check for specific errors and provide better feedback
      if (error.message.includes("invalid signature") || 
          error.message.includes("jwt") ||
          error.message.includes("authentication")) {
        throw new Error("Error de autenticación con el servidor. Por favor, inténtalo de nuevo más tarde.");
      }
      
      throw error;
    }
  };

  const handleCapture = async () => {
    if (!imageFile) {
      setErrorDetails("Por favor, selecciona una imagen primero.");
      return;
    }
    
    try {
      setProcessStatus("processing");
      setProgress("Iniciando procesamiento...");
      setUploadProgress(0);
      
      // OCR step
      setProgress("Realizando reconocimiento de texto (OCR)...");
      const ocrResult = await performGoogleOCR(imageFile);
      setOcrText(ocrResult);
      
      // Gemini processing step
      setProcessingStep(2);
      setProgress("Extrayendo datos con IA...");
      
      // Simulate progress
      let progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 60) clearInterval(progressInterval);
          return Math.min(60, prev + 1);
        });
      }, 50);
      
      const geminiResp = await callGeminiAPI(ocrResult);
      clearInterval(progressInterval);
      
      const data = extractDataFromGemini(geminiResp);
      setExtractedData(data);
      
      // Upload step
      setProgress("Subiendo imagen al servidor...");
      const imageUrl = await uploadImageToServer(imageFile);

      // Ensure we use the correct image URL format
      // If the URL is absolute (contains http), use it directly
      // Otherwise, make it relative to our domain
      const fullImageUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${window.location.origin}${imageUrl}`;

      // Extraer y formatear la fecha devuelta por la IA.
      const receiptDateParsed =
        data.date_time && data.date_time.trim()
          ? parseCustomDate(data.date_time.trim())
          : new Date();
      const receiptDate = formatDate(receiptDateParsed);
      const processedAt = formatDate(new Date());

      // Save ticket step
      setProcessingStep(4);
      setProgress("Guardando información del ticket...");
      setUploadProgress(95);
      
      const ticketData = {
        merchantName: data.merchant_name || "Desconocido",
        dateTime: receiptDate, // Formato "DD-MM-YY HH:mm"
        total: `${parseFloat(data.total || 0).toFixed(2)}€`,
        imageUrl: fullImageUrl,
        processedAt, // Fecha de procesamiento
        ticketType, // Enviamos el tipo seleccionado ("individual" o "colectivo")
      };
      
      const resTicket = await fetch("/api/ticket", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });
      
      const ticketResult = await resTicket.json();
      if (!resTicket.ok)
        throw new Error(ticketResult.error || "Error guardando ticket");

      // Done!
      setProcessingStep(5);
      setUploadProgress(100);
      onUploadComplete({ ticket: ticketResult.ticket });
      
      // Show the extracted data
      setExtractedData({
        ...data,
        imageUrl: fullImageUrl,
        ticketType
      });
      
      setProcessStatus("success");
      setProgress("¡Ticket procesado correctamente!");
    } catch (error) {
      console.error("Error:", error);
      setProcessStatus("error");
      setProgress("Error: " + error.message);
      setErrorDetails(error.message);
      setUploadProgress(0);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Show animation of upload complete
      setUploadProgress(100); 
      
      // Show brief success message
      setProcessStatus("upload-success");
      setTimeout(() => {
        if (processStatus === "upload-success") {
          setProcessStatus("idle");
        }
      }, 1500);
    } else if (file) {
      setErrorDetails("El archivo seleccionado no es una imagen. Por favor selecciona un archivo JPEG, PNG o HEIC.");
    }
  };

  const rotateImage = () => {
    setImageOrientation((prev) => (prev + 90) % 360);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setProcessStatus("idle");
    setProgress("");
    setUploadProgress(0);
    setErrorDetails(null);
    setImageOrientation(0);
    setExtractedData(null);
    setProcessingStep(0);
  };

  const getStatusColor = () => {
    switch (processStatus) {
      case "processing": return "text-blue-500";
      case "success": return "text-green-500";
      case "error": return "text-red-500";
      case "upload-success": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const processingSteps = [
    { label: "Preparación", icon: <FiFileText />, step: 0 },
    { label: "OCR", icon: <FiImage />, step: 1 },
    { label: "IA", icon: <FiZap />, step: 2 },
    { label: "Subida", icon: <FiUploadCloud />, step: 3 },
    { label: "Guardar", icon: <FiCheck />, step: 4 },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 sm:p-8 rounded-2xl shadow-xl space-y-4 sm:space-y-8 transition-all duration-300 border border-gray-200 dark:border-gray-700">
      {/* Header con diseño adaptado para móvil */}
      <div className="flex flex-col items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-red-500 to-red-700 dark:from-red-600 dark:to-red-800 p-2 sm:p-3 rounded-xl shadow-lg transition-all duration-300">
            <FiFileText className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
              Procesar <span className="ml-2 text-red-600 dark:text-red-400">ticket</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sube una foto y deja que la IA extraiga la información
            </p>
          </div>
        </div>
        
        {/* Ticket type selector optimizado para móvil */}
        <div className="flex items-center gap-3 w-full bg-white dark:bg-gray-800 p-2.5 sm:p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Tipo:</span>
          <div className="flex flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            <label className={`flex flex-1 items-center justify-center px-2 sm:px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              ticketType === "individual" 
                ? "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white shadow-md" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"}`}>
              <input
                type="radio"
                name="ticketType"
                value="individual"
                checked={ticketType === "individual"}
                onChange={(e) => setTicketType(e.target.value)}
                className="sr-only"
              />
              Individual
            </label>
            <label className={`flex flex-1 items-center justify-center px-2 sm:px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              ticketType === "colectivo" 
                ? "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white shadow-md" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"}`}>
              <input
                type="radio"
                name="ticketType"
                value="colectivo"
                checked={ticketType === "colectivo"}
                onChange={(e) => setTicketType(e.target.value)}
                className="sr-only"
              />
              Colectivo
            </label>
          </div>
        </div>
      </div>
      
      {/* Info box colapsable en móviles para ahorrar espacio */}
      <div 
        className="relative overflow-hidden bg-gradient-to-r from-white/70 to-white/90 dark:from-gray-800 dark:to-gray-850 p-3 sm:p-5 rounded-lg border-l-4 border-red-500 shadow-md"
        onClick={() => isMobile && setExpandedInfo(!expandedInfo)}
      >
        <div className="flex items-start gap-3 relative z-10">
          <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-full flex-shrink-0">
            <FiInfo className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 font-medium">
                Procesa tus tickets en segundos
              </p>
              {isMobile && (
                <button className="text-gray-500 dark:text-gray-400 p-1.5">
                  {expandedInfo ? <FiMinus size={18} /> : <FiChevronsDown size={18} />}
                </button>
              )}
            </div>
            <p className={`text-xs sm:text-sm text-gray-600 dark:text-gray-300 transition-all duration-300 ${
              isMobile && !expandedInfo ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-20 opacity-100 mt-1'
            }`}>
              Selecciona o toma una foto de tu ticket para extraer la información automáticamente.
              Los datos se guardarán en la base de datos y podrás exportarlos a Excel.
            </p>
          </div>
        </div>
      </div>
      
      {/* Main content layout optimizado para móvil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Upload area optimizada para tacto móvil */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-3 sm:gap-4">
          <div 
            ref={uploadAreaRef}
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
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-medium shadow-md transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                      <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Subir archivo</span>
                    </button>
                  )}
                  <button
                    onClick={handleCapturePhoto}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-medium shadow-md transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    <FiCamera className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{isMobile ? 'Cámara' : 'Tomar foto'}</span>
                  </button>
                  {isMobile && (
                    <button
                      onClick={handleSelectFile}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-medium shadow-md transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                      <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Galería</span>
                    </button>
                  )}
                </div>
                
                {/* Error message */}
                {errorDetails && (
                  <div className="mt-4 sm:mt-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-xs sm:text-sm max-w-md">
                    <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>{errorDetails}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Image preview optimizado para móvil */
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
            )}
          </div>
          
          {/* Extracted data preview optimizado para móvil */}
          {processStatus === "success" && extractedData && (
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
          )}
        </div>
        
        {/* Processing panel optimizado para móvil */}
        <div className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center">
                <FiZap className="w-4 h-4 text-red-500 dark:text-red-400" />
              </div>
              <span>Procesar imagen</span>
            </h3>
            
            {/* Processing steps visualization optimizado para móvil */}
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
                  
                  {/* Steps indicators optimizados para móvil */}
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
            
            {/* Success message optimizado para móvil */}
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
            
            {/* Error message optimizado para móvil */}
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
            
            {/* Information about extracted data optimizado para móvil */}
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
          
          {/* Process button optimizado para móvil */}
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
      </div>
      
      {/* Full-screen image preview modal optimizado para móvil */}
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
      
      {/* Hidden inputs for file and camera */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        aria-label="Seleccionar imagen"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        ref={cameraInputRef}
        className="hidden"
        aria-label="Tomar foto con cámara"
      />
    </div>
  );
}
