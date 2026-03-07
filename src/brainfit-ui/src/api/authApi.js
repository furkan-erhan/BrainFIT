import axiosInstance from './axiosInstance';

export const authApi = {
    /**
     * Logs in a user. Uses mock data if the API is not ready.
     * @param {import('./authApi.types').LoginRequest & { mockRole?: 'User' | 'Admin' }} data 
     * @returns {Promise<import('./authApi.types').AuthUser>}
     */
    login: async (data) => {
        try {
            // Try real API first (if it exists)
            const response = await axiosInstance.post('/auth/login', {
                username: data.username,
                password: data.password
            });
            return response.data || response;
        } catch (error) {
            console.warn('Backend Auth API not found or failed, simulating login with mock data.');
            // Fallback to mock login
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!data.username || !data.password) {
                        reject(new Error('Username and password are required'));
                        return;
                    }

                    const mockUser = {
                        id: Math.random().toString(36).substr(2, 9),
                        username: data.username,
                        role: data.mockRole || 'User', // Allows us to easily test Admin role
                        token: 'mock-jwt-token-12345'
                    };
                    resolve(mockUser);
                }, 800);
            });
        }
    }
};
