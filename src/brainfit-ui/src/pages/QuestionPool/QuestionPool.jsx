import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTimes, FaCheck, FaSpinner, FaBookOpen, FaLayerGroup, FaStar } from 'react-icons/fa';
import { questionApi } from '../../api/questionApi';
import { quizApi } from '../../api/quizApi';
import { useAuth } from '../../context/AuthContext';

const DIFFICULTY_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const DIFFICULTY_COLORS = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-yellow-100 text-yellow-700',
    3: 'bg-red-100 text-red-700'
};

const PREDEFINED_CATEGORIES = ['General', 'Mathematics', 'Physics', 'Coding', 'Science', 'History', 'Geography', 'Art'];

const defaultForm = {
    text: '',
    categoryId: '',
    difficultyLevel: 1,
    basePoint: 100,
    timeLimitInSeconds: 20,
    options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]
};

const QuestionPool = () => {
    const { isAdmin } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTab, setActiveTab] = useState('pool'); // 'pool' | 'create'
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // For "Add to Quiz" modal
    const [addModalQuestion, setAddModalQuestion] = useState(null);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [addingToQuiz, setAddingToQuiz] = useState(false);
    const [addFeedback, setAddFeedback] = useState('');

    useEffect(() => {
        fetchPool();
        fetchQuizzes();
    }, []);

    const fetchPool = async () => {
        setLoading(true);
        const data = await questionApi.getPool();
        setQuestions(data);
        setLoading(false);
    };

    const fetchQuizzes = async () => {
        const data = await quizApi.getQuizzes();
        setQuizzes(data);
    };

    const handleOptionChange = (idx, field, value) => {
        const newOptions = form.options.map((opt, i) => {
            if (field === 'isCorrect') {
                return { ...opt, isCorrect: i === idx };
            }
            if (i === idx) return { ...opt, [field]: value };
            return opt;
        });
        setForm({ ...form, options: newOptions });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (form.options.filter(o => o.text.trim()).length !== 4) {
            setErrorMsg('Please fill in all 4 option texts.');
            return;
        }
        setSubmitting(true);
        try {
            await questionApi.createQuestion({
                ...form,
                difficultyLevel: parseInt(form.difficultyLevel),
                basePoint: parseInt(form.basePoint),
                timeLimitInSeconds: parseInt(form.timeLimitInSeconds)
            });
            setSuccessMsg('Question created successfully and added to the pool!');
            setForm(defaultForm);
            fetchPool();
            setTimeout(() => setActiveTab('pool'), 1500);
        } catch (err) {
            setErrorMsg(err.message || 'Failed to create question.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddToQuiz = async () => {
        if (!selectedQuizId || !addModalQuestion) return;
        setAddingToQuiz(true);
        setAddFeedback('');
        try {
            await questionApi.addToQuiz(selectedQuizId, addModalQuestion.id);
            setAddFeedback('✓ Question added to quiz!');
            setTimeout(() => {
                setAddModalQuestion(null);
                setSelectedQuizId('');
                setAddFeedback('');
            }, 1500);
        } catch (err) {
            setAddFeedback('✗ ' + (err.message || 'Failed to add'));
        } finally {
            setAddingToQuiz(false);
        }
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            q.categoryId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || q.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (!isAdmin) {
        return (
            <div className="max-w-3xl mx-auto py-24 text-center px-4">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-black text-gray-700">Admin Only Area</h2>
                <p className="text-gray-500 mt-2">You need admin permissions to manage the question pool.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
                        <FaLayerGroup className="text-primary" />
                        Question <span className="text-primary italic">Pool</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Create reusable questions and assign them to any quiz.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
                    <button
                        onClick={() => setActiveTab('pool')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'pool' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FaBookOpen className="inline mr-2" />
                        Browse Pool ({questions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'create' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FaPlus className="inline mr-2" />
                        Create Question
                    </button>
                </div>
            </div>

            {/* --- POOL TAB --- */}
            {activeTab === 'pool' && (
                <div>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-all shadow-sm font-medium"
                            />
                        </div>
                        <div className="md:w-64">
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full h-full px-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-all shadow-sm font-bold text-gray-700"
                            >
                                <option value="All">All Categories</option>
                                {PREDEFINED_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
                            <p className="font-bold text-gray-400 animate-pulse">Loading question pool...</p>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-gray-700">No questions found</h3>
                            <p className="text-gray-400 mt-2">
                                {searchTerm ? 'Try a different search term.' : 'Create your first question!'}
                            </p>
                            <button
                                onClick={() => setActiveTab('create')}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                + Create a question →
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {filteredQuestions.map((q, idx) => (
                                <div key={q.id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-bold text-gray-800 text-lg leading-snug flex-1">{q.text}</p>
                                        <span className={`shrink-0 text-xs font-black px-3 py-1 rounded-full uppercase ${DIFFICULTY_COLORS[q.difficultyLevel] || 'bg-gray-100 text-gray-600'}`}>
                                            {DIFFICULTY_LABELS[q.difficultyLevel] || `Lvl ${q.difficultyLevel}`}
                                        </span>
                                    </div>

                                    {q.categoryId && (
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit uppercase tracking-wide">
                                            {q.categoryId}
                                        </span>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        {(q.options || []).map((opt, oi) => (
                                            <div key={oi} className={`flex items-center gap-2 text-sm p-2 rounded-lg border ${opt.isCorrect ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                                {opt.isCorrect ? <FaCheck className="shrink-0 text-green-500" /> : <span className="w-3" />}
                                                {opt.text}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex gap-4 text-xs font-medium text-gray-400">
                                            <span><FaStar className="inline text-yellow-400 mr-1" />{q.basePoint || 100} pts</span>
                                            <span>⏱ {q.timeLimitInSeconds || 20}s</span>
                                        </div>
                                        <button
                                            onClick={() => { setAddModalQuestion(q); setSelectedQuizId(''); setAddFeedback(''); }}
                                            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <FaPlus /> Add to Quiz
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- CREATE TAB --- */}
            {activeTab === 'create' && (
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Create New Question</h2>
                        <p className="text-gray-500 font-medium mb-8">
                            Questions in the pool can be reused across multiple quizzes.
                        </p>

                        {successMsg && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-sm flex items-center gap-3">
                                <FaCheck /> {successMsg}
                            </div>
                        )}
                        {errorMsg && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-sm flex items-center gap-3">
                                <FaTimes /> {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                            {/* Question text */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Question Text *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.text}
                                    onChange={e => setForm({ ...form, text: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none transition-all font-medium resize-none"
                                    placeholder="What is the capital of France?"
                                />
                            </div>

                            {/* Row: Category, Difficulty, Points, Time */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
                                    <select
                                        value={form.categoryId}
                                        onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none text-sm font-medium"
                                    >
                                        <option value="">Select Category</option>
                                        {PREDEFINED_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Difficulty</label>
                                    <select
                                        value={form.difficultyLevel}
                                        onChange={e => setForm({ ...form, difficultyLevel: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none text-sm font-medium"
                                    >
                                        <option value={1}>Easy</option>
                                        <option value={2}>Medium</option>
                                        <option value={3}>Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Base Points</label>
                                    <input
                                        type="number"
                                        min={10}
                                        max={1000}
                                        value={form.basePoint}
                                        onChange={e => setForm({ ...form, basePoint: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Time (s)</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={120}
                                        value={form.timeLimitInSeconds}
                                        onChange={e => setForm({ ...form, timeLimitInSeconds: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Options */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Answer Options * <span className="text-xs font-medium text-gray-400">(Select the correct one)</span></label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {form.options.map((opt, idx) => (
                                        <div key={idx} className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                                            onClick={() => handleOptionChange(idx, 'isCorrect', true)}
                                        >
                                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-500'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={opt.text}
                                                onClick={e => e.stopPropagation()}
                                                onChange={e => handleOptionChange(idx, 'text', e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                className="flex-1 bg-transparent outline-none font-medium text-gray-700 placeholder-gray-400"
                                            />
                                            {opt.isCorrect && <FaCheck className="shrink-0 text-green-500 text-sm" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 text-lg"
                            >
                                {submitting ? (
                                    <><FaSpinner className="animate-spin" /> Creating...</>
                                ) : (
                                    <><FaPlus /> Create & Add to Pool</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ADD TO QUIZ MODAL --- */}
            {addModalQuestion && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-gray-800">Add to Quiz</h3>
                            <button onClick={() => setAddModalQuestion(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                            <p className="font-bold text-gray-700 leading-snug">{addModalQuestion.text}</p>
                        </div>

                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Quiz</label>
                        <select
                            value={selectedQuizId}
                            onChange={e => setSelectedQuizId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none font-medium mb-6"
                        >
                            <option value="">-- Choose a quiz --</option>
                            {quizzes.map(quiz => (
                                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                            ))}
                        </select>

                        {addFeedback && (
                            <div className={`mb-4 p-3 rounded-xl text-sm font-bold ${addFeedback.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {addFeedback}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setAddModalQuestion(null)}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddToQuiz}
                                disabled={!selectedQuizId || addingToQuiz}
                                className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {addingToQuiz ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                                Add to Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionPool;
