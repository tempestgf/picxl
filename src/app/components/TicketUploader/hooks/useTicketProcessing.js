import { useState } from 'react';
import { parseCustomDate, formatDate } from '../utils/dateFormatter';

export const useTicketProcessing = ({ imageFile, onUploadComplete }) => {
  const [progress, setProgress] = useState("");
  const [processStatus, setProcessStatus] = useState("idle");
  const [extractedData, setExtractedData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [errorDetails, setErrorDetails] = useState(null);
  const [ocrText, setOcrText] = useState("");

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

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
      
      setUploadProgress(40);
      clearInterval(progressInterval);
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
    `;

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
    if (!response.ok) {
      throw new Error("Error en Gemini: " + JSON.stringify(result));
    }
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
      
      const res = await fetch("/api/uploadImage", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      const data = await res.json();
      clearInterval(progressInterval);
      setUploadProgress(90);
      
      if (!res.ok)
        throw new Error(data.error || "Error subiendo la imagen");
      
      return data.imageUrl; // This will now be /uploads/images/filename
    } catch (error) {
      clearInterval(progressInterval);
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

      // Construct the full URL with the domain
      // Fixed: Use the proper domain from the environment variable or fallback to a hardcoded value
      const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'tickets.tempestgf.es';
      const fullImageUrl = `https://${DOMAIN}${imageUrl}`;
      
      console.log("Generated image URL:", fullImageUrl);
      
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
        imageUrl: fullImageUrl, // Use the full URL with domain
        processedAt,
        ticketType: "individual", // Default or use a provided value
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
      
      // Show the extracted data
      setExtractedData({
        ...data,
        imageUrl: fullImageUrl,
      });
      
      setProcessStatus("success");
      setProgress("¡Ticket procesado correctamente!");
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete({ ticket: ticketResult.ticket });
      }
    } catch (error) {
      console.error("Error:", error);
      setProcessStatus("error");
      setProgress("Error: " + error.message);
      setErrorDetails(error.message);
      setUploadProgress(0);
    }
  };

  return {
    progress,
    processStatus,
    extractedData,
    uploadProgress,
    processingStep,
    errorDetails,
    handleCapture,
  };
};
