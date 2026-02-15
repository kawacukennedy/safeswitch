const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    // GET /api/users/me (current profile)
    router.get('/me', async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.user.id]);
            if (result.rows.length === 0) {
                // JWT valid but profile gone → stale session (DB was likely reset)
                // Return 401 so client clears token and redirects to login
                return res.status(401).json({ error: 'Session expired — please log in again' });
            }
            res.json(result.rows[0]);
        } catch (err) {
            console.error('Error in GET /me:', err.message);
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
