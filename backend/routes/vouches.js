const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // POST /api/vouches - Redeem a vouch code
    // The actual vouches table has referrer_id and referred_id columns.
    // We simulate vouch-code flow: the code is the referrer's handle or a vouch token.
    // For simplicity, we treat the code as the referrer's handle and create a vouch link.
    router.post('/', async (req, res) => {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'Code required' });

        try {
            // Look up the referrer by handle (code = handle of the person who vouched)
            const referrer = await pool.query(
                'SELECT id FROM profiles WHERE handle = $1',
                [code.toLowerCase()]
            );

            if (referrer.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid vouch code' });
            }

            const referrer_id = referrer.rows[0].id;
            const referred_id = req.user.id;

            // Can't vouch for yourself
            if (referrer_id === referred_id) {
                return res.status(400).json({ error: 'Cannot vouch for yourself' });
            }

            // Create the vouch link
            await pool.query(
                'INSERT INTO vouches (referrer_id, referred_id) VALUES ($1, $2)',
                [referrer_id, referred_id]
            );

            res.status(201).json({ referred_by: referrer_id });
        } catch (err) {
            if (err.code === '23505') { // Unique constraint on referred_id
                return res.status(400).json({ error: 'Already vouched' });
            }
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
};
