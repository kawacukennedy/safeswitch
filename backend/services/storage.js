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
    console.warn('⚠ Supabase not configured — using local file storage');
}

const BUCKET_NAME = 'signals';

// Local upload directory (fallback when Supabase is unavailable)
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const uploadFile = async (fileBuffer, mimeType) => {
    const ext = mimeType.split('/')[1] || 'webm';
    const fileName = `${uuidv4()}.${ext}`;

    // Try Supabase first
    if (supabase) {
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

        const { data: publicUrlData } = supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    }

    // Fallback: save locally and serve via Express static
    const localPath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(localPath, fileBuffer);
    console.log(`Saved locally: ${localPath}`);

    // Return a relative URL that Express will serve
    return `/uploads/${fileName}`;
};

module.exports = {
    uploadFile
};
