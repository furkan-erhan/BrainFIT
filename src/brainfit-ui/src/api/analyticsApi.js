import axiosInstance from './axiosInstance';

/**
 * Analytics API module
 * All methods unwrap the Result<T> wrapper returned by the backend.
 */
export const analyticsApi = {
    /**
     * Get the current student's score progression (last N quizzes).
     * @returns {Promise<Array<{quizTitle: string, score: number, date: string}>>}
     */
    getPerformanceTrends: async () => {
        const result = await axiosInstance.get('/analytics/student/performance');
        if (result && (result.success || result.Success)) {
            return result.data ?? result.Data ?? [];
        }
        return [];
    },

    /**
     * Get subject mastery breakdown for the current student.
     * @returns {Promise<Array<{category: string, successRate: number, totalQuestions: number}>>}
     */
    getSubjectMastery: async () => {
        const result = await axiosInstance.get('/analytics/student/mastery');
        if (result && (result.success || result.Success)) {
            return result.data ?? result.Data ?? [];
        }
        return [];
    },

    /**
     * Get summary stats (best/worst category, average score, total quizzes taken).
     * @returns {Promise<{bestCategory, worstCategory, averageScore, totalQuizzesTaken}|null>}
     */
    getSummary: async () => {
        const result = await axiosInstance.get('/analytics/student/summary');
        if (result && (result.success || result.Success)) {
            return result.data ?? result.Data ?? null;
        }
        return null;
    },

    /**
     * Get admin dashboard data (admin only).
     * @returns {Promise<{averageGlobalScore, totalParticipants, hardestQuestions, participationByCategory}|null>}
     */
    getAdminOverview: async () => {
        const result = await axiosInstance.get('/analytics/admin/overview');
        if (result && (result.success || result.Success)) {
            return result.data ?? result.Data ?? null;
        }
        return null;
    },
};
