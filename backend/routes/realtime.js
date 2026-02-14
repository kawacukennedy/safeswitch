const express = require('express');
const router = express.Router();

// Store active clients
let clients = [];

module.exports = () => {

    // GET /api/realtime/feed
    router.get('/feed', (req, res) => {
        // SSE Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Add client
        const clientId = Date.now();
        const newClient = {
            id: clientId,
            res
        };
        clients.push(newClient);

        // Cleanup on close
        req.on('close', () => {
            clients = clients.filter(c => c.id !== clientId);
        });
    });

    // Helper to broadcast events
    router.broadcast = (event, data) => {
        clients.forEach(client => {
            client.res.write(`event: ${event}\n`);
            client.res.write(`data: ${JSON.stringify(data)}\n\n`);
        });
    };

    return router;
};
