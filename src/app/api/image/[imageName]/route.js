// src/app/api/image/[imageName]/route.js
import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context.params);
    const imageName = params.imageName;
    
    // Obtener el archivo desde Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('images')
      .download(`uploads/${imageName}`);
    
    if (error || !data) {
      throw new Error(error?.message || 'Imagen no encontrada');
    }
    
    // Determinar el tipo de contenido basado en la extensión
    const ext = imageName.substring(imageName.lastIndexOf('.')).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    
    // Convertir Blob a ArrayBuffer
    const arrayBuffer = await data.arrayBuffer();
    
    return new Response(arrayBuffer, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    return new Response('Imagen no encontrada', { status: 404 });
  }
}