import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { quizApi } from '../../api/quizApi';
import QuizCard from '../../components/QuizCard/QuizCard';
import Spinner from '../../components/Spinner/Spinner';
import CreateQuizModal from '../../components/CreateQuizModal/CreateQuizModal';

const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const data = await quizApi.getQuizzes();
            setQuizzes(data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = async (quizData) => {
        try {
            const newQuiz = await quizApi.createQuiz(quizData);
            setQuizzes([newQuiz, ...quizzes]);
        } catch (error) {
            console.error('Error creating quiz:', error);
        }
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">
                        My <span className="text-primary italic">Brain</span>FIT Quizzes
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Create, manage and play your library of knowledge.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/25 transition-all transform active:scale-95 whitespace-nowrap"
                >
                    <FaPlus /> Create New Quiz
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-10">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search for a quiz topic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Grid Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-500 font-bold animate-pulse">Loading your knowledge base...</p>
                </div>
            ) : filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredQuizzes.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-4 text-gray-300">🔍</div>
                    <h3 className="text-xl font-bold text-gray-800">No quizzes found</h3>
                    <p className="text-gray-500 mt-2 italic text-center px-4">
                        {searchTerm ? `We couldn't find any results for "${searchTerm}"` : "You haven't created any quizzes yet. Start your journey today!"}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 text-primary font-bold hover:underline"
                        >
                            Create your first quiz now &rarr;
                        </button>
                    )}
                </div>
            )}

            {/* Create Modal */}
            <CreateQuizModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateQuiz}
            />
        </div>
    );
};

export default Dashboard;
