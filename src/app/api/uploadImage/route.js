import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Get user ID if provided in the form data
    const userId = formData.get("userId");
    
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const uniqueFilename = `image-${timestamp}-${uniqueId}${fileExt}`;
    
    // Implement the local file storage solution
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure uploads/images directory exists - FIXED PATH TO MATCH URL
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    if (!fs.existsSync(uploadsDir)){
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Save file to local storage
    const filePath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);
    
    // Generate URL for the saved file - FIXED PATH TO MATCH EXPECTED URL
    const publicUrl = `/uploads/images/${uniqueFilename}`;
    
    console.log("File saved successfully at:", filePath);
    
    // If userId is provided, associate the image with the user in the database
    let userRecord = null;
    if (userId) {
      try {
        userRecord = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          select: { id: true }
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }
    
    return new Response(JSON.stringify({ 
      imageUrl: publicUrl,
      success: true
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unhandled upload error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Server error",
      message: "Failed to upload image. Please try again or contact support."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    // Ensure connection is properly handled
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}