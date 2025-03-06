// src/app/api/image/[imageName]/route.js
import fs from "fs";
import path from "path";

export async function GET(request, context) {
  // Asegurarse de "awaitear" los parámetros del contexto
  const params = await Promise.resolve(context.params);
  const imageName = params.imageName;
  
  // Actualiza la ruta para que coincida con donde se guardan las imágenes
  const imageFolder = path.join(process.cwd(), "public", "uploads", "images");
  const imagePath = path.join(imageFolder, imageName);

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imageName).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";

    return new Response(imageBuffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Error leyendo el archivo:", error);
    return new Response("Imagen no encontrada", { status: 404 });
  }
}
