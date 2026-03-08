import React, { useState } from 'react';
import { FaRegClock, FaRegQuestionCircle, FaTrashAlt, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const QuizCard = ({ quiz, onDelete }) => {
    const { isAdmin } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    // Generate a Kahoot-like gradient based on ID or index
    const gradients = [
        'from-blue-500 to-indigo-600',
        'from-red-500 to-pink-600',
        'from-green-500 to-emerald-600',
        'from-yellow-500 to-orange-600',
        'from-purple-500 to-fuchsia-600'
    ];
    // A simple hash function to pick a gradient based on the quiz ID
    const hash = (quiz.id || '').toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradientClass = gradients[hash % gradients.length];

    const formattedDate = new Date(quiz.createdDate).toLocaleDateString();

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
            setIsDeleting(true);
            await onDelete(quiz.id);
            // Let parent handle the state update/unmount
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform ${!isDeleting ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-50'} border border-gray-100 flex flex-col h-full group relative`}>

            {/* Admin Delete Button */}
            {isAdmin && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/20 hover:bg-red-500/90 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-white shadow-sm transition-all focus:outline-none"
                    title="Delete Quiz"
                >
                    {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrashAlt className="text-sm" />}
                </button>
            )}

            {/* Top Gradient Area */}
            <div className={`h-24 bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-3xl opacity-90 group-hover:opacity-100 transition-opacity`}>
                <FaRegQuestionCircle />
            </div>

            {/* Content */}
            <div className="p-5 flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-primary transition-colors pr-6">
                    {quiz.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {quiz.description || 'No description available for this quiz.'}
                </p>
            </div>

            {/* Footer Meta */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1.5">
                    <FaRegQuestionCircle className="text-primary/70" />
                    <span>{quiz.questionCount} Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <FaRegClock className="text-accent/70" />
                    <span>{formattedDate}</span>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;
