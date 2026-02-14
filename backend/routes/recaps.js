const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // GET /api/recaps/:user_id/latest
    router.get('/:user_id/latest', async (req, res) => {
        const { user_id } = req.params;
        try {
            const result = await pool.query(
                'SELECT * FROM recap_data WHERE user_id = $1 ORDER BY week_start DESC LIMIT 1',
                [user_id]
            );

            if (result.rows.length === 0) {
                // Return dummy data for demo if no recap exists
                return res.json({
                    week_start: new Date().toISOString(),
                    total_glitches: 5,
                    most_chaotic_day: 'Wednesday',
                    aura_change: 120,
                    audit_accuracy: 95
                });
            }
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
