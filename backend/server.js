require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const rateLimit = require('./utils/rateLimiter');
const dns = require('dns').promises;
const url = require('url');

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

// Load Routes (factories)
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
const authenticateToken = require('./middleware/auth');

app.use('/api/realtime', realtimeRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const startServer = async () => {
    try {
        let dbConnectionString = process.env.DATABASE_URL;

        if (!dbConnectionString) {
            console.error('DATABASE_URL is not set');
            process.exit(1);
        }

        // Attempt to resolve hostname to IPv4 to avoid ENETUNREACH in IPv6-only environments
        try {
            const dbUrl = new url.URL(dbConnectionString);
            const hostname = dbUrl.hostname;
            console.log(`Resolving database host: ${hostname}`);

            const ips = await dns.resolve4(hostname);
            if (ips && ips.length > 0) {
                console.log(`Resolved ${hostname} to IPv4: ${ips[0]}`);
                dbUrl.hostname = ips[0];
                dbConnectionString = dbUrl.toString();
            } else {
                console.warn(`No IPv4 address found for ${hostname}, using original connection string.`);
            }
        } catch (e) {
            console.warn('DNS Resolution failed, using original connection string:', e.message);
        }

        // Database Pool
        const pool = new Pool({
            connectionString: dbConnectionString,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            // socket options
            keepAlive: true,
            // family: 4 // Explicitly forcing family 4 as backup
        });

        // Test connection
        const client = await pool.connect();
        console.log('Database connected successfully');
        client.release();

        // Register Routes
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
        app.use('/api/leaderboard', authenticateToken, leaderboardRoutes(pool));
        app.use('/api/aura', authenticateToken, auraRoutes(pool));

        // Start Scheduler
        require('./jobs/scheduler')(pool);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
