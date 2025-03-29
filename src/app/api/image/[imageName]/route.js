// src/app/api/image/[imageName]/route.js
import fs from 'fs';
import path from 'path';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context.params);
    const imageName = params.imageName;
    
    // Since we're not using Supabase anymore, we need to redirect to where the image is actually stored
    // This is a placeholder implementation - you'll need to adjust based on your actual image storage
    return new Response(
      JSON.stringify({ message: "Supabase storage has been removed" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
    
    /* 
    // If you implement local file storage, you could use something like:
    const imagePath = path.join(process.cwd(), 'public', 'uploads', imageName);
    
    if (!fs.existsSync(imagePath)) {
      return new Response('Imagen no encontrada', { status: 404 });
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = imageName.substring(imageName.lastIndexOf('.')).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    
    return new Response(imageBuffer, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
    */
  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    return new Response('Imagen no encontrada', { status: 404 });
  }
}