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
    },

    /**
     * Fetches question-by-question breakdown for a specific session
     * @param {string} sessionId 
     * @returns {Promise<any[]>}
     */
    getSessionAnswers: async (sessionId) => {
        try {
            const result = await axiosInstance.get(`/reports/session/${sessionId}/answers`);
            if (result && (result.success || result.Success)) {
                return result.data || result.Data || [];
            }
            return [];
        } catch (err) {
            console.error('Failed to fetch session answers:', err);
            return [];
        }
    },

    /**
     * Triggers a CSV download for the leaderboard
     * @param {string} quizId 
     * @param {string} sessionId 
     */
    exportLeaderboardCsv: async (quizId, sessionId) => {
        const url = sessionId 
            ? `/reports/leaderboard/${quizId}/export?sessionId=${sessionId}`
            : `/reports/leaderboard/${quizId}/export`;
        
        try {
            const response = await axiosInstance.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Leaderboard_${quizId}_${sessionId || 'All'}.csv`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Failed to export CSV:', err);
            throw err;
        }
    }
};
