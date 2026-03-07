import axiosInstance from './axiosInstance';

export const quizApi = {
    /**
     * Fetches all available quizzes
     * @returns {Promise<import('./quizApi.types').Quiz[]>}
     */
    getQuizzes: async () => {
        return await axiosInstance.get('/quizzes');
    },

    /**
     * Creates a new quiz
     * @param {import('./quizApi.types').CreateQuizRequest} data 
     * @returns {Promise<import('./quizApi.types').Quiz>}
     */
    createQuiz: async (data) => {
        const response = await axiosInstance.post('/quizzes', data);
        // The API returns the ID, but the UI expects the full object.
        return {
            id: response,
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
        await axiosInstance.delete(`/quizzes/${id}`);
        return true;
    },

    /**
     * Fetches a question by ID (with its options)
     * @param {string} id 
     * @returns {Promise<any>}
     */
    getQuestion: async (id) => {
        return await axiosInstance.get(`/questions/${id}`);
    },

    /**
     * Submits an answer and returns the result (isCorrect, score)
     * @param {any} data 
     * @returns {Promise<any>}
     */
    submitAnswer: async (data) => {
        return await axiosInstance.post('/questions', data);
    }
};
