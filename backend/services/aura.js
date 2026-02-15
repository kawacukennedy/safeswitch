const AuraService = {
    // Constants from specs.json
    CONSTANTS: {
        BASE_PER_SIGNAL: 10,
        AUDIT_VOTE_WEIGHT: {
            HUMAN_MATCH: 2,
            SLOP_MATCH: 2,
            HUMAN_AGAINST: -2,
            SLOP_AGAINST: -2
        },
        CONSENSUS_THRESHOLD: 3, // Number of matching votes needed
        CONSISTENCY_BONUS: {
            DAYS: 5,
            AMOUNT: 50
        },
        TIMING_BONUS: {
            FIRST_10_MIN: 3,
            LAST_10_MIN: 1
        }
    },

    /**
     * Calculate aura change for a new signal submission
     */
    calculateSubmissionReward(submissionTime, questActiveAt, questExpiresAt) {
        let bonus = 0;
        const now = new Date(submissionTime).getTime();
        const start = new Date(questActiveAt).getTime();
        const end = new Date(questExpiresAt).getTime();

        const minutesFromStart = (now - start) / 60000;
        const minutesUntilEnd = (end - now) / 60000;

        if (minutesFromStart <= 10) bonus += this.CONSTANTS.TIMING_BONUS.FIRST_10_MIN;
        if (minutesUntilEnd <= 10) bonus += this.CONSTANTS.TIMING_BONUS.LAST_10_MIN;

        return this.CONSTANTS.BASE_PER_SIGNAL + bonus;
    },

    /**
     * Calculate audit reward based on consensus
     */
    calculateAuditReward(userVote, consensus) {
        if (!consensus) return 0;

        if (userVote === consensus) {
            return userVote === 'human'
                ? this.CONSTANTS.AUDIT_VOTE_WEIGHT.HUMAN_MATCH
                : this.CONSTANTS.AUDIT_VOTE_WEIGHT.SLOP_MATCH;
        } else {
            return userVote === 'human'
                ? this.CONSTANTS.AUDIT_VOTE_WEIGHT.HUMAN_AGAINST
                : this.CONSTANTS.AUDIT_VOTE_WEIGHT.SLOP_AGAINST;
        }
    },

    /**
     * Check for consistency bonus — awards bonus if user posted signals
     * for 5 consecutive days.
     */
    async checkConsistencyBonus(pool, userId) {
        try {
            // Get distinct dates of signal submissions in the last 7 days
            const result = await pool.query(`
                SELECT DISTINCT DATE(created_at) as submission_date
                FROM signals
                WHERE user_id = $1
                  AND created_at >= NOW() - INTERVAL '7 days'
                ORDER BY submission_date DESC
            `, [userId]);

            if (result.rows.length < this.CONSTANTS.CONSISTENCY_BONUS.DAYS) return 0;

            // Check if the last N days are consecutive
            const dates = result.rows.map(r => new Date(r.submission_date));
            let consecutiveDays = 1;

            for (let i = 1; i < dates.length; i++) {
                const diffMs = dates[i - 1].getTime() - dates[i].getTime();
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                if (Math.round(diffDays) === 1) {
                    consecutiveDays++;
                    if (consecutiveDays >= this.CONSTANTS.CONSISTENCY_BONUS.DAYS) {
                        return this.CONSTANTS.CONSISTENCY_BONUS.AMOUNT;
                    }
                } else {
                    consecutiveDays = 1; // Reset streak
                }
            }

            return 0;
        } catch (err) {
            console.error('Consistency bonus check error:', err);
            return 0;
        }
    }
};

module.exports = AuraService;
