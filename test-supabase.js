const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log("Testing Supabase connection...");
  console.log("Supabase URL:", supabaseUrl);
  console.log("Anon key available:", !!supabaseAnonKey);
  console.log("Service role key available:", !!serviceRoleKey);
  
  if (!supabaseUrl) {
    console.error("Missing Supabase URL");
    return;
  }
  
  try {
    console.log("\n--- Testing with anon key ---");
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      // Test if we can list buckets with anon key
      const { data: buckets, error } = await anonClient.storage.listBuckets();
      
      if (error) {
        console.error("Error listing buckets with anon key:", error);
      } else {
        console.log("Successfully listed buckets with anon key");
        console.log("Available buckets:", buckets.map(b => b.name).join(', '));
        
        // Test if 'images' bucket exists
        if (buckets.some(b => b.name === 'images')) {
          console.log("'images' bucket found");
        } else {
          console.log("'images' bucket NOT found");
        }
      }
    } catch (err) {
      console.error("Exception listing buckets with anon key:", err);
    }
    
    // Test direct upload with anon key
    try {
      const testBuffer = Buffer.from('Test file content');
      const { data, error } = await anonClient.storage
        .from('images')
        .upload(`uploads/test-${Date.now()}.txt`, testBuffer, {
          contentType: 'text/plain',
          upsert: true
        });
        
      if (error) {
        console.error("Error uploading test file with anon key:", error);
      } else {
        console.log("Successfully uploaded test file with anon key");
      }
    } catch (err) {
      console.error("Exception uploading with anon key:", err);
    }
    
    if (serviceRoleKey) {
      console.log("\n--- Testing with service role key ---");
      try {
        const serviceClient = createClient(supabaseUrl, serviceRoleKey);
        
        // Test if we can list buckets
        const { data: buckets, error } = await serviceClient.storage.listBuckets();
        
        if (error) {
          console.error("Error listing buckets with service role key:", error);
        } else {
          console.log("Successfully listed buckets with service role key");
          console.log("Available buckets:", buckets.map(b => b.name).join(', '));
          
          // Test if 'images' bucket exists
          const imagesBucket = buckets.find(b => b.name === 'images');
          if (imagesBucket) {
            console.log("'images' bucket found");
            
            // Test direct upload with service role key
            try {
              const testBuffer = Buffer.from('Test file content');
              const { data, error } = await serviceClient.storage
                .from('images')
                .upload(`uploads/test-service-${Date.now()}.txt`, testBuffer, {
                  contentType: 'text/plain',
                  upsert: true
                });
                
              if (error) {
                console.error("Error uploading test file with service role key:", error);
              } else {
                console.log("Successfully uploaded test file with service role key");
              }
            } catch (err) {
              console.error("Exception uploading with service role key:", err);
            }
          } else {
            console.log("'images' bucket NOT found - you need to create it in Supabase dashboard");
          }
        }
      } catch (err) {
        console.error("Exception during service role key tests:", err);
      }
    }
  } catch (err) {
    console.error("Main exception during Supabase tests:", err);
  }
}

testSupabase();
