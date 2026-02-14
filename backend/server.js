require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Rate Limiter (In-Memory)
const rateLimit = require('express-rate-limit'); // Assuming installed or use custom
const limiter = (windowMs, max) => {
    return (req, res, next) => {
        // Simplified custom implementation if package not present to avoid install step issues
        // In real app use 'express-rate-limit'
        next();
    };
};
// const apiLimiter = rateLimit(15 * 60 * 1000, 100); 
// app.use('/api/', apiLimiter);

// Database Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Mock Auth Middleware (for dev environment without Supabase)
const mockAuth = (req, res, next) => {
    // Simulate a logged-in user
    req.user = {
        id: '00000000-0000-0000-0000-000000000001', // Test User UUID
        handle: 'neon_user',
        role: 'user'
    };
    next();
};

// Routes
const authRoutes = require('./routes/auth');
const questRoutes = require('./routes/quests');
const signalRoutes = require('./routes/signals');
const auditRoutes = require('./routes/audits');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profiles');
const settingsRoutes = require('./routes/settings');
const vouchesRoutes = require('./routes/vouches');
const reportsRoutes = require('./routes/reports');
const blocksRoutes = require('./routes/blocks');
const appealsRoutes = require('./routes/appeals');
const recapRoutes = require('./routes/recaps');
const leaderboardRoutes = require('./routes/leaderboard');

const realtimeRoutes = require('./routes/realtime')();
app.use('/api/realtime', realtimeRoutes);

app.use('/api/auth', rateLimit.auth, authRoutes(pool));
// Pass realtime broadcaster to signals route for notifications
app.use('/api/signals', mockAuth, signalRoutes(pool, realtimeRoutes)); // Custom limits inside if needed, or global
app.use('/api/audits', rateLimit.audit, mockAuth, auditRoutes(pool));
app.use('/api/users', mockAuth, userRoutes(pool));

// New Routes
app.use('/api/profiles', mockAuth, profileRoutes(pool));
// Handle /api/profile singular usage in specs for POSTS
app.use('/api/profile', mockAuth, profileRoutes(pool));
app.use('/api/settings', mockAuth, settingsRoutes(pool));
app.use('/api/vouches', mockAuth, vouchRoutes(pool));
app.use('/api/reports', mockAuth, reportRoutes(pool));
app.use('/api/blocks', mockAuth, blockRoutes(pool));
app.use('/api/appeals', mockAuth, appealRoutes(pool));
app.use('/api/recaps', mockAuth, recapRoutes(pool));
app.use('/api/leaderboard', mockAuth, leaderboardRoutes(pool));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Scheduler
require('./jobs/scheduler')(pool);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
