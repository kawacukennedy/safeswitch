const express = require('express');
const router = express.Router();
const AuraService = require('../services/aura');

const multer = require('multer');
const StorageService = require('../services/storage');

// Configure Multer (Memory Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = (pool, realtime) => {

    // GET /api/signals (feed)
    router.get('/', async (req, res) => {
        try {
            // Fetch recent signals for feed
            // Join with profiles to get handle
            const result = await pool.query(`
        SELECT s.*, p.handle, p.aura_score 
        FROM signals s
        JOIN profiles p ON s.user_id = p.id
        ORDER BY s.created_at DESC
        LIMIT 20
      `);
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // POST /api/signals (upload)
    router.post('/', upload.single('video'), async (req, res) => {
        const { quest_id } = req.body;
        const user_id = req.user.id;
        const file = req.file;

        if (!file || !quest_id) {
            return res.status(400).json({ error: 'Missing video file or quest_id' });
        }

        try {
            // Upload to Supabase
            const video_url = await StorageService.uploadFile(file.buffer, file.mimetype);

            const result = await pool.query(
                'INSERT INTO signals (user_id, quest_id, video_url) VALUES ($1, $2, $3) RETURNING id',
                [user_id, quest_id, video_url]
            );

            // Calculate Aura Reward
            const quest = await pool.query('SELECT * FROM quests WHERE id = $1', [quest_id]);
            const reward = AuraService.calculateSubmissionReward(
                new Date(),
                quest.rows[0].active_at,
                quest.rows[0].expires_at
            );

            // Award aura
            await pool.query(
                'UPDATE profiles SET aura_score = aura_score + $1 WHERE id = $2',
                [reward, user_id]
            );

            // Log aura
            await pool.query(
                "INSERT INTO aura_log (user_id, delta, reason, reference_id) VALUES ($1, $2, 'signal_submission', $3)",
                [user_id, reward, result.rows[0].id]
            );

            // Fetch profile data for broadcast
            const profile = await pool.query('SELECT handle, aura_score FROM profiles WHERE id = $1', [user_id]);
            const { handle, aura_score } = profile.rows[0];

            // Broadcast to Feed
            if (realtime) {
                realtime.broadcast('new_signal', {
                    id: result.rows[0].id,
                    video_url,
                    quest_id,
                    user_id,
                    handle,
                    aura_score
                });
            }

            res.status(201).json({ signal_id: result.rows[0].id, video_url, status: 'processing' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Upload failed: ' + err.message });
        }
    });

    return router;
};
