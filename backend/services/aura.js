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
     * @param {Object} submissionTime - Date object
     * @param {Object} questActiveAt - Date object
     * @param {Object} questExpiresAt - Date object
     */
    calculateSubmissionReward(submissionTime, questActiveAt, questExpiresAt) {
        let bonus = 0;
        const now = new Date(submissionTime).getTime();
        const start = new Date(questActiveAt).getTime();
        const end = new Date(questExpiresAt).getTime();

        // Timing Bonus
        const minutesFromStart = (now - start) / 60000;
        const minutesUntilEnd = (end - now) / 60000;

        if (minutesFromStart <= 10) bonus += this.CONSTANTS.TIMING_BONUS.FIRST_10_MIN;
        if (minutesUntilEnd <= 10) bonus += this.CONSTANTS.TIMING_BONUS.LAST_10_MIN;

        return this.CONSTANTS.BASE_PER_SIGNAL + bonus;
    },

    /**
     * Calculate audit reward based on consensus
     * @param {string} userVote - 'human' | 'slop'
     * @param {string} consensus - 'human' | 'slop'
     */
    calculateAuditReward(userVote, consensus) {
        if (!consensus) return 0; // No consensus yet

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
     * Check for consistency bonus
     * @param {Object} pool - DB Pool
     * @param {string} userId 
     */
    async checkConsistencyBonus(pool, userId) {
        // Check if user posted in last 5 consecutive days
        // simplified for this mock: just return 0 or logic placeholder
        return 0;
    }
};

module.exports = AuraService;
