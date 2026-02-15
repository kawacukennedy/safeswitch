require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const rateLimit = require('./utils/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'https://glitchgen.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());

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
const auraRoutes = require('./routes/aura');

const realtimeRoutes = require('./routes/realtime')();
app.use('/api/realtime', realtimeRoutes);

app.use('/api/auth', rateLimit.auth, authRoutes(pool));
app.use('/api/quests', mockAuth, questRoutes(pool));
// Pass realtime broadcaster to signals route for notifications
app.use('/api/signals', rateLimit.submission, mockAuth, signalRoutes(pool, realtimeRoutes));
app.use('/api/audits', rateLimit.audit, mockAuth, auditRoutes(pool));
app.use('/api/users', mockAuth, userRoutes(pool));

// Profile routes
app.use('/api/profiles', mockAuth, profileRoutes(pool));
app.use('/api/profile', mockAuth, profileRoutes(pool));

app.use('/api/settings', mockAuth, settingsRoutes(pool));
app.use('/api/vouches', mockAuth, vouchesRoutes(pool));
app.use('/api/reports', mockAuth, reportsRoutes(pool));
app.use('/api/blocks', mockAuth, blocksRoutes(pool));
app.use('/api/appeals', mockAuth, appealsRoutes(pool));
app.use('/api/recaps', mockAuth, recapRoutes(pool));
app.use('/api/leaderboard', mockAuth, leaderboardRoutes(pool));
app.use('/api/aura', mockAuth, auraRoutes(pool));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Scheduler
require('./jobs/scheduler')(pool);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
