const express = require('express');
const router = express.Router();

const AuraService = require('../services/aura');

module.exports = (pool) => {

    // POST /api/audits
    router.post('/', async (req, res) => {
        const { signal_id, vote } = req.body; // vote: 'human' | 'slop'
        const auditor_id = req.user.id;

        if (!signal_id || !vote || !['human', 'slop'].includes(vote)) {
            return res.status(400).json({ error: 'Invalid signal_id or vote' });
        }

        try {
            // Record vote
            await pool.query(
                'INSERT INTO audits (signal_id, auditor_id, vote) VALUES ($1, $2, $3)',
                [signal_id, auditor_id, vote]
            );

            // Check for Consensus
            const votes = await pool.query(
                'SELECT vote, COUNT(*) as count FROM audits WHERE signal_id = $1 GROUP BY vote',
                [signal_id]
            );

            let humanVotes = 0;
            let slopVotes = 0;
            votes.rows.forEach(row => {
                if (row.vote === 'human') humanVotes = parseInt(row.count);
                if (row.vote === 'slop') slopVotes = parseInt(row.count);
            });

            const totalVotes = humanVotes + slopVotes;
            const CONSENSUS_THRESHOLD = 0.7; // 70% match required

            let consensus = null;

            if (totalVotes >= 3) {
                const humanRatio = humanVotes / totalVotes;
                const slopRatio = slopVotes / totalVotes;

                if (humanRatio >= CONSENSUS_THRESHOLD) consensus = 'human';
                else if (slopRatio >= CONSENSUS_THRESHOLD) consensus = 'slop';
            }

            // Calculate Reward
            let reward = 1; // Base reward

            // Determine aura reason based on consensus match
            let auraReason = 'audit_correct'; // default

            if (consensus) {
                const auditor = await pool.query('SELECT aura_score FROM profiles WHERE id = $1', [auditor_id]);
                const auditorAura = auditor.rows[0]?.aura_score || 0;

                let multiplier = 1;
                if (auditorAura > 1000) multiplier = 1.5;
                if (auditorAura > 5000) multiplier = 2;

                const bonus = AuraService.calculateAuditReward(vote, consensus);
                reward += (bonus * multiplier);

                // Set correct aura reason
                auraReason = (vote === consensus) ? 'audit_correct' : 'audit_incorrect';

                // Update signal consensus if determined
                await pool.query(
                    'UPDATE signals SET consensus = $1 WHERE id = $2 AND consensus IS NULL',
                    [consensus, signal_id]
                );
            }

            // Update User Aura
            await pool.query(
                'UPDATE profiles SET aura_score = aura_score + $1 WHERE id = $2',
                [Math.round(reward), auditor_id]
            );

            // Log Aura with correct enum value
            await pool.query(
                'INSERT INTO aura_log (user_id, delta, reason, reference_id) VALUES ($1, $2, $3, $4)',
                [auditor_id, Math.round(reward), auraReason, signal_id]
            );

            res.status(201).json({ aura_change: Math.round(reward), consensus });
        } catch (err) {
            if (err.code === '23505') { // Unique constraint violation
                return res.status(400).json({ error: 'Already voted on this signal' });
            }
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    // GET /api/audits/history
    router.get('/history', async (req, res) => {
        const auditor_id = req.user.id;

        try {
            const result = await pool.query(`
                SELECT a.id, a.signal_id, a.vote, a.created_at,
                       s.consensus, s.video_url,
                       al.delta as aura_change
                FROM audits a
                JOIN signals s ON a.signal_id = s.id
                LEFT JOIN aura_log al ON al.user_id = a.auditor_id 
                    AND al.reference_id = a.signal_id 
                    AND al.reason IN ('audit_correct', 'audit_incorrect')
                WHERE a.auditor_id = $1
                ORDER BY a.created_at DESC
                LIMIT 50
            `, [auditor_id]);

            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    return router;
};
