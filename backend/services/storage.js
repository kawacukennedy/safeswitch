const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. Storage upload will fail.");
}

const BUCKET_NAME = 'signals';

const uploadFile = async (fileBuffer, mimeType) => {
    if (!supabase) throw new Error("Supabase client not initialized");

    const fileName = `${uuidv4()}.${mimeType.split('/')[1]}`;
    const filePath = `videos/${fileName}`;

    const { data, error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: false
        });

    if (error) {
        console.error('Supabase Upload Error:', error);
        throw error;
    }

    // Get Public URL
    const { data: publicUrlData } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
};

module.exports = {
    uploadFile
};
