import axiosInstance from './axiosInstance';

export const questionApi = {
    /**
     * Fetches all questions from the pool
     * @param {string} [categoryId] - optional category filter
     * @returns {Promise<any[]>}
     */
    getPool: async (categoryId = '') => {
        const url = categoryId
            ? `/questions/pool?categoryId=${categoryId}`
            : `/questions/pool`;
        const result = await axiosInstance.get(url);
        if (result && (result.success || result.Success)) {
            return result.data || result.Data || [];
        }
        console.error('Failed to fetch question pool:', result?.message);
        return [];
    },

    /**
     * Creates a standalone question in the pool
     * @param {object} data - { categoryId, difficultyLevel, text, basePoint, timeLimitInSeconds, options }
     * @returns {Promise<string>} created question ID
     */
    createQuestion: async (data) => {
        const result = await axiosInstance.post('/questions/create', data);
        if (result && (result.success || result.Success)) {
            return result.data || result.Data;
        }
        throw new Error(result?.message || 'Failed to create question');
    },

    /**
     * Adds an existing pool question to a quiz
     * @param {string} quizId 
     * @param {string} questionId 
     * @returns {Promise<void>}
     */
    addToQuiz: async (quizId, questionId) => {
        const result = await axiosInstance.post(`/quizzes/${quizId}/questions/${questionId}`);
        if (!result.success && !result.Success) {
            throw new Error(result?.message || 'Failed to add question to quiz');
        }
    },

    /**
     * Removes a question from a quiz (does NOT delete from pool)
     * @param {string} quizId 
     * @param {string} questionId 
     * @returns {Promise<void>}
     */
    removeFromQuiz: async (quizId, questionId) => {
        const result = await axiosInstance.delete(`/quizzes/${quizId}/questions/${questionId}`);
        if (!result.success && !result.Success) {
            throw new Error(result?.message || 'Failed to remove question from quiz');
        }
    }
};
