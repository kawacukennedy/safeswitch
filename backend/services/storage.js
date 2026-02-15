const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✓ Supabase storage initialized');
} else {
    console.error('❌ FATAL: Supabase not configured. SUPABASE_URL or SUPABASE_SERVICE_KEY is missing.');
}

const BUCKET_NAME = 'signals';

const uploadFile = async (fileBuffer, mimeType) => {
    if (!supabase) {
        console.error('❌ Attempted upload but Supabase client is not initialized.');
        throw new Error("Supabase not configured. Cannot upload video.");
    }

    const ext = mimeType.split('/')[1] || 'webm';
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = `videos/${fileName}`;

    console.log(`[Storage] Starting upload for ${filePath} (${fileBuffer.length} bytes)...`);

    const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: false
        });

    if (error) {
        console.error('❌ Supabase Upload Error Details:', JSON.stringify(error, null, 2));
        throw new Error(`Supabase Upload Failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    console.log(`[Storage] Upload successful. URL: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
};

module.exports = {
    uploadFile
};
