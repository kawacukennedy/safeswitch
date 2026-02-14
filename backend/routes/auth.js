const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // POST /api/auth/magic-link
    router.post('/magic-link', (req, res) => {
        // Mock success
        res.status(204).send();
    });

    // POST /api/auth/verify
    router.post('/verify', (req, res) => {
        // Mock success token
        res.json({
            user: {
                id: '00000000-0000-0000-0000-000000000001',
                handle: 'neon_user',
                aura: 100
            },
            jwt: 'mock_jwt_token'
        });
    });

    return router;
};
