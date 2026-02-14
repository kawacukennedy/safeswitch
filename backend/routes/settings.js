const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    // GET /api/settings/notifications
    router.get('/notifications', async (req, res) => {
        // In a real app, this would be a separate table or jsonb column
        // returning mock default for now as schemas.sql didn't strictly specify a notification_settings table linked to user
        // Wait, schema.sql DOES have notification_settings table. Let's use it.
        try {
            let settings = await pool.query('SELECT * FROM notification_settings WHERE user_id = $1', [req.user.id]);

            if (settings.rows.length === 0) {
                // Create defaults
                settings = await pool.query(
                    'INSERT INTO notification_settings (user_id) VALUES ($1) RETURNING *',
                    [req.user.id]
                );
            }
            res.json(settings.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // PATCH /api/settings/notifications
    router.patch('/notifications', async (req, res) => {
        const { daily_quest, audit_reminder, aura_milestone } = req.body;
        // Build dynamic query
        const fields = [];
        const values = [];
        let idx = 1;

        if (daily_quest !== undefined) { fields.push(`daily_quest = $${idx++}`); values.push(daily_quest); }
        if (audit_reminder !== undefined) { fields.push(`audit_reminder = $${idx++}`); values.push(audit_reminder); }
        if (aura_milestone !== undefined) { fields.push(`aura_milestone = $${idx++}`); values.push(aura_milestone); }

        if (fields.length === 0) return res.json({ success: true });

        values.push(req.user.id);

        try {
            const query = `UPDATE notification_settings SET ${fields.join(', ')} WHERE user_id = $${idx}`;
            await pool.query(query, values);
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
