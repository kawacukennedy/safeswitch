const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // POST /api/vouches
    router.post('/', async (req, res) => {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'Code required' });

        try {
            // Verify code existence and validity
            const vouch = await pool.query(
                'SELECT * FROM vouches WHERE code = $1 AND is_used = false',
                [code]
            );

            if (vouch.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid or used code' });
            }

            // Mark as used and link to current user
            await pool.query(
                'UPDATE vouches SET is_used = true, redeemer_id = $1, redeemed_at = NOW() WHERE id = $2',
                [req.user.id, vouch.rows[0].id]
            );

            res.status(201).json({ referred_by: vouch.rows[0].voucher_id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
