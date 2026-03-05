import React from 'react';
import { FaRegClock, FaRegQuestionCircle } from 'react-icons/fa';

const QuizCard = ({ quiz }) => {
    // Generate a Kahoot-like gradient based on ID or index
    const gradients = [
        'from-blue-500 to-indigo-600',
        'from-red-500 to-pink-600',
        'from-green-500 to-emerald-600',
        'from-yellow-500 to-orange-600',
        'from-purple-500 to-fuchsia-600'
    ];
    const gradientClass = gradients[parseInt(quiz.id || '0') % gradients.length];

    const formattedDate = new Date(quiz.createdDate).toLocaleDateString();

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 flex flex-col h-full group">
            {/* Top Gradient Area */}
            <div className={`h-24 bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-3xl opacity-90 group-hover:opacity-100 transition-opacity`}>
                <FaRegQuestionCircle />
            </div>

            {/* Content */}
            <div className="p-5 flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
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
