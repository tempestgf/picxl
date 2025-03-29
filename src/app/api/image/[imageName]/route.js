// src/app/api/image/[imageName]/route.js
import fs from 'fs';
import path from 'path';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context.params);
    const imageName = params.imageName;
    
    // First check for the image in various possible locations
    const possiblePaths = [
      // Check direct path in uploads folder
      path.join(process.cwd(), 'public', 'uploads', imageName),
      // Check in uploads/images folder
      path.join(process.cwd(), 'public', 'uploads', 'images', imageName),
      // Check for URL path format with uploads prefix
      path.join(process.cwd(), 'public', imageName),
    ];
    
    // If the path includes 'uploads/images', extract just the filename
    if (imageName.includes('uploads/images/')) {
      const imageNameWithoutPrefix = imageName.split('uploads/images/').pop();
      possiblePaths.push(path.join(process.cwd(), 'public', 'uploads', 'images', imageNameWithoutPrefix));
    } else if (imageName.includes('uploads/')) {
      const imageNameWithoutPrefix = imageName.split('uploads/').pop();
      possiblePaths.push(path.join(process.cwd(), 'public', 'uploads', imageNameWithoutPrefix));
      possiblePaths.push(path.join(process.cwd(), 'public', 'uploads', 'images', imageNameWithoutPrefix));
    }
    
    // Find the first path that exists
    let imagePath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        imagePath = testPath;
        break;
      }
    }
    
    // If image not found in any location, return 404
    if (!imagePath) {
      console.error('Image not found. Checked paths:', possiblePaths);
      return new Response('Image not found', { status: 404 });
    }
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Determine content type based on file extension
    const ext = imagePath.substring(imagePath.lastIndexOf('.')).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    
    console.log('Serving image from:', imagePath);
    
    // Return the image with appropriate headers
    return new Response(imageBuffer, {
      status: 200,
      headers: { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    return new Response('Error retrieving image', { status: 500 });
  }
}