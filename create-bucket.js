const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createImagesBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log("Creating 'images' bucket in Supabase...");
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    console.log("Checking for existing buckets...");
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return;
    }
    
    const imagesBucket = buckets.find(b => b.name === 'images');
    if (imagesBucket) {
      console.log("'images' bucket already exists.");
      
      // Ensure the bucket is public
      console.log("Updating bucket to be public...");
      const { error: updateError } = await supabase.storage.updateBucket('images', {
        public: true
      });
      
      if (updateError) {
        console.error("Error updating bucket:", updateError);
      } else {
        console.log("Bucket updated to be public.");
      }
    } else {
      console.log("Creating new 'images' bucket...");
      const { data, error: createError } = await supabase.storage.createBucket('images', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
      } else {
        console.log("'images' bucket created successfully!");
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

createImagesBucket();
