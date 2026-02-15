const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sendMagicLink } = require('../services/email');

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

            // Send via Resend
            await sendMagicLink(email, magicLink);

            res.json({ message: 'Magic link sent' });
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
            let isNewUser = false;
            let isFirstUser = false;

            if (!user) {
                // Create a minimal profile — the user will complete onboarding next
                const emailPrefix = email.split('@')[0].substring(0, 10).replace(/[^a-zA-Z0-9_]/g, '');
                const randomSuffix = Math.floor(Math.random() * 10000);
                const handle = `${emailPrefix}_${randomSuffix}`.toLowerCase();

                userResult = await pool.query(
                    'INSERT INTO profiles (email, handle, aura_score) VALUES ($1, $2, 0) RETURNING *',
                    [email, handle]
                );
                user = userResult.rows[0];
                isNewUser = true;

                // Check if this is the very first user (founder)
                const countResult = await pool.query('SELECT COUNT(*) FROM profiles');
                if (parseInt(countResult.rows[0].count) === 1) {
                    isFirstUser = true;
                }
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

            res.json({ user, token: sessionToken, isNewUser, isFirstUser });

        } catch (err) {
            console.error('Verify error:', err);
            res.status(403).json({ error: 'Invalid or expired token' });
        }
    });

    return router;
};

