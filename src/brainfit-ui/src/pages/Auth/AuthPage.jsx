import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { FaUserCircle, FaEnvelope, FaLock, FaUserSecret } from 'react-icons/fa';

const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login({
                    username: formData.username || formData.email,
                    password: formData.password
                });
                navigate('/');
            } else {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                const res = await authApi.register({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                });
                // After registration, auto-login or switch to login
                setIsLogin(true);
                alert('Account created! Please login.');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-4xl w-full border border-gray-100">
                
                {/* Visual Side */}
                <div className="md:w-1/2 bg-gradient-to-br from-primary to-secondary p-12 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-black mb-6 rotate-6 shadow-xl">
                            B
                        </div>
                        <h1 className="text-4xl font-black mb-4 tracking-tighter">BrainFIT</h1>
                        <p className="text-lg opacity-90 font-medium leading-relaxed">
                            {isLogin 
                                ? "Unleash your cognitive potential. Professional training, real-time quizzes, and elite performance tracking."
                                : "Join the ecosystem of elite learners. Create an account to start your cognitive journey today."
                            }
                        </p>
                    </div>
                    
                    {/* Decorative Blobs */}
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"></div>
                </div>

                {/* Form Side */}
                <div className="md:w-1/2 p-10 md:p-14">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-800 mb-2">
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {isLogin ? "Welcome back! Enter your details." : "Get started with your free account."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                                <div className="relative">
                                    <FaUserSecret className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none transition-all font-medium"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                {isLogin ? 'Email or Username' : 'Email Address'}
                            </label>
                            <div className="relative">
                                {isLogin ? <FaUserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /> : <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                                <input
                                    type={isLogin ? "text" : "email"}
                                    name={isLogin ? "username" : "email"}
                                    required
                                    value={isLogin ? formData.username : formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none transition-all font-medium"
                                    placeholder={isLogin ? "Email or username" : "alex@example.com"}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all transform active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </div>
                            ) : (
                                isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-primary font-bold hover:underline"
                            >
                                {isLogin ? 'Register now' : 'Log in here'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
