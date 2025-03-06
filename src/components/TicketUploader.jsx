"use client";
import { useState, useRef, useEffect } from "react";
import { FiUpload, /* ...resto de imports de iconos */ } from "react-icons/fi";
import { performGoogleOCR } from "../services/ocrService";
import { callGeminiAPI, extractDataFromGemini } from "../services/geminiService";
import { parseCustomDate, formatDate } from "../utils/dateUtils";

export default function TicketUploader({ onUploadComplete }) {
  // ...existing code...
  
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
      
      // ...resto del código de handleCapture...
    } catch (error) {
      console.error("Error:", error);
      setProcessStatus("error");
      setProgress("Error: " + error.message);
      setErrorDetails(error.message);
      setUploadProgress(0);
    }
  };

  // ...resto del código del componente...
}
