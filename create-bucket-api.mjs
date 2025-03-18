import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Try both keys
  
  console.log("Creating 'images' bucket using direct API calls...");
  console.log("Supabase URL:", supabaseUrl);
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase configuration");
    return;
  }
  
  // Try each key
  const keys = [supabaseKey, serviceRoleKey].filter(Boolean);
  
  for (const key of keys) {
    try {
      console.log(`Attempting with key: ${key.substring(0, 10)}...`);
      
      // First check if bucket exists
      const listResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (listResponse.ok) {
        const buckets = await listResponse.json();
        console.log("Existing buckets:", buckets.map(b => b.name).join(', '));
        
        if (buckets.some(b => b.name === 'images')) {
          console.log("'images' bucket already exists");
          return;
        }
      } else {
        console.log("Error listing buckets:", await listResponse.text());
      }
      
      // Create the bucket
      console.log("Creating 'images' bucket...");
      const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'images',
          name: 'images',
          public: true
        })
      });
      
      if (createResponse.ok) {
        console.log("Successfully created 'images' bucket!");
        return;
      } else {
        const errorText = await createResponse.text();
        console.log(`Failed to create bucket with this key: ${errorText}`);
      }
    } catch (error) {
      console.error("Error with this key:", error);
    }
  }
  
  console.log("Failed to create bucket with any available keys.");
}

createBucket();
