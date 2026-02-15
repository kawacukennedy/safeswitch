const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // GET /api/aura/history - User's aura log
    router.get('/history', async (req, res) => {
        const user_id = req.user.id;

        try {
            const result = await pool.query(
                `SELECT id, delta, reason, reference_id, created_at 
                 FROM aura_log 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC 
                 LIMIT 50`,
                [user_id]
            );

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    return router;
};
