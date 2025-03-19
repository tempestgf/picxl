import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../lib/prisma';

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Function to create bucket if it doesn't exist
async function ensureBucketExists() {
  try {
    // First check if bucket exists
    const listResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (listResponse.ok) {
      const buckets = await listResponse.json();
      const imagesBucket = buckets.find(b => b.name === 'images');
      
      if (imagesBucket) {
        console.log("'images' bucket exists");
        return true;
      }
    }
    
    // Create the bucket
    console.log("Attempting to create 'images' bucket");
    const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'images',
        name: 'images',
        public: true
      })
    });
    
    if (createResponse.ok) {
      console.log("Created 'images' bucket successfully");
      return true;
    } else {
      const errorText = await createResponse.text();
      console.error("Failed to create bucket:", errorText);
      return false;
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    return false;
  }
}

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
    
    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const uniqueFilename = `image-${timestamp}-${uniqueId}${fileExt}`;
    const filePath = `uploads/${uniqueFilename}`;
    
    // First, ensure the bucket exists
    await ensureBucketExists();
    
    console.log(`Attempting to upload file: ${uniqueFilename} to Supabase`);
    
    // Try to create folder if it doesn't exist (may not be necessary, but just in case)
    try {
      const folderCheckResponse = await fetch(`${supabaseUrl}/storage/v1/object/info/images/uploads`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!folderCheckResponse.ok) {
        console.log("Creating 'uploads' folder");
        const emptyBuffer = Buffer.from('');
        
        await fetch(`${supabaseUrl}/storage/v1/object/images/uploads/.folder`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/octet-stream'
          },
          body: emptyBuffer
        });
      }
    } catch (folderError) {
      // Ignore folder creation errors - proceed with upload
      console.log("Folder check/creation skipped:", folderError.message);
    }
    
    // Upload directly to Supabase
    try {
      // Try direct upload with POST request (not PUT)
      const uploadUrl = `${supabaseUrl}/storage/v1/object/images/${filePath}`;
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: buffer
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Supabase upload error:", errorText);
        throw new Error(`Failed to upload to Supabase: ${errorText}`);
      }
      
      // Generate the direct public URL to the uploaded file
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/images/${filePath}`;
      
      // If userId is provided, associate the image with the user in the database
      let userRecord = null;
      if (userId) {
        try {
          // Use a single query operation with transaction
          userRecord = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
              where: { id: userId },
              select: { id: true }
            });
            
            if (user) {
              // Add image to user's gallery or other operations
              // Example: await tx.image.create({...})
            }
            
            return user;
          }, {
            maxWait: 5000, // maximum time this transaction will wait to acquire the first lock
            timeout: 10000, // maximum time for the transaction to finish
            isolationLevel: 'ReadCommitted' // transaction isolation level
          });
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Continue despite DB error - we still have the image URL
        }
      }
      
      console.log("Upload successful, URL:", publicUrl);
      return new Response(JSON.stringify({ 
        imageUrl: publicUrl,
        success: true
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }
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
    // Next.js serverless functions handle this automatically
    // but adding this for clarity and completeness
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
}