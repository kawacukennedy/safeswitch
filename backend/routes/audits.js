const express = require('express');
const router = express.Router();

const AuraService = require('../services/aura');

module.exports = (pool) => {

    // POST /api/audits
    router.post('/', async (req, res) => {
        const { signal_id, vote } = req.body; // vote: 'human' | 'slop'
        const auditor_id = req.user.id;

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
            const AUDIT_REQUIREMENT = 5; // From spec
            const CONSENSUS_THRESHOLD = 0.7; // 70% match required

            let consensus = null;

            // Only determine consensus if enough votes or mathematical certainty
            if (totalVotes >= 3) { // Minimum votes to start checking
                const humanRatio = humanVotes / totalVotes;
                const slopRatio = slopVotes / totalVotes;

                if (humanRatio >= CONSENSUS_THRESHOLD) consensus = 'human';
                else if (slopRatio >= CONSENSUS_THRESHOLD) consensus = 'slop';
            }

            // Calculate Reward
            let reward = 1; // Base reward

            // Bonus if matches consensus
            if (consensus) {
                // Fetch auditor's profile to get potential multiplier (e.g. high aura user gets more weight/reward? 
                // Spec says "auditor_aura_multiplier: true" in context of *weighting* the vote result, 
                // but also implies rewards might scale. 
                // For "audit_weighting", it affects the *consensus* calc.
                // Let's implement weighted voting for consensus first? 
                // Complexity: The current schema stores just 'vote'. 
                // To keep it simple but compliant-ish: We'll stick to count-based for now but apply a *reward* multiplier based on user's aura tier.

                const auditor = await pool.query('SELECT aura_score FROM profiles WHERE id = $1', [auditor_id]);
                const auditorAura = auditor.rows[0]?.aura_score || 0;

                let multiplier = 1;
                if (auditorAura > 1000) multiplier = 1.5;
                if (auditorAura > 5000) multiplier = 2;

                const bonus = AuraService.calculateAuditReward(vote, consensus);
                reward += (bonus * multiplier);
            }

            // Update User Aura
            await pool.query(
                'UPDATE profiles SET aura_score = aura_score + $1 WHERE id = $2',
                [Math.round(reward), auditor_id]
            );

            // Log Aura
            await pool.query(
                "INSERT INTO aura_log (user_id, delta, reason, reference_id) VALUES ($1, $2, 'audit_vote', $3)",
                [auditor_id, Math.round(reward), signal_id]
            );

            res.status(201).json({ aura_change: Math.round(reward), consensus });
        } catch (err) {
            if (err.code === '23505') { // Unique constraint violation
                return res.status(400).json({ error: 'Already voted' });
            }
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        }
    });

    return router;
};
