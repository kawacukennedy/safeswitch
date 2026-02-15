const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://glitchgen.vercel.app';

module.exports = (pool) => {
    // POST /api/auth/magic-link
    router.post('/magic-link', async (req, res) => {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email required' });
        }

        try {
            // Generate Magic Link Token (short-lived)
            const token = jwt.sign({ email, type: 'magic' }, JWT_SECRET, { expiresIn: '15m' });

            const magicLink = `${FRONTEND_URL}/verify?token=${token}`;

            // In production, send this via email (e.g. Resend, SendGrid)
            // For now, LOG IT so the user can login
            console.log('==================================================');
            console.log(`MAGIC LINK FOR ${email}:`);
            console.log(magicLink);
            console.log('==================================================');

            res.json({ message: 'Magic link sent (check console for now)' });
        } catch (err) {
            console.error('Magic link error:', err);
            res.status(500).json({ error: 'Failed to generate link' });
        }
    });

    // POST /api/auth/verify
    router.post('/verify', async (req, res) => {
        const { token } = req.body;

        if (!token) return res.status(400).json({ error: 'Token required' });

        try {
            // Verify Magic Token
            const decoded = jwt.verify(token, JWT_SECRET);

            if (decoded.type !== 'magic' || !decoded.email) {
                return res.status(403).json({ error: 'Invalid token type' });
            }

            const email = decoded.email;

            // Find or Create User
            let userResult = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
            let user = userResult.rows[0];

            if (!user) {
                // Create new user with generated handle
                // Handle format: user_xxxx (last 4 chars of uuid)
                // We'll update uuid first
                // Actually let's just generate a random handle for now and let them change it?
                // Or use email prefix?
                const emailPrefix = email.split('@')[0].substring(0, 10).replace(/[^a-zA-Z0-9_]/g, '');
                const randomSuffix = Math.floor(Math.random() * 10000);
                const handle = `${emailPrefix}_${randomSuffix}`.toLowerCase();

                userResult = await pool.query(
                    'INSERT INTO profiles (email, handle, aura_score) VALUES ($1, $2, 0) RETURNING *',
                    [email, handle]
                );
                user = userResult.rows[0];
            }

            // Issue Session Token (long-lived)
            const sessionToken = jwt.sign(
                {
                    id: user.id,
                    handle: user.handle,
                    role: user.is_suspended ? 'suspended' : 'user'
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({ user, token: sessionToken });

        } catch (err) {
            console.error('Verify error:', err);
            res.status(403).json({ error: 'Invalid or expired token' });
        }
    });

    return router;
};

