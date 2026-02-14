const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    // GET /api/profiles/:handle
    router.get('/:handle', async (req, res) => {
        try {
            const { handle } = req.params;
            const profile = await pool.query(
                'SELECT id, handle, aura_score, city, created_at FROM profiles WHERE handle = $1',
                [handle]
            );

            if (profile.rows.length === 0) {
                return res.status(404).json({ error: 'Profile not found' });
            }

            // Get recent signals
            const signals = await pool.query(
                `SELECT s.id, s.video_url, s.created_at, q.quest_text 
                 FROM signals s 
                 JOIN quests q ON s.quest_id = q.id 
                 WHERE s.user_id = $1 
                 ORDER BY s.created_at DESC LIMIT 5`,
                [profile.rows[0].id]
            );

            res.json({
                ...profile.rows[0],
                recent_signals: signals.rows
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // POST /api/profile/handle
    router.post('/handle', async (req, res) => {
        const { new_handle } = req.body;
        const user_id = req.user.id;

        if (!new_handle || !/^[a-z0-9_]{3,16}$/.test(new_handle)) {
            return res.status(400).json({ error: 'Invalid handle format' });
        }

        try {
            await pool.query(
                'UPDATE profiles SET handle = $1 WHERE id = $2',
                [new_handle, user_id]
            );
            res.json({ success: true });
        } catch (err) {
            if (err.code === '23505') { // Unique violation
                return res.status(400).json({ error: 'Handle taken' });
            }
            res.status(500).json({ error: 'Server error' });
        }
    });

    // POST /api/profile/city
    router.post('/city', async (req, res) => {
        const { city } = req.body;
        try {
            await pool.query(
                'UPDATE profiles SET city = $1 WHERE id = $2',
                [city, req.user.id]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    // DELETE /api/profile
    router.delete('/', async (req, res) => {
        try {
            // Cascade delete handles it in DB usually, but for safety:
            await pool.query('DELETE FROM profiles WHERE id = $1', [req.user.id]);
            // Also delete auth user if we had access to auth provider
            res.status(204).send();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
