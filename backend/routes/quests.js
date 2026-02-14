const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    // GET /api/quests/current
    router.get('/current', async (req, res) => {
        try {
            // In a real scenario, this would check active_at/expires_at
            // For now, we return the latest quest or a mock one if empty
            const result = await pool.query(
                'SELECT * FROM quests WHERE expires_at > NOW() ORDER BY active_at DESC LIMIT 1'
            );

            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                // Fallback Mock for Demo
                res.json({
                    id: 1,
                    quest_text: "make a noise that isn't human.",
                    active_at: new Date(),
                    expires_at: new Date(Date.now() + 86400000)
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    return router;
};
