import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { FaUserFriends, FaPlay, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { quizApi } from '../../api/quizApi';

const QuizLobby = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const connectionRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const initLobby = async () => {
            try {
                // 1. Fetch Quiz Details
                const quizData = await quizApi.getQuizById(quizId);
                if (isMounted) {
                    setQuiz(quizData); 
                    
                    // Add current user to local state immediately
                    if (user && user.username) {
                        setPlayers(prev => [...new Set([...prev, user.username])]);
                    }
                }

                // 2. Establish SignalR Connection
                const newConnection = new HubConnectionBuilder()
                    .withUrl('/quizHub', {
                        accessTokenFactory: () => user?.token || ''
                    })
                    .withAutomaticReconnect()
                    .build();

                connectionRef.current = newConnection;

                // 3. Define Hub Events
                newConnection.on("LobbyUpdated", (currentUsers) => {
                    // SignalR now sends the entire list of users in the room
                    setPlayers(currentUsers);
                });

                newConnection.on("QuizStarted", () => {
                    navigate(`/gameplay/${quizId}`);
                });

                newConnection.on("StartQuizError", (errorMessage) => {
                    alert(`Cannot start quiz: ${errorMessage}`);
                });

                // 4. Start Connection
                await newConnection.start();
                
                // 5. Join Group
                if (user && user.username) {
                    await newConnection.invoke("JoinLobby", quizId, user.username);
                }

                if (isMounted) setLoading(false);

            } catch (err) {
                console.error("Lobby Init Error:", err);
                if (isMounted) {
                    setError(`Failed to connect to the lobby. Error: ${err.message || err.toString()}`);
                    setLoading(false);
                }
            }
        };

        if (quizId && user) {
            initLobby();
        }

        // Cleanup on unmount
        return () => {
            isMounted = false;
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };
    }, [quizId, user]);

    const handleStartQuiz = async () => {
        if (!isAdmin || !connectionRef.current) return;
        
        try {
            await connectionRef.current.invoke("StartQuiz", quizId);
        } catch (err) {
            if (err.message && (err.message.includes("canceled") || err.message.includes("closed"))) {
                console.log("StartQuiz invocation canceled locally due to rapid navigation. This is expected.");
                return;
            }
            console.error("Failed to start quiz:", err);
            alert(`Could not start the quiz: ${err.message || err}`);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <FaSpinner className="animate-spin text-5xl text-primary mb-4" />
                <p className="text-xl font-bold text-gray-600 animate-pulse">Connecting to Lobby...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 shadow-sm">
                    <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
                    <p>{error}</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-semibold transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center text-white relative">
                    <h1 className="text-4xl font-black mb-2">{quiz?.title || 'Loading Quiz...'}</h1>
                    <p className="opacity-90 font-medium text-lg">Waiting for players to join...</p>
                    
                    {/* Participant Counter */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 font-bold">
                        <FaUserFriends /> {players.length}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        
                        {/* Player List */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                                Joined Players
                                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{players.length} waiting</span>
                            </h2>
                            
                            <ul className="space-y-3">
                                {players.map((playerName, index) => (
                                    <li 
                                        key={index}
                                        className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 animate-fade-in-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold uppercase">
                                            {playerName.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-gray-700">{playerName}</span>
                                        {playerName === user?.username && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-bold ml-auto">You</span>
                                        )}
                                    </li>
                                ))}
                                {players.length === 0 && (
                                    <li className="text-gray-400 italic text-center py-4">It's a bit empty here...</li>
                                )}
                            </ul>
                        </div>

                        {/* Host Controls */}
                        <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            {isAdmin ? (
                                <>
                                    <p className="text-center text-gray-600 mb-6 font-medium">As the host, you can start the quiz when everyone is ready.</p>
                                    <button 
                                        onClick={handleStartQuiz}
                                        disabled={players.length === 0}
                                        className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black text-white text-lg transition-all transform hover:scale-105 shadow-lg ${players.length > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30' : 'bg-gray-400 cursor-not-allowed shadow-none'}`}
                                    >
                                        <FaPlay /> START QUIZ
                                    </button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <h3 className="font-bold text-gray-800 mb-2">Waiting for Host</h3>
                                    <p className="text-gray-500 text-sm">The quiz will start automatically when the host is ready.</p>
                                </div>
                            )}
                            
                            {/* Room Code Info */}
                            <div className="mt-8 pt-6 border-t border-gray-200 w-full text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Room Code</p>
                                <p className="text-lg font-mono font-black text-primary select-all">{quizId}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizLobby;
