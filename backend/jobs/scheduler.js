const cron = require('node-cron');

module.exports = (pool) => {
    console.log('Scheduler started...');

    // 1. Expire Quests (Every minute)
    cron.schedule('* * * * *', async () => {
        try {
            // Logic to mark old quests as inactive or update signals
            // For now, mainly logging to show it runs
            // console.log('Checking for expired quests...');
        } catch (err) {
            console.error('Job Error (expire_quests):', err);
        }
    });

    // 2. Release New Quest (Daily at Midnight mock, or randomize)
    // Specs say "Randomized daily", for sim we'll do it if no active quest
    cron.schedule('*/5 * * * *', async () => { // Check every 5 mins
        try {
            const activeQuest = await pool.query('SELECT * FROM quests WHERE expires_at > NOW()');
            if (activeQuest.rows.length === 0) {
                console.log('Releasing new quest...');
                const questTexts = [
                    "record a glitch in the simulation.",
                    "find something that loops perfectly.",
                    "capture a moment of pure silence.",
                    "film a reflection that doesn't look right.",
                    "prove you are not a robot."
                ];
                const randomText = questTexts[Math.floor(Math.random() * questTexts.length)];

                await pool.query(
                    'INSERT INTO quests (quest_text, active_at, expires_at) VALUES ($1, NOW(), NOW() + INTERVAL \'24 hours\')',
                    [randomText]
                );
            }
        } catch (err) {
            console.error('Job Error (release_quest):', err);
        }
    });

    // 3. Update Leaderboard Cache (Every 5 mins)
    cron.schedule('*/5 * * * *', async () => {
        try {
            await pool.query('REFRESH MATERIALIZED VIEW leaderboard_global');
            await pool.query('REFRESH MATERIALIZED VIEW leaderboard_city');
        } catch (err) {
            // Silently skip — views may not exist yet, leaderboard route has its own fallback
        }
    });

    // 4. Generate Weekly Recaps (Mondays at 00:00)
    cron.schedule('0 0 * * 1', async () => {
        try {
            console.log('Generating weekly recaps...');
            const users = await pool.query('SELECT id FROM profiles');

            for (const user of users.rows) {
                // Mock aggregation logic for demo purposes
                // Real implementation would query aura_log, audits, signals for the week
                const recap = {
                    total_glitches: Math.floor(Math.random() * 7),
                    most_chaotic_day: ['monday', 'tuesday', 'friday'][Math.floor(Math.random() * 3)],
                    aura_change: Math.floor(Math.random() * 100),
                    audit_accuracy: 80 + Math.floor(Math.random() * 20)
                };

                await pool.query(
                    'INSERT INTO recap_data (user_id, week_start_date, data) VALUES ($1, CURRENT_DATE, $2) ON CONFLICT DO NOTHING',
                    [user.id, JSON.stringify(recap)]
                );
            }
        } catch (err) {
            console.error('Job Error (recaps):', err);
        }
    });

    // 5. Audit Penalty Check (Hourly)
    cron.schedule('0 * * * *', async () => {
        // Detect low accuracy auditors
        // Placeholder
    });

    // 6. Process Appeals (Daily)
    cron.schedule('0 0 * * *', async () => {
        // Notify mods
        // Placeholder
    });

    // 7. Video Processing (Simulated Trigger)
    // In a real app, this is event-driven, but we can have a cleanup job

    // 8. Update Aura from Audits (Trigger-based usually, but could be batch)
    // We do this realtime in the route, so no cron needed strictly, 
    // but the spec lists it as a job. We'll leave it as handled by the route for now.
};
