import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { FaSpinner, FaTrophy, FaCheckCircle, FaTimesCircle, FaClock, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { quizApi } from '../../api/quizApi';
import { reportApi } from '../../api/reportApi';

const Gameplay = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [connection, setConnection] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [currentScore, setCurrentScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answerResult, setAnswerResult] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timerRef = useRef(null);
    const questionStartTimeRef = useRef(null);
    const timeLimitRef = useRef(0);

    // Initialize SignalR
    useEffect(() => {
        let isMounted = true;
        const initGame = async () => {
            try {
                const newConnection = new HubConnectionBuilder()
                    .withUrl('/quizHub', {
                        accessTokenFactory: () => user?.token || ''
                    })
                    .withAutomaticReconnect()
                    .build();

                newConnection.on("QuizStarted", (sid) => {
                    if (isMounted) {
                        setSessionId(sid);
                    }
                });

                newConnection.on("ReceiveQuestion", (question, sid) => {
                    console.log("[Gameplay] Received ReceiveQuestion:", question, "Session:", sid);
                    if (isMounted) {
                        if (sid) setSessionId(sid);
                        setCurrentQuestion(question);
                        setSelectedOption(null);
                        setAnswerResult(null);
                        const timeLimit = question.timeLimitInSeconds || 20;
                        const elapsed = question.elapsedSeconds || 0;
                        setTimeRemaining(timeLimit - elapsed);
                        timeLimitRef.current = timeLimit;
                        questionStartTimeRef.current = Date.now() - (elapsed * 1000);
                        
                        startTimer(timeLimit);
                    }
                });

                newConnection.on("RealTimeLeaderboardUpdate", (standings) => {
                    if (isMounted) {
                        setLeaderboard(standings);
                    }
                });

                newConnection.on("AnswerResult", (result) => {
                    if (isMounted) {
                        setAnswerResult(result);
                        if (result.isCorrect) {
                            setCurrentScore(prev => prev + result.score);
                        }
                    }
                });

                newConnection.on("QuizFinished", async () => {
                    console.log("[Gameplay] Received QuizFinished Signal");
                    if (isMounted) {
                        setIsFinished(true); // Always show finished screen immediately
                        try {
                            await submitFinalResults();
                        } catch (err) {
                            console.error("[Gameplay] Error submitting final results on finish:", err);
                        }
                        // Fetch the ultimate official leaderboard
                        setTimeout(() => fetchLeaderboard(), 500);
                    }
                });

                await newConnection.start();
                if (user?.username) {
                    await newConnection.invoke("JoinLobby", quizId, user.username);
                }

                if (isMounted) {
                    setConnection(newConnection);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Gameplay Init Error:", err);
                if (isMounted) {
                    setError("Lost connection to the game server. Please refresh.");
                    setLoading(false);
                }
            }
        };

        if (quizId && user) {
            initGame();
        }

        return () => {
            isMounted = false;
            stopTimer();
            if (connection) {
                connection.stop();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId, user]);

    // Removed the old useEffect for isFinished, as its logic is now in submitFinalResults and fetchLeaderboard

    const startTimer = (limit) => {
        stopTimer();
        timerRef.current = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = (now - questionStartTimeRef.current) / 1000;
            const remaining = Math.max(0, limit - elapsedSeconds);
            
            setTimeRemaining(remaining);
            
            if (remaining <= 0) {
                stopTimer();
                handleTimeUp();
            }
        }, 100); // 100ms precision for smooth progress bar
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleTimeUp = async () => {
        if (selectedOption || isAdmin) return; 
        // Auto-submit empty if not admin
        // For simplicity, we just mark it wrong if time is up and no selection
        // The AnswerResult listener will handle the actual result from the server
        try {
            if (connection) {
                await connection.invoke("SubmitAnswer", quizId, currentQuestion.id, null, timeLimitRef.current); // Submit null for no answer
            }
        } catch (err) {
            console.error("Failed to submit null answer via hub:", err);
        }
    };

    const handleOptionSelect = async (optionId) => {
        if (selectedOption || timeRemaining <= 0 || isAdmin) return; 
        
        stopTimer();
        setSelectedOption(optionId);
        
        const now = Date.now();
        const secondsElapsed = Math.floor((now - questionStartTimeRef.current) / 1000);

        try {
            // Use SignalR instead of REST API for real-time score sync
            if (connection) {
                await connection.invoke("SubmitAnswer", quizId, currentQuestion.id, optionId, secondsElapsed);
            }
        } catch (err) {
            console.error("Failed to submit answer via hub:", err);
            // Fallback to REST if hub fails? (Optional)
        }
    };

    const handleNextQuestion = async () => {
        if (!isAdmin || !connection) return;
        try {
            await connection.invoke("NextQuestion", quizId);
        } catch (err) {
            console.error("Failed to go to next question:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <FaSpinner className="animate-spin text-5xl text-primary mb-4" />
                <p className="text-xl font-bold text-gray-600 animate-pulse">Waiting for game to start...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
                    <p className="font-bold">{error}</p>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in-up">
                <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100">
                    <FaTrophy className="text-6xl text-yellow-400 mx-auto mb-6" />
                    <h1 className="text-5xl font-black text-gray-800 mb-4">Quiz Finished!</h1>
                    <p className="text-2xl font-bold text-gray-600 mb-8">Your Final Score: <span className="text-primary">{currentScore}</span></p>
                    
                    {/* Leaderboard Section */}
                    <div className="mb-10 overflow-hidden">
                        <h3 className="text-2xl font-black text-secondary mb-6 flex items-center justify-center gap-3">
                            <span className="w-10 h-[2px] bg-gray-200"></span>
                            SESSION LEADERBOARD
                            <span className="w-10 h-[2px] bg-gray-200"></span>
                        </h3>
                        
                        {isSubmitting ? (
                            <div className="flex flex-col items-center py-6">
                                <FaSpinner className="animate-spin text-3xl text-primary mb-2" />
                                <p className="font-bold text-gray-400">Updating standings...</p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 text-left">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-gray-400 text-sm font-black uppercase tracking-widest border-b border-gray-200">
                                            <th className="pb-4 pl-4">Rank</th>
                                            <th className="pb-4">Player</th>
                                            <th className="pb-4 text-right pr-4">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {leaderboard.map((entry, idx) => (
                                            <tr key={idx} className={entry.userName === user?.username ? "bg-primary/5 font-bold" : ""}>
                                                <td className="py-4 pl-4">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-300 text-white' : idx === 2 ? 'bg-orange-400 text-white' : 'text-gray-500 font-bold'}`}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-gray-700 capitalize">
                                                    {entry.userName}
                                                    {entry.userName === user?.username && <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">YOU</span>}
                                                </td>
                                                <td className="py-4 text-right pr-4 text-secondary font-black">{entry.score}</td>
                                            </tr>
                                        ))}
                                        {leaderboard.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="py-8 text-center text-gray-400 font-medium italic">No results found for this session.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 transform active:scale-95">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 border-8 border-gray-100 border-t-primary rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Get Ready!</h2>
                <p className="text-gray-500 font-medium text-lg">The host is preparing the first question...</p>
            </div>
        );
    }

    // Determine colors for options based on selection and result
    const getOptionClass = (optionId) => {
        const baseClass = "relative flex-1 p-6 rounded-2xl border-b-8 font-bold text-lg md:text-xl transition-all flex items-center justify-center gap-3 overflow-hidden group";
        
        if (!selectedOption) {
            return `${baseClass} bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary active:border-b-0 active:translate-y-2`;
        }
        
        if (selectedOption === optionId) {
            if (answerResult) {
                return answerResult.isCorrect 
                    ? `${baseClass} bg-green-500 border-green-700 text-white` 
                    : `${baseClass} bg-red-500 border-red-700 text-white`;
            }
            return `${baseClass} bg-primary border-primary-dark text-white opacity-80`; // Selected but waiting for result
        }

        return `${baseClass} bg-white border-gray-200 text-gray-400 opacity-50`; // Not selected
    };

    const progressPercentage = (timeRemaining / timeLimitRef.current) * 100;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col md:flex-row gap-8 min-h-[80vh]">
            
            {/* Left Column: Real-time Leaderboard (New Request) */}
            <div className="md:w-1/4 hidden md:block">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
                    <h3 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
                        <FaTrophy className="text-yellow-400" />
                        LIVE STANDINGS
                    </h3>
                    <div className="space-y-3">
                        {leaderboard.map((entry, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${entry.userName === user?.username ? 'bg-primary/5 border-primary/20 scale-105' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-xs font-black text-gray-400 w-4">{idx + 1}</span>
                                    <span className="font-bold text-gray-700 truncate capitalize">{entry.userName}</span>
                                </div>
                                <span className="font-black text-primary text-sm">{entry.score}</span>
                            </div>
                        ))}
                        {leaderboard.length === 0 && (
                            <p className="text-center text-gray-400 py-8 italic font-medium">No scores yet...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Center Column: Question & Options */}
            <div className="flex-1 flex flex-col">
            
            {/* Header: Timer and Score */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
                    <div 
                        className={`h-full transition-all duration-100 ease-linear ${progressPercentage < 20 ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
                    />
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="bg-gray-50 flex items-center gap-3 px-5 py-3 rounded-xl border border-gray-100">
                        <FaClock className={`text-2xl ${timeRemaining < 6 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                        <span className="text-3xl font-black font-mono tracking-tighter text-gray-800">
                            {Math.ceil(timeRemaining)}s
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-xl text-white shadow-md">
                    <span className="font-semibold opacity-90">SCORE</span>
                    <span className="text-3xl font-black tracking-tight">{currentScore}</span>
                </div>
                
                <div className="w-full sm:w-auto text-center sm:text-right font-bold text-gray-400 uppercase tracking-widest text-sm mt-2 sm:mt-0">
                    Question {currentQuestion.questionIndex + 1} / {currentQuestion.totalQuestions}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 mb-8 flex-1 flex flex-col justify-center animate-fade-in-up">
                <h2 className="text-3xl md:text-5xl font-black text-gray-800 text-center leading-tight mb-2">
                    {currentQuestion.text}
                </h2>
                {selectedOption && !answerResult && (
                    <div className="mt-6 flex flex-col items-center animate-pulse">
                        <FaSpinner className="animate-spin text-primary text-2xl mb-2" />
                        <p className="text-primary font-bold">Waiting for next question...</p>
                    </div>
                )}
                {answerResult && (
                    <div className={`mt-6 text-center text-xl font-bold animate-bounce ${answerResult.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {answerResult.isCorrect ? '+ ' + answerResult.score + ' Points!' : 'Incorrect'}
                    </div>
                )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-auto">
                {currentQuestion.options.map((opt, idx) => (
                    <button
                        key={opt.id}
                        disabled={selectedOption !== null || isAdmin || timeRemaining <= 0}
                        onClick={() => handleOptionSelect(opt.id)}
                        className={getOptionClass(opt.id)}
                    >
                        {/* A nice letter indicator A, B, C, D */}
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center font-black text-xl">
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="ml-12">{opt.text}</span>
                        
                        {/* Result Icons */}
                        {selectedOption === opt.id && answerResult && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl animate-scale-in">
                                {answerResult.isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                            </div>
                        )}
                    </button>
                ))}
            </div>

                {/* Host Control placeholder removed as progression is now automatic */}
            </div>
        </div>
    );
};

export default Gameplay;
