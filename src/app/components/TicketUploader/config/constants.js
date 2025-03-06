export const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "AIzaSyBvfAYMmoBWc7KGSRl5DOhZECHjsFsDAQE";

export const processingSteps = [
  { label: "Preparación", icon: "FiFileText", step: 0 },
  { label: "OCR", icon: "FiImage", step: 1 },
  { label: "IA", icon: "FiZap", step: 2 },
  { label: "Subida", icon: "FiUploadCloud", step: 3 },
  { label: "Guardar", icon: "FiCheck", step: 4 },
];
