const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    // GET /api/users/me (current profile)
    router.get('/me', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.user.id]);
            if (result.rows.length === 0) {
                // Create profile if doesn't exist (Mock behavior)
                const newProfile = await pool.query(
                    "INSERT INTO profiles (id, handle, city) VALUES ($1, $2, $3) RETURNING *",
                    [req.user.id, 'neon_user', 'neo_tokyo']
                );
                return res.json(newProfile.rows[0]);
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    // PATCH /api/users/settings (notifications)
    router.patch('/settings', async (req, res) => {
        // Implementation for settings update
        res.json({ success: true });
    });

    return router;
};
