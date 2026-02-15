require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const rateLimit = require('./utils/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // Trust first proxy (Render)

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
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // socket options
    keepAlive: true,
    family: 4 // Force IPv4
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

const authenticateToken = require('./middleware/auth');

// ... (keep routes)

// Use real auth middleware for protected routes
// app.use('/api/auth', rateLimit.auth, authRoutes(pool)); // Auth routes are public
app.use('/api/auth', rateLimit.auth, authRoutes(pool));

// Protected Routes
app.use('/api/quests', authenticateToken, questRoutes(pool));
app.use('/api/signals', rateLimit.submission, authenticateToken, signalRoutes(pool, realtimeRoutes));
app.use('/api/audits', rateLimit.audit, authenticateToken, auditRoutes(pool));
app.use('/api/users', authenticateToken, userRoutes(pool));
app.use('/api/profiles', authenticateToken, profileRoutes(pool));
app.use('/api/profile', authenticateToken, profileRoutes(pool));
app.use('/api/settings', authenticateToken, settingsRoutes(pool));
app.use('/api/vouches', authenticateToken, vouchesRoutes(pool));
app.use('/api/reports', authenticateToken, reportsRoutes(pool));
app.use('/api/blocks', authenticateToken, blocksRoutes(pool));
app.use('/api/appeals', authenticateToken, appealsRoutes(pool));
app.use('/api/recaps', authenticateToken, recapRoutes(pool));
app.use('/api/leaderboard', authenticateToken, leaderboardRoutes(pool)); // Maybe public? But spec says auth.
app.use('/api/aura', authenticateToken, auraRoutes(pool));



// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Scheduler
require('./jobs/scheduler')(pool);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
