import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token header to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('brainfit_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for generic error handling
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
