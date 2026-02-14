const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // POST /api/appeals
    router.post('/', async (req, res) => {
        const { reason } = req.body;
        // Logic to store appeal
        // Schema lookup: Is there an appeals table? Yes.
        try {
            await pool.query(
                'INSERT INTO appeals (user_id, reason) VALUES ($1, $2)',
                [req.user.id, reason]
            );
            res.status(201).json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
