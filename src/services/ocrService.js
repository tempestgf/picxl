const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "AIzaSyBvfAYMmoBWc7KGSRl5DOhZECHjsFsDAQE";

export async function performGoogleOCR(file) {
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
    
    return textAnnotations[0].description;
  } catch (error) {
    throw error;
  }
}
