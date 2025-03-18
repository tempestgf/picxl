// A simple test script that bypasses the Supabase SDK authentication issues
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

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
  
  try {
    // First, try to list buckets using direct API
    const listBucketsUrl = `${supabaseUrl}/storage/v1/bucket`;
    
    const listResponse = await fetch(listBucketsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!listResponse.ok) {
      throw new Error(`Failed to list buckets: ${listResponse.status} ${await listResponse.text()}`);
    }
    
    const buckets = await listResponse.json();
    console.log('Successfully listed buckets:', buckets.map(b => b.name).join(', '));
    
    // Check if images bucket exists
    const imagesBucket = buckets.find(b => b.name === 'images');
    
    if (!imagesBucket) {
      // Create images bucket if it doesn't exist
      console.log('Creating images bucket...');
      
      const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'images',
          public: true,
          file_size_limit: 5242880
        })
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create bucket: ${createResponse.status} ${await createResponse.text()}`);
      }
      
      console.log('Successfully created images bucket');
    } else {
      console.log('Images bucket already exists');
    }
    
    // Now try to upload a test file directly
    const testContent = 'This is a test file for direct API upload';
    const timestamp = Date.now();
    const testFilePath = `uploads/test-direct-${timestamp}.txt`;
    
    console.log(`Uploading test file to ${testFilePath}...`);
    
    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/public/images/${testFilePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'text/plain',
        'x-upsert': 'true'
      },
      body: testContent
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.status} ${await uploadResponse.text()}`);
    }
    
    console.log('Upload successful!');
    console.log(`File URL: ${supabaseUrl}/storage/v1/object/public/images/${testFilePath}`);
    
    // Try to download the file to verify it worked
    console.log('Verifying file is accessible...');
    
    const downloadResponse = await fetch(`${supabaseUrl}/storage/v1/object/public/images/${testFilePath}`);
    
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download file: ${downloadResponse.status} ${await downloadResponse.text()}`);
    }
    
    const content = await downloadResponse.text();
    console.log('Downloaded content:', content);
    
    if (content === testContent) {
      console.log('Content verification successful!');
    } else {
      console.log('Content verification failed. Downloaded content doesn\'t match uploaded content.');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testDirectUpload();
