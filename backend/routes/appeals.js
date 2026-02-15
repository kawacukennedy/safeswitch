const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // POST /api/appeals - Submit an appeal
    router.post('/', async (req, res) => {
        const { reason } = req.body;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ error: 'Appeal reason is required' });
        }

        try {
            // Check if user already has a pending appeal
            const existing = await pool.query(
                "SELECT id FROM appeals WHERE user_id = $1 AND status = 'pending'",
                [req.user.id]
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({ error: 'You already have a pending appeal' });
            }

            await pool.query(
                'INSERT INTO appeals (user_id, reason) VALUES ($1, $2)',
                [req.user.id, reason.trim()]
            );
            res.status(201).json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // GET /api/appeals - User's own appeals
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT id, reason, status, created_at, reviewed_at
                 FROM appeals
                 WHERE user_id = $1
                 ORDER BY created_at DESC
                 LIMIT 20`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
