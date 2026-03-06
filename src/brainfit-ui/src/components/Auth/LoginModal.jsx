import React, { useState } from 'react';
import { FaTimes, FaUserCircle, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        mockRole: 'User' // Default to User for mock testing
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username.trim() || !formData.password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await login(formData);
            setFormData({ username: '', password: '', mockRole: 'User' });
            onClose();
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all overflow-hidden">
                {/* Top Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner text-white">
                        <FaUserCircle className="text-4xl" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                    <p className="text-primary-100/80 text-sm mt-1">Sign in to manage your knowledge</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="e.g., alex_dev"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                        />
                    </div>

                    {/* MOCK ROLE SELECTOR (For Testing Purposes) */}
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl mt-4">
                        <label className="block text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                            <FaShieldAlt /> Demo Role Select
                        </label>
                        <div className="flex gap-2">
                            <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-semibold transition-all border ${formData.mockRole === 'User' ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="mockRole" value="User" checked={formData.mockRole === 'User'} onChange={handleChange} className="hidden" />
                                User
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-semibold transition-all border ${formData.mockRole === 'Admin' ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="mockRole" value="Admin" checked={formData.mockRole === 'Admin'} onChange={handleChange} className="hidden" />
                                Admin
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
