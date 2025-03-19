// src/app/api/uploadImage/route.js
import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    
    // Convertir el archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generar un nombre único para el archivo
    const uniqueFilename = `image-${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`;
    
    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('images') // Nombre del bucket, crea este bucket en Supabase
      .upload(`uploads/${uniqueFilename}`, buffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Obtener la URL pública del archivo
    const { data: urlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(`uploads/${uniqueFilename}`);
    
    // Obtener la URL pública
    const imageUrl = urlData.publicUrl;
    
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