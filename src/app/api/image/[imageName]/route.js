import path from 'path';
import fs from 'fs';
import { NextResponse } from 'next/server';

// Configure for direct Supabase access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request, context) {
  const params = await Promise.resolve(context.params);
  const imageName = params.imageName;
  
  // Simple security check - only allow safe filenames
  if (!/^[a-zA-Z0-9._-]+\.(jpe?g|png|gif|webp)$/i.test(imageName)) {
    return new Response(JSON.stringify({ error: 'Invalid image filename' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    // Build the direct Supabase URL
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/images/uploads/${imageName}`;
    
    // Check if the image actually exists before redirecting
    try {
      const checkResponse = await fetch(imageUrl, {
        method: 'HEAD'
      });
      
      if (!checkResponse.ok) {
        return new Response(JSON.stringify({ error: 'Image not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (checkError) {
      console.error('Error checking image existence:', checkError);
    }
    
    // If we get here, the image should exist - redirect to it
    return Response.redirect(imageUrl);
  } catch (error) {
    console.error('Error redirecting to image:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve image' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}