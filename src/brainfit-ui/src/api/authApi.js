import axiosInstance from './axiosInstance';

export const authApi = {
    /**
     * Logs in a user. Uses mock data if the API is not ready.
     * @param {import('./authApi.types').LoginRequest & { mockRole?: 'User' | 'Admin' }} data 
     * @returns {Promise<import('./authApi.types').AuthUser>}
     */
    login: async (data) => {
        try {
            // Try real API first
            const response = await axiosInstance.post('/auth/login', {
                email: data.username || data.email,
                password: data.password
            });
            return response;
        } catch (error) {
             console.error('Login Failed', error);
             throw new Error(error.response?.data?.message || 'Invalid credentials or server error.');
        }
    },

    /**
     * Registers a new user
     * @param {object} data - { username, email, password }
     * @returns {Promise<any>}
     */
    register: async (data) => {
        try {
            const response = await axiosInstance.post('/auth/register', data);
            return response;
        } catch (error) {
            console.error('Registration Failed', error);
            throw new Error(error.response?.data?.message || 'Registration failed.');
        }
    }
};
