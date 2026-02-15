const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // POST /api/reports - Submit a report
    router.post('/', async (req, res) => {
        const { signal_id, reason, description } = req.body;

        if (!signal_id || !reason) {
            return res.status(400).json({ error: 'signal_id and reason are required' });
        }

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

    // GET /api/reports/mine - User's own reports
    router.get('/mine', async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT r.id, r.signal_id, r.reason, r.description, r.status, 
                        r.created_at, r.resolved_at, r.resolution_note
                 FROM reports r
                 WHERE r.reporter_id = $1
                 ORDER BY r.created_at DESC
                 LIMIT 50`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // GET /api/reports (Moderator only)
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
                'UPDATE reports SET status = $1, resolution_note = $2, resolved_at = NOW(), resolved_by = $3 WHERE id = $4',
                [status, resolution_note, req.user.id, id]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
