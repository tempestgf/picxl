// A simple test script that uses ES modules syntax for node-fetch
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testDirectUpload() {
  // Get settings from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration');
    return;
  }
  
  console.log('Testing direct upload to Supabase Storage API');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using API key:', supabaseKey.substring(0, 10) + '...');
  
  try {
    // Create test content
    const testContent = 'This is a test file for direct API upload';
    const timestamp = Date.now();
    const testFilePath = `uploads/test-direct-${timestamp}.txt`;
    
    console.log(`Uploading test file to ${testFilePath}...`);
    
    // Try direct upload using the REST API
    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/public/images/${testFilePath}`, {
      method: 'PUT', // Use PUT for direct object upload
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'text/plain',
        'x-upsert': 'true'
      },
      body: testContent
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload file: ${uploadResponse.status} ${errorText}`);
    }
    
    console.log('Upload successful!');
    console.log(`File URL: ${supabaseUrl}/storage/v1/object/public/images/${testFilePath}`);
    
    // Try to download the file to verify it worked
    console.log('Verifying file is accessible...');
    
    const downloadResponse = await fetch(`${supabaseUrl}/storage/v1/object/public/images/${testFilePath}`);
    
    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      throw new Error(`Failed to download file: ${downloadResponse.status} ${errorText}`);
    }
    
    const content = await downloadResponse.text();
    console.log('Downloaded content:', content);
    
    if (content === testContent) {
      console.log('✅ Content verification successful!');
    } else {
      console.log('❌ Content verification failed. Downloaded content doesn\'t match uploaded content.');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testDirectUpload();
