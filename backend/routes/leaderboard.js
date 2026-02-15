const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // GET /api/leaderboard
    router.get('/', async (req, res) => {
        const { scope, city } = req.query; // scope=global|city

        try {
            let query = 'SELECT rank, handle, aura FROM leaderboard_global LIMIT 100';
            let params = [];

            if (scope === 'city' && city) {
                query = 'SELECT rank, handle, aura FROM leaderboard_city WHERE city = $1 LIMIT 100';
                params = [city];
            }

            let result;
            try {
                // Note: leaderboard_global is a Materialized View in schema.sql
                // If it's empty in dev, we might fallback to raw query
                result = await pool.query(query, params);
            } catch (err) {
                console.warn('Leaderboard MV query failed, falling back to raw query:', err.message);
                result = { rows: [] }; // Trigger fallback below
            }

            if (!result || result.rows.length === 0) {
                // Fallback raw query
                const rawQuery = 'SELECT handle, aura_score as aura, RANK() OVER (ORDER BY aura_score DESC) as rank FROM profiles LIMIT 10';
                const rawResult = await pool.query(rawQuery);
                return res.json(rawResult.rows);
            }

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
