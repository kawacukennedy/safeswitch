const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // POST /api/blocks
    router.post('/', async (req, res) => {
        const { blocked_id } = req.body;
        try {
            await pool.query(
                'INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2)',
                [req.user.id, blocked_id]
            );
            res.status(201).json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    // DELETE /api/blocks/:blocked_id
    router.delete('/:blocked_id', async (req, res) => {
        const { blocked_id } = req.params;
        try {
            await pool.query(
                'DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2',
                [req.user.id, blocked_id]
            );
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    // GET /api/blocks
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT b.blocked_id, p.handle, b.created_at as blocked_at
                FROM blocks b
                JOIN profiles p ON b.blocked_id = p.id
                WHERE b.blocker_id = $1
            `, [req.user.id]);
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
