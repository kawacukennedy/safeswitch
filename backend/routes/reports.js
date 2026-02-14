const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // POST /api/reports
    router.post('/', async (req, res) => {
        const { signal_id, reason, description } = req.body;
        try {
            await pool.query(
                'INSERT INTO reports (reporter_id, signal_id, reason, description) VALUES ($1, $2, $3, $4)',
                [req.user.id, signal_id, reason, description]
            );
            res.status(201).json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // GET /api/reports (Moderator only - simplified for now)
    router.get('/', async (req, res) => {
        // In real app, check req.user.role === 'moderator'
        try {
            const reports = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
            res.json(reports.rows);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    // PATCH /api/reports/:id
    router.patch('/:id', async (req, res) => {
        const { status, resolution_note } = req.body;
        const { id } = req.params;
        try {
            await pool.query(
                'UPDATE reports SET status = $1, resolution_note = $2, resolved_at = NOW() WHERE id = $3',
                [status, resolution_note, id]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
