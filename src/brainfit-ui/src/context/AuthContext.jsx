import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

// Create Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check valid session on load
    useEffect(() => {
        const storedUser = localStorage.getItem('brainfit_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('brainfit_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const loggedInUser = await authApi.login(credentials);
        setUser(loggedInUser);
        localStorage.setItem('brainfit_user', JSON.stringify(loggedInUser));
        return loggedInUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('brainfit_user');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        login,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
