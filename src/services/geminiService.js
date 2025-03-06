const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "AIzaSyBvfAYMmoBWc7KGSRl5DOhZECHjsFsDAQE";

export async function callGeminiAPI(ocrText) {
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
}

export function extractDataFromGemini(geminiResponse) {
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
}
