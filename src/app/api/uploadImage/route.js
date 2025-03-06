// src/app/api/uploadImage/route.js
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(file.name) || "";
    const newFileName = `image-${Date.now()}${ext}`;
    const destFolder = path.join(process.cwd(), "public", "uploads", "images");
    await fs.promises.mkdir(destFolder, { recursive: true });
    const newPath = path.join(destFolder, newFileName);
    await fs.promises.writeFile(newPath, buffer);
    // URL absoluta de la imagen:
    const DOMAIN = process.env.DOMAIN || "tempestgf.zapto.org";
    const imageUrl = `https://${DOMAIN}/uploads/images/${newFileName}`;
    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || "Error saving file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
