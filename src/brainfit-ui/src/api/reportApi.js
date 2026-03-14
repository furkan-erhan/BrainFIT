import axiosInstance from './axiosInstance';

export const reportApi = {
    /**
     * Submits the final quiz result for a user
     * @param {object} data - { quizId, userName, totalScore, totalSecondsElapsed, sessionId }
     * @returns {Promise<any>}
     */
    submitResult: async (data) => {
        const result = await axiosInstance.post('/reports/submit', data);
        if (result && (result.success || result.Success)) {
            return result.data || result.Data;
        }
        throw new Error(result?.message || 'Failed to submit result');
    },

    /**
     * Fetches the leaderboard for a specific quiz and session
     * @param {string} quizId 
     * @param {string} sessionId 
     * @returns {Promise<any[]>}
     */
    getLeaderboard: async (quizId, sessionId) => {
        const url = sessionId 
            ? `/reports/leaderboard/${quizId}?sessionId=${sessionId}`
            : `/reports/leaderboard/${quizId}`;
        try {
            const result = await axiosInstance.get(url);
            // Result is { success, data, message }
            if (result && (result.success || result.Success)) {
                return result.data || result.Data || [];
            }
            console.error('Leaderboard error:', result?.message);
            return [];
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
            return [];
        }
    }
};
