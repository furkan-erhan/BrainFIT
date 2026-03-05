import axiosInstance from './axiosInstance';

// Mock data for initial testing and backend bridge
const mockQuizzes = [
    {
        id: '1',
        title: 'General Knowledge Trivia',
        description: 'Test your knowledge on various topics from history to science.',
        createdDate: new Date().toISOString(),
        questionCount: 15
    },
    {
        id: '2',
        title: 'React Hooks Mastery',
        description: 'How well do you know useEffect, useMemo, and custom hooks?',
        createdDate: new Date().toISOString(),
        questionCount: 10
    },
    {
        id: '3',
        title: 'Pop Culture 2024',
        description: 'The latest trends, movies, and music from this year.',
        createdDate: new Date().toISOString(),
        questionCount: 12
    }
];

export const quizApi = {
    /**
     * Fetches all available quizzes
     * @returns {Promise<import('./quizApi.types').Quiz[]>}
     */
    getQuizzes: async () => {
        try {
            // Try real API first
            const response = await axiosInstance.get('/quizzes');
            return response.data || response; // Interceptor returns data
        } catch (error) {
            console.warn('Backend API not found or failed, using mock data for development.');
            // Fallback to mock data for development
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockQuizzes), 800);
            });
        }
    },

    /**
     * Creates a new quiz
     * @param {import('./quizApi.types').CreateQuizRequest} data 
     * @returns {Promise<import('./quizApi.types').Quiz>}
     */
    createQuiz: async (data) => {
        try {
            const response = await axiosInstance.post('/quizzes', data);
            return response.data || response;
        } catch (error) {
            console.warn('Backend API not found or failed, simulating creation with mock data.');
            return new Promise((resolve) => {
                const newQuiz = {
                    ...data,
                    id: Math.random().toString(36).substr(2, 9),
                    createdDate: new Date().toISOString(),
                    questionCount: 0
                };
                setTimeout(() => resolve(newQuiz), 1000);
            });
        }
    }
};
