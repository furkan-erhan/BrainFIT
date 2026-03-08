import axiosInstance from './axiosInstance';

export const quizApi = {
    /**
     * Fetches all available quizzes
     * @returns {Promise<import('./quizApi.types').Quiz[]>}
     */
    getQuizzes: async () => {
        const result = await axiosInstance.get('/quizzes');
        if (!result.success) {
            console.error('Failed to fetch quizzes:', result.message);
            return [];
        }
        return result.data || [];
    },

    /**
     * Creates a new quiz
     * @param {import('./quizApi.types').CreateQuizRequest} data 
     * @returns {Promise<import('./quizApi.types').Quiz>}
     */
    createQuiz: async (data) => {
        const result = await axiosInstance.post('/quizzes', data);
        if (!result.success) {
            throw new Error(result.message || 'Failed to create quiz');
        }
        // The API returns Result<Guid>
        return {
            id: result.data,
            ...data,
            createdDate: new Date().toISOString(),
            questionCount: 0
        };
    },

    /**
     * Deletes a quiz by ID
     * @param {string} id 
     * @returns {Promise<boolean>}
     */
    deleteQuiz: async (id) => {
        const result = await axiosInstance.delete(`/quizzes/${id}`);
        return result.success;
    },

    /**
     * Fetches a question by ID (with its options)
     * @param {string} id 
     * @returns {Promise<any>}
     */
    getQuestion: async (id) => {
        const result = await axiosInstance.get(`/questions/${id}`);
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch question');
        }
        return result.data;
    },

    /**
     * Submits an answer and returns the result (isCorrect, score)
     * @param {any} data 
     * @returns {Promise<any>}
     */
    submitAnswer: async (data) => {
        const result = await axiosInstance.post('/questions', data);
        if (!result.success) {
            throw new Error(result.message || 'Failed to submit answer');
        }
        return result.data;
    }
};
